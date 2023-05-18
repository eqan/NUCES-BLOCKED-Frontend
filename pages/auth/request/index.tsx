import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import {
    LayoutContext,
    LayoutContextValue,
} from '../../../layout/context/layoutcontext'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import apolloClient from '../../../apollo-client'
import { GET_USER_DATA } from '../../../queries/users/getUser'
import { UPDATE_USER } from '../../../queries/users/updateUsers'
import { useMutation } from '@apollo/client'
import emailjs from 'emailjs-com'
import { toast, Toaster } from 'sonner'
import { Messages } from 'primereact/messages'
import generatePassword from '../../../utils/generateRandomPassword'
import { ThemeContext } from '../../../utils/customHooks/themeContextProvider'

const RequestPage = () => {
    const [email, setEmail] = useState('')
    const [submit, setSubmit] = useState(false)
    const { layoutConfig } = useContext(LayoutContext) as LayoutContextValue
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const router = useRouter()
    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    )
    const { theme } = useContext(ThemeContext)
    const [
        updateUserFunction,
        {
            data: userUpdateData,
            loading: userUpdateLoading,
            error: userUpdateError,
            reset: userUpdateReset,
        },
    ] = useMutation(UPDATE_USER)
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
            detail: 'Invalid Email.',
        })
    }
    let userData = null
    let password = null

    const sendMail = () => {
        emailjs
            .send(
                'service_j0q5w2d', // Replace with your service ID
                'template_cd8qn4s', // Replace with your template ID
                {
                    from_name: 'Shahid',
                    to_email: email,
                    to_name: userData?.name,
                    message: 'Your new password is ' + password,
                },
                'DgOS-LMG3_W6jujL0' // Replace with your user ID
            )
            .then(() => {
                console.log('Email sent successfully!')
            })
            .catch((error) => {
                console.error('Error sending email:', error)
            })
    }
    const Submitted = async () => {
        setSubmit(true)
        if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            console.log(email)
            await apolloClient
                .query({
                    query: GET_USER_DATA,
                    variables: { userEmail: email },
                })
                .then((result) => {
                    console.log(result.data)
                    userData = result.data.GetUserDataByUserEmail
                })
                .catch((error) => {
                    console.log(error)
                })
            const promise = () =>
                new Promise((resolve) => setTimeout(resolve, 4000))
            toast.promise(promise, {
                loading: 'Verifying Email...',
                success: () => {
                    return `Email Sending...`
                },
                error: 'Email is incorrect!',
            })
            if (userData.email == email) {
                password = generatePassword()
                console.log(password)
                sendMail()
                toast.success('Email Sent!')
                await updateUserFunction({
                    variables: {
                        UpdateUserInput: {
                            id: userData.id,
                            email: userData.email,
                            name: userData.name,
                            password: password,
                            type: userData.type,
                            imgUrl: userData.imgUrl,
                            subType: userData.subType,
                        },
                    },
                })
                router.push('/auth/login')
            } else {
                if (!isMessageShown) {
                    addMessages()
                    setIsMessageShown(true)
                }
            }
        }
    }
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src={`${contextPath}/layout/images/logo.png`}
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <Toaster richColors theme={theme} />
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
                                The password will be sent to you via email,
                                <br />
                            </span>
                            <span className="text-600 font-medium">
                                After verification.
                            </span>
                        </div>
                        <div>
                            <Messages ref={msgs} onRemove={clearMessages} />
                            <label
                                htmlFor="email1"
                                className="block text-900 text-xl font-medium mb-2"
                            >
                                Email
                            </label>
                            <InputText
                                type="text"
                                placeholder="Email address"
                                className={`w-full ${classNames({
                                    'p-invalid': submit && !email,
                                    'p-invalid1': submit && email,
                                })}`}
                                style={{ padding: '1rem' }}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                                required
                                autoFocus
                            />
                            {(submit && !email && (
                                <small className="p-invalid">
                                    Email is required.
                                </small>
                            )) ||
                                (submit &&
                                    email &&
                                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                        email
                                    ) && (
                                        <small className="p-invalid1">
                                            Invalid email address. E.g.
                                            example@email.com
                                        </small>
                                    ))}
                            <Button
                                label="Request"
                                className="w-full mt-5 p-3 text-xl"
                                onClick={Submitted}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

RequestPage.getLayout = function getLayout(page) {
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
export default RequestPage
