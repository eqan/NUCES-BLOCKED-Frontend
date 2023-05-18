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
import { Button } from 'primereact/button'
import { ethers } from 'ethers'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { ThemeContext } from '../utils/customHooks/themeContextProvider'

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
    userimg: string | null
}

const AppTopbar = forwardRef((props: AppTopbarProps, ref) => {
    const {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        onMenuToggle,
        showProfileSidebar,
    } = useContext(LayoutContext)
    const menubuttonRef = useRef(null)
    const topbarmenuRef = useRef(null)
    const topbarmenubuttonRef = useRef(null)
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const menu = useRef(null)
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const { setTheme } = useContext(ThemeContext)

    useEffect(() => {
        async function setInitialStates() {
            // Check if MetaMask is installed
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                })
                const chainId = await window.ethereum.request({
                    method: 'eth_chainId',
                })

                if (accounts > 0) {
                    setIsMetaMaskConnected(true)
                } else {
                    setIsMetaMaskConnected(false)
                }
            } else {
                // Show alert if Ethereum provider is not detected
                setIsMetaMaskConnected(false)
            }
            const theme = localStorage.getItem('theme')
            if (theme) {
                switchThemeOnStartup(theme)
            }
        }
        setInitialStates()
    }, [])

    useEffect(() => {}, [isMetaMaskConnected])

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
                setIsMetaMaskConnected(true)
            } catch (err) {
                console.error(err)
            }
        } else {
            console.error('Metamask not found')
        }
    }

    const overlayMenuItems = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: 'http://localhost:3000/',
        },
        {
            label: 'Update Password',
            icon: 'pi pi-replay',
            url: 'http://localhost:3000/auth/updatePassword',
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

    const onThemeChange = (checked: boolean) => {
        if (isDarkMode) {
            changeTheme('saga-blue', 'light')
            localStorage.setItem('theme', 'light')
            setTheme('light') // Update the theme value in the context
        } else {
            changeTheme('arya-blue', 'dark')
            localStorage.setItem('theme', 'dark')
            setTheme('dark') // Update the theme value in the context
        }
        setIsDarkMode(checked)
    }

    const switchThemeOnStartup = (theme) => {
        if (theme == 'dark') {
            setIsDarkMode(true)
            changeTheme('arya-blue', 'dark')
        } else {
            setIsDarkMode(false)
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

            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            <button
                ref={topbarmenubuttonRef}
                type="button"
                className="p-link layout-topbar-menu-button layout-topbar-button"
                onClick={showProfileSidebar}
            >
                <i className="pi pi-ellipsis-v" />
            </button>

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active':
                        layoutState.profileSidebarVisible,
                })}
            >
                <DarkModeSwitch
                    style={{ marginTop: '0.5rem' }}
                    checked={isDarkMode}
                    onChange={onThemeChange}
                    size={30}
                />
                {props.userType === 'ADMIN' && !isMetaMaskConnected ? (
                    <>
                        <Button
                            className="p-link layout-topbar-button"
                            onClick={connectToMetaMask}
                        >
                            <span
                                className="pr-3"
                                style={{ fontWeight: 'bold' }}
                            >
                                Connect Wallet
                            </span>
                            <Avatar
                                image={`${contextPath}/metamask.png`}
                                size="large"
                                shape="circle"
                            ></Avatar>
                        </Button>
                    </>
                ) : (
                    <></>
                )}

                <Menu ref={menu} model={overlayMenuItems} popup />
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={toggleMenu}
                >
                    <span className="pr-8" style={{ fontWeight: 'bold' }}>
                        Profile
                    </span>
                    <Avatar
                        image={`${props.userimg}`}
                        size="large"
                        shape="circle"
                    ></Avatar>
                </button>
            </div>
        </div>
    )
})

export default AppTopbar
