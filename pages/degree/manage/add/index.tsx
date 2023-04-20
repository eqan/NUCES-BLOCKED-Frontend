import React, { useState, useEffect, useRef } from 'react'
import { ProgressBar, ProgressBarModeType } from 'primereact/progressbar'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { requireAuthentication } from '../../../../layout/context/requireAuthetication'
import apolloClient from '../../../../apollo-client'
import jwt from 'jsonwebtoken'
import { GET_USER_DATA } from '../../../../queries/users/getUser'
import { Button } from 'primereact/button'
import { useMutation } from '@apollo/client'
import { UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS } from '../../../../queries/students/autoUpdateEligibility'
import { Toaster, toast } from 'sonner'

interface Props {
    userType: string | null
    userimg: string | null
}

const AutomaticeCertificateGenerator: React.FC<Props> = (props) => {
    const router = useRouter()
    const [value, setValue] = useState<number>(0)
    const [textContent, setTextContent] = useState<string>('')
    const interval = useRef<any | null | undefined>(null)
    const [isIntermediate, setIsIntermidate] = useState<boolean>(false)
    const mode: ProgressBarModeType = isIntermediate
        ? 'indeterminate'
        : 'determinate'
    const [updateEligibilityStatusesForAllStudents] = useMutation(
        UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS
    )

    useEffect(() => {
        if (
            props.userType == 'TEACHER' ||
            props.userType == 'CAREER_COUNSELLOR' ||
            props.userType == 'SOCIETY_HEAD'
        ) {
            router.push('/pages/notfound')
        } else if (props.userType !== 'ADMIN') {
            router.push('/auth/login')
        }
    }, [props.userType])

    const generateDegrees = () => {
        try {
            setTextContent('Collecting Data')
            setTextContent('Self-Generating Certificates')
            setIsIntermidate(false)
            toast.success('Certificates have been deployed!')
            setTextContent('')
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const updateEligibilityStatuses = async () => {
        try {
            setTextContent('Updating Students Eligibility Criteria')
            setIsIntermidate(true)
            await updateEligibilityStatusesForAllStudents()
            toast.success('Eligibility Criteras Updated Successfully')
            setIsIntermidate(false)
            setTextContent('')
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // useEffect(() => {
    //     let val = value
    //     interval.current = setInterval(() => {
    //         val += Math.floor(Math.random() * 50) + 1

    //         if (val >= 100) {
    //             val = 100
    //             if (interval.current) clearInterval(interval.current)
    //         }
    //         setValue(val)
    //     }, 2000)

    //     return () => {
    //         if (interval.current) {
    //             clearInterval(interval.current)
    //             interval.current = null
    //         }
    //     }
    // }, [value])

    return (
        <>
            <Toaster richColors={true} />
            <div className="card">
                <h5>{textContent}</h5>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <ProgressBar
                        style={{
                            height: 30,
                            width: '70%',
                            marginRight: '10px',
                        }}
                        mode={mode}
                        value={value}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            label="Auto Update Eligibility"
                            style={{ marginRight: '10px' }}
                            className="p-button-warning"
                            onClick={updateEligibilityStatuses}
                        />
                        <Button
                            label="Generate & Deploy Certificates"
                            className="p-button-success"
                            onClick={generateDegrees}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

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
            }
            return {
                props: {
                    userType: userData?.type || null,
                    userimg: userData?.imgUrl || null,
                },
            }
        }
    }
)

export default AutomaticeCertificateGenerator
