import getConfig from 'next/config'
import Link from 'next/link'
import { classNames } from 'primereact/utils'
import React, {
    forwardRef,
    useContext,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from 'react'
import { LayoutContext } from './context/layoutcontext'
import { Menu } from 'primereact/menu'
import { Avatar } from 'primereact/avatar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { ethers } from 'ethers'

interface Theme {
    name: string
}

interface AppTopbarProps {
    menubuttonRef: React.RefObject<HTMLButtonElement>
    topbarmenuRef: React.RefObject<HTMLDivElement>
    topbarmenubuttonRef: React.RefObject<HTMLButtonElement>
    selectedTheme: String | null
    toggleMenu: (event: React.MouseEvent<HTMLButtonElement>) => void
    onThemeChange: (e: { value: string }) => void
    changeTheme: (theme: string, colorScheme: string) => void
    replaceLink: (
        linkElement: any,
        href: string,
        onComplete: () => void
    ) => void
    applyScale: () => void
    menu: React.RefObject<Menu>
}

const AppTopbar = forwardRef((props: AppTopbarProps, ref) => {
    const { layoutConfig, setLayoutConfig, layoutState, onMenuToggle } =
        useContext(LayoutContext)
    const menubuttonRef = useRef(null)
    const topbarmenuRef = useRef(null)
    const topbarmenubuttonRef = useRef(null)
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const menu = useRef(null)
    const [selectedTheme, setSelectedTheme] = useState<string>(null)
    const [toggleShowMetaMaskButton, setToggleShowMetaMaskButton] =
        useState(true)

    useEffect(() => {
        const theme = localStorage.getItem('theme')
        setSelectedTheme(theme)
        if (sessionStorage.getItem('walletAddress')) {
            setToggleShowMetaMaskButton(false)
        }
        if (theme) {
            switchThemeOnStartup(theme)
        }
    }, [])

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current,
    }))

    const connectToMetaMask = async (event) => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum,
                    'any'
                )
                await provider.send('eth_requestAccounts', [])
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                sessionStorage.setItem('walletAddress', address)
            } catch (err) {
                console.error(err)
            }
        } else {
            console.error('Metamask not found')
            // setProvider(new ethers.providers.getDefaultProvider()) // fallback to a default provider
        }
    }

    const themes: Theme[] = [{ name: 'Dark' }, { name: 'Light' }]

    const overlayMenuItems = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: 'http://localhost:3000/',
        },
        {
            label: 'Log out',
            icon: 'pi pi-sign-out',
            url: 'http://localhost:3000/auth/login',
        },
    ]

    const toggleMenu = (event) => {
        menu.current.toggle(event)
    }

    const onThemeChange = (e) => {
        setSelectedTheme(e.value)
        if (e.value.name == 'Dark') {
            changeTheme('arya-blue', 'dark')
            localStorage.setItem('theme', 'Dark')
        } else {
            changeTheme('saga-blue', 'light')
            localStorage.setItem('theme', 'Light')
        }
    }

    const switchThemeOnStartup = (theme) => {
        if (theme == 'Dark') {
            changeTheme('arya-blue', 'dark')
        } else {
            changeTheme('saga-blue', 'light')
        }
    }

    const changeTheme = (theme, colorScheme) => {
        const themeLink = document.getElementById(
            'theme-css'
        ) as HTMLLinkElement
        const themeHref = themeLink ? themeLink.getAttribute('href') : null
        const newHref = themeHref
            ? themeHref.replace(layoutConfig.theme, theme)
            : null

        replaceLink(themeLink, newHref, () => {
            setLayoutConfig((prevState) => ({
                ...prevState,
                theme,
                colorScheme,
            }))
        })
    }

    const replaceLink = (linkElement, href, onComplete) => {
        if (!linkElement || !href) {
            return
        }
        const id = linkElement.getAttribute('id')
        const cloneLinkElement = linkElement.cloneNode(true)

        cloneLinkElement.setAttribute('href', href)
        cloneLinkElement.setAttribute('id', id + '-clone')

        linkElement.parentNode.insertBefore(
            cloneLinkElement,
            linkElement.nextSibling
        )

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove()

            const element = document.getElementById(id) // re-check
            element && element.remove()

            cloneLinkElement.setAttribute('id', id)
            onComplete && onComplete()
        })
    }

    const applyScale = () => {
        document.documentElement.style.fontSize = `${layoutConfig.scale}px`
    }

    useEffect(() => {
        applyScale()
    }, [layoutConfig.scale])

    return (
        <div className="layout-topbar">
            <div style={{ width: 200 }}>
                <Link href="/">
                    <a className="layout-topbar-logo">
                        <>
                            <img
                                src={`${contextPath}/layout/images/logo.png`}
                                alt="logo"
                            />
                            <span>NUCES BLOCKED</span>
                        </>
                    </a>
                </Link>
            </div>

            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>
            <Dropdown
                value={selectedTheme}
                options={themes}
                onChange={onThemeChange}
                optionLabel="name"
                placeholder={selectedTheme}
            />

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active':
                        layoutState.profileSidebarVisible,
                })}
            >
                {props.userType === 'ADMIN' ? (
                    <>
                        {toggleShowMetaMaskButton ? (
                            <Button
                                className="bg-bluegray-600 hover:bg-bluegray-400 border-bluegray-700"
                                onClick={connectToMetaMask}
                            >
                                <img
                                    alt="logo"
                                    src={`${contextPath}/metamask.png`}
                                    className="h-2rem"
                                />
                                <span style={{ fontWeight: 'bold' }}>
                                    Connect Wallet
                                </span>
                            </Button>
                        ) : (
                            <div />
                        )}
                    </>
                ) : (
                    <div />
                )}

                <Menu ref={menu} model={overlayMenuItems} popup />
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={toggleMenu}
                >
                    <Avatar
                        image={`${props.userimg}`}
                        size="large"
                        shape="circle"
                    ></Avatar>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    )
})

export default AppTopbar
