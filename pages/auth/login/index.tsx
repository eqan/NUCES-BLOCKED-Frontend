import { useMutation } from '@apollo/client'
import Head from 'next/head'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { useContext, useState, useRef, useEffect } from 'react'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import {
    LayoutContext,
    LayoutContextValue,
} from '../../../layout/context/layoutcontext'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import { Messages } from 'primereact/messages'
import Cookies from 'js-cookie'
import { GET_ACCESS_TOKEN } from '../../../queries/auth/getAccessToken'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [checked, setChecked] = useState(false)
    const { layoutConfig } = useContext(LayoutContext) as LayoutContextValue
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const router = useRouter()
    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    )
    const [createAccessToken, { data }] = useMutation(GET_ACCESS_TOKEN)
    const [isMessageShown, setIsMessageShown] = useState(false)
    const msgs = useRef(null)

    const clearMessages = () => {
        msgs.current.clear()
        setIsMessageShown(false)
    }

    const addMessages = () => {
        msgs.current.show({
            sticky: true,
            severity: 'error',
            detail: 'Invalid Email or Password.',
        })
    }

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src={`${contextPath}/layout/images/logo.png`}
                    alt="Sakai logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background:
                            'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 146, 243, 0) 30%)',
                    }}
                >
                    <div
                        className="w-full surface-card py-8 px-5 sm:px-8"
                        style={{ borderRadius: '53px' }}
                    >
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">
                                Welcome to NUCES BLOCKED
                            </div>
                            <span className="text-600 font-medium">
                                Login to continue
                            </span>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                try {
                                    await createAccessToken({
                                        variables: { email, password },
                                    }).then((results) => {
                                        const token = results.data['LoginUser']
                                        Cookies.set(
                                            'access_token',
                                            token['access_token'],
                                            { expires: 1 }
                                        )
                                        router.push('/')
                                    })
                                } catch (e) {
                                    console.log(e)
                                    if (!isMessageShown) {
                                        addMessages()
                                        setIsMessageShown(true)
                                    }
                                }
                            }}
                        >
                            <div>
                                <Messages ref={msgs} onRemove={clearMessages} />
                                <label
                                    htmlFor="email1"
                                    className="block text-900 text-xl font-medium mb-2"
                                >
                                    Email
                                </label>
                                <InputText
                                    id="email"
                                    type="text"
                                    placeholder="Email address"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full md:w-30rem mb-5"
                                    style={{ padding: '1rem' }}
                                />

                                <label
                                    htmlFor="password"
                                    className="block text-900 font-medium text-xl mb-2"
                                >
                                    Password
                                </label>
                                <InputText
                                    id="password"
                                    type="password"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Password"
                                    className="w-full mb-5 w-full p-3 md:w-30rem"
                                ></InputText>

                                <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            id="remeberme"
                                            checked={checked}
                                            onChange={(e) =>
                                                setChecked(e.checked)
                                            }
                                            className="mr-2"
                                        ></Checkbox>
                                        <label htmlFor="rememberme">
                                            Remember me
                                        </label>
                                    </div>
                                    <a
                                        onClick={() =>
                                            router.push('/auth/request')
                                        }
                                        className="font-medium no-underline ml-2 text-right cursor-pointer"
                                        style={{
                                            color: 'var(--primary-color)',
                                        }}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <Button
                                    label="Login"
                                    className="w-full p-3 text-xl"
                                ></Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

LoginPage.getLayout = function getLayout(page) {
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    return (
        <React.Fragment>
            <Head>
                <title>NUCES BLOCKED</title>
                <meta charSet="UTF-8" />
                <meta name="description" content="" />
                <meta name="robots" content="index, follow" />
                <meta
                    name="viewport"
                    content="initial-scale=1, width=device-width"
                />
                <meta property="og:type" content="website"></meta>
                <meta property="og:title" content="NUCES BLOCKED"></meta>
                <meta property="og:description" content="" />
                <meta
                    property="og:image"
                    content="https://live.staticflickr.com/65535/52701824785_51bdbe03fd_h.jpg"
                ></meta>
                <meta property="og:ttl" content="604800"></meta>
                <link
                    rel="icon"
                    href={`${contextPath}/logo.png`}
                    type="image/x-icon"
                ></link>
            </Head>
            {page}
        </React.Fragment>
    )
}
export default LoginPage
