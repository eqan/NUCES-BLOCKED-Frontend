import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useState, useEffect, useRef } from 'react'
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
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../../layout/context/requireAuthetication'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Divider } from 'primereact/divider'
import { Password } from 'primereact/password'
import { toast, Toaster } from 'sonner'
import { Messages } from 'primereact/messages'
import { ThemeContext } from '../../../utils/customHooks/themeContextProvider'

interface Props {
    email: string | null
    id: string | null
    name: string | null
    password: string | null
    type: string | null
    subType: string | null
    imgUrl: string | null
}

interface UpdatePageComponent extends React.FC<Props> {
    getLayout(page: any): any
}

const UpdatePage: UpdatePageComponent = (props) => {
    const { layoutConfig } = useContext(LayoutContext) as LayoutContextValue
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const router = useRouter()
    const [feedback, setFeedback] = useState(true)
    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    )
    const [currentpassword, setCurrentPassword] = useState('')
    const [newpassword, setNewPassword] = useState('')
    const [confirmpassword, setConfirmPassword] = useState('')
    const [submit, setSubmit] = useState(false)
    const [isLastPassMessageShown, setIsLastPassMessageShown] = useState(false)
    const [isNewPassMessageShown, setIsNewPassMessageShown] = useState(false)
    const { theme } = useContext(ThemeContext)
    const lowerCasecheck = new RegExp('^(?=.*[a-z])')
    const upperCasecheck = new RegExp('^(?=.*[A-Z])')
    const numericCheck = new RegExp('^(?=.*[0-9])')
    const symbolCheck = new RegExp('^(?=.*[@$!%*?&])')
    const [
        updateUserFunction,
        {
            data: userUpdateData,
            loading: userUpdateLoading,
            error: userUpdateError,
            reset: userUpdateReset,
        },
    ] = useMutation(UPDATE_USER)
    const msgsLastPass = useRef(null)
    const msgsNewPass = useRef(null)

    useEffect(() => {
        if (!props) {
            router.push('/auth/login')
        } else {
            if (!props.type) {
                router.push('/pages/notfound')
            }
        }
    }, [props])

    const clearLastPassMessages = () => {
        msgsLastPass.current.clear()
        setIsLastPassMessageShown(false)
    }

    const addLastPassMessages = () => {
        msgsLastPass.current.show({
            sticky: true,
            severity: 'error',
            detail: 'Current Password is Incorrect!',
        })
    }

    const clearNewPassMessages = () => {
        msgsNewPass.current.clear()
        setIsNewPassMessageShown(false)
    }

    const addNewPassMessages = () => {
        msgsNewPass.current.show({
            sticky: true,
            severity: 'error',
            detail: "New Password isn't match with Confirm Password.",
        })
    }

    const validatepass = (password: string) => {
        if (password.length > 8) {
            if (lowerCasecheck.test(password) === false) {
                return false
            } else if (upperCasecheck.test(password) === false) {
                return false
            } else if (numericCheck.test(password) === false) {
                return false
            } else if (symbolCheck.test(password) === false) {
                return false
            } else {
                return true
            }
        }
    }

    const Submitted = async () => {
        setSubmit(true)
        if (!currentpassword || !newpassword || !confirmpassword) {
            return
        }
        if (currentpassword != 'Password12') {
            if (!isNewPassMessageShown && !isLastPassMessageShown) {
                addLastPassMessages()
                setIsLastPassMessageShown(true)
            }
            return
        }
        clearLastPassMessages()
        if (newpassword != confirmpassword) {
            if (!isNewPassMessageShown && !isLastPassMessageShown) {
                addNewPassMessages()
                setIsNewPassMessageShown(true)
            }
            return
        }
        clearNewPassMessages()
        const promise = () =>
            new Promise((resolve) => setTimeout(resolve, 4000))
        toast.promise(promise, {
            loading: 'Updating Password...',
            success: () => {
                return `Updated...`
            },
            error: 'Something went wrong!',
        })
        try {
            await updateUserFunction({
                variables: {
                    UpdateUserInput: {
                        id: props.id,
                        email: props.email,
                        name: props.name,
                        password: newpassword,
                        type: props.type,
                        imgUrl: props.imgUrl,
                        subType: props.subType,
                    },
                },
            })
        } catch (e) {
            console.log(e)
            return
        }
        router.push('/auth/login')
    }
    const passwordHeader = <h6>Pick a password</h6>
    const passwordFooter = !validatepass(newpassword) ? (
        <React.Fragment>
            <Divider />
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: '1.5' }}>
                {!lowerCasecheck.test(newpassword) ? (
                    <li>At least one lowercase</li>
                ) : null}
                {!upperCasecheck.test(newpassword) ? (
                    <li>At least one uppercase</li>
                ) : null}
                {!numericCheck.test(newpassword) ? (
                    <li>At least one numeric</li>
                ) : null}
                {!symbolCheck.test(newpassword) ? (
                    <li>At least one symbol</li>
                ) : null}
                <li>Minimum 8 characters</li>
            </ul>
        </React.Fragment>
    ) : (
        <></>
    )
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <Toaster richColors theme={theme} />
                <img
                    src={`${contextPath}/layout/images/logo.png`}
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
                                NUCES BLOCKED
                            </div>
                            <span className="text-600 font-medium">
                                The password will be updated,
                                <br />
                            </span>
                            <span className="text-600 font-medium">
                                After verification.
                            </span>
                        </div>
                        <div>
                            <Messages
                                ref={msgsLastPass}
                                onRemove={clearLastPassMessages}
                            />
                            <Messages
                                ref={msgsNewPass}
                                onRemove={clearNewPassMessages}
                            />
                            <label
                                htmlFor="currentpassword"
                                className="block text-900 text-xl font-medium mb-2"
                            >
                                Current Password
                            </label>
                            <Password
                                placeholder="current password"
                                className={classNames({
                                    'p-invalid': submit && !currentpassword,
                                    //'p-invalid1': currentpassword,
                                })}
                                toggleMask
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value)
                                }}
                                feedback={false}
                                required
                                autoFocus
                            />
                            {submit && !currentpassword && (
                                <small className="p-invalid">
                                    Current password is required.
                                </small>
                            )}
                            <div className="field w-full">
                                <label
                                    htmlFor="newpassword"
                                    className="block text-900 text-xl font-medium mb-2"
                                >
                                    New Password
                                </label>
                                <Password
                                    placeholder="new password"
                                    className={` ${classNames({
                                        'p-invalid': submit && !newpassword,
                                        'p-invalid1':
                                            submit &&
                                            newpassword &&
                                            !validatepass(newpassword),
                                    })}`}
                                    toggleMask
                                    onChange={(e) => {
                                        setNewPassword(e.target.value)
                                    }}
                                    required
                                    autoFocus
                                    feedback={feedback}
                                    header={passwordHeader}
                                    footer={passwordFooter}
                                />
                                {submit && !newpassword && (
                                    <small className="p-invalid">
                                        New password is required.
                                    </small>
                                )}
                                ,
                                {submit &&
                                    newpassword &&
                                    !validatepass(newpassword) && (
                                        <small className="p-invalid">
                                            password isn't too strong.
                                        </small>
                                    )}
                            </div>
                            <label
                                htmlFor="confirmpassword"
                                className="block text-900 text-xl font-medium mb-2"
                            >
                                Confirm Password
                            </label>
                            <Password
                                placeholder="confirm password"
                                className={classNames({
                                    'p-invalid': submit && !confirmpassword,
                                    //'p-invalid1': currentpassword,
                                })}
                                toggleMask
                                feedback={false}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                }}
                                required
                                autoFocus
                            />
                            {submit && !confirmpassword && (
                                <small className="p-invalid">
                                    Confirm password is required.
                                </small>
                            )}
                            <Button
                                label="Update"
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
UpdatePage.getLayout = function getLayout(page) {
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
export default UpdatePage
export const getServerSideProps: GetServerSideProps = requireAuthentication(
    async (ctx) => {
        const { req } = ctx
        if (req.headers.cookie) {
            const tokens = req.headers.cookie.split(';')
            const token = tokens.find((token) => token.includes('access_token'))
            let userData = ''
            if (token) {
                const userEmail = jwt.decode(
                    token.split('=')[1]?.toString()
                ).email
                await apolloClient
                    .query({
                        query: GET_USER_DATA,
                        variables: { userEmail },
                    })
                    .then((result) => {
                        userData = result.data.GetUserDataByUserEmail
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
            return {
                props: {
                    email: userData?.email || null,
                    id: userData?.id || null,
                    name: userData?.name || null,
                    password: userData?.password || null,
                    type: userData?.type || null,
                    imgUrl: userData?.imgUrl || null,
                    subType: userData?.subType || null,
                },
            }
        }
    }
)
