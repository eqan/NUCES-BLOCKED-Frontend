import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import getConfig from 'next/config'
import { StyleClass } from 'primereact/styleclass'
import { Button } from 'primereact/button'
import { Ripple } from 'primereact/ripple'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import Head from 'next/head'
import { useFetchCertificateHook } from '../../queries/degree/getCertificate'
import { downloadCertificateResult } from '../../utils/downloadCertificateResult'
import { Toaster, toast } from 'sonner'

const LandingPage = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const [studentId, setStudentId] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [certificate, setCertificate] = useState<string>(null)
    const [
        certificatesData,
        certificatesLoading,
        certificatesFetchingError,
        certificatesRefetchHook,
    ] = useFetchCertificateHook(studentId)

    const menuRef = useRef()

    const fetchData = async () => {
        setIsLoading(true)
        if (!certificatesLoading) {
            try {
                let certificate: string =
                    certificatesData?.GetCertificateByRollNumber
                setCertificate(certificate)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (!certificatesLoading && certificatesData) {
            fetchData()
        }
    }, [certificatesData, certificatesLoading])

    return (
        <div className="surface-0 flex justify-content-center">
            <Toaster richColors />
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
            <div id="home" className="landing-wrapper overflow-hidden">
                <div className="py-4 px-4 mx-0 md:mx-6 lg:mx-8 lg:px-8 flex align-items-center justify-content-between relative lg:static">
                    <Link href="/landings">
                        <a className="flex align-items-center">
                            <img
                                src={`${contextPath}/assets/images/landing/iconv2.png`}
                                alt="NUCES BLOCKED Logo"
                                height="50"
                                className="mr-0 lg:mr-2"
                            />
                        </a>
                    </Link>
                    <StyleClass
                        nodeRef={menuRef}
                        selector="@next"
                        enterClassName="hidden"
                        leaveToClassName="hidden"
                    >
                        <i
                            ref={menuRef}
                            className="pi pi-bars text-4xl cursor-pointer block lg:hidden text-700"
                        ></i>
                    </StyleClass>
                    <div
                        className="align-items-center surface-0 flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 px-6 lg:px-0 z-2"
                        style={{ top: '100%' }}
                    >
                        <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
                            <li>
                                <a
                                    href="#home"
                                    className="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3"
                                >
                                    <span>Home</span>
                                </a>
                                <Ripple />
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3"
                                >
                                    <span>About</span>
                                </a>
                                <Ripple />
                            </li>
                            <li>
                                <a
                                    href="#features"
                                    className="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3"
                                >
                                    <span>Features</span>
                                </a>
                                <Ripple />
                            </li>
                            <li>
                                <a
                                    href="help"
                                    className="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3"
                                >
                                    <span>Help</span>
                                </a>
                                <Ripple />
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    id="hero"
                    className="flex flex-column pt-4 px-4 lg:px-8 overflow-hidden"
                    style={{
                        background:
                            'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #EEEFAF 0%, #C3E3FA 100%)',
                        clipPath: 'ellipse(150% 87% at 93% 13%)',
                    }}
                >
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4"></div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4"></div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4"></div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4"></div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4">
                        <h1 className="text-6xl font-bold text-gray-900 line-height-2">
                            <span className="font-light block">Welcome to</span>
                            NUCES BLOCKED
                        </h1>
                        <p className="font-normal text-2xl line-height-3 md:mt-3 text-gray-700">
                            Enter the Hash and Download the Verifiable
                            Credentials{' '}
                        </p>
                    </div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4">
                        <InputText
                            type="text"
                            placeholder="Enter Hash"
                            className="w-full md:w-30rem mb-5"
                            style={{ padding: '1rem' }}
                            onInput={(e) =>
                                setStudentId(
                                    (e.target as HTMLInputElement).value
                                )
                            }
                        />
                        <br />

                        <Button
                            type="button"
                            label="Download"
                            className=" text-xl border-none mt-3 bg-blue-500 font-normal line-height-3 px-3 text-white"
                            onClick={() => {
                                toast.promise(
                                    downloadCertificateResult(certificate),
                                    {
                                        loading:
                                            'Certificate is being downloaded...',
                                        success: (data) => {
                                            return data
                                        },
                                        error: (error) => {
                                            return error.message
                                        },
                                    }
                                )
                            }}
                        ></Button>
                    </div>
                    <div className="flex justify-content-center md:justify-content-end">
                        <img
                            src={`${contextPath}/assets/images/landing/university.png`}
                            alt="Hero Image"
                            className="w-9 md:w-auto"
                        />
                    </div>
                </div>
                <div id="about" className="py-4 px-4 lg:px-8 my-2 md:my-4">
                    <div className="text-center">
                        <h2 className="text-900 font-normal mb-2">About</h2>
                        <span className="text-600 text-2xl">
                            NUCES BLOCKED, A platform to empower students after
                            graduating by highlighting their Student degree with
                            extracurricular activities in an immutable
                            trustworthy system that companies and students can
                            utilize with minimum effort.
                        </span>
                    </div>

                    <div className="grid justify-content-between mt-8 md:mt-0">
                        <div className="col-12 lg:col-4 p-0 md:p-3">
                            <div className="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all">
                                <h3 className="text-900 text-center my-5">
                                    Blockchain
                                </h3>

                                <img
                                    src={`${contextPath}/assets/images/landing/blockchain.png`}
                                    className="w-10 h-10 mx-auto"
                                    alt="free"
                                />

                                <Divider className="w-full bg-surface-200"></Divider>
                                <ul className="my-5 list-none p-0 flex text-900 flex-column">
                                    <li className="py-2">
                                        <i className=" text-xl text-cyan-500 mr-2"></i>
                                        <span
                                            className="text-xl line-height-3 justify"
                                            style={{ textAlign: 'justify' }}
                                        >
                                            Admin deploys student results and
                                            certificates in an immutable ledger
                                            on Blockchain.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-12 lg:col-4 p-0 md:p-3 mt-4 md:mt-0">
                            <div className="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all">
                                <h3 className="text-900 text-center my-5">
                                    Academic Profile
                                </h3>

                                <img
                                    src={`${contextPath}/assets/images/landing/academic-profile.png`}
                                    className="w-10 h-10 mx-auto"
                                    alt="startup"
                                />

                                <Divider className="w-full bg-surface-200"></Divider>
                                <ul className="my-5 list-none p-0 flex text-900 flex-column">
                                    <li className="py-2">
                                        <i className=" text-xl text-cyan-500 mr-2"></i>
                                        <span className="text-xl line-height-3">
                                            Teacher, Society Heads, and Career
                                            Counselor mange the academic
                                            profiles of students.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-12 lg:col-4 p-0 md:p-3 mt-4 md:mt-0">
                            <div className="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-primary transition-duration-300 transition-all">
                                <h3 className="text-900 text-center my-5">
                                    Verification
                                </h3>

                                <img
                                    src={`${contextPath}/assets/images/landing/verification.png`}
                                    className="w-10 h-10 mx-auto"
                                    alt="enterprise"
                                />

                                <Divider className="w-full bg-surface-200"></Divider>
                                <ul className="my-5 list-none p-0 flex text-900 flex-column">
                                    <li className="py-2">
                                        <i className=" text-xl text-cyan-500 mr-2"></i>
                                        <span className="text-xl line-height-3">
                                            Company and organization can easily
                                            verify student credential using
                                            hash.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id="features"
                    className="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8"
                >
                    <div className="grid justify-content-center">
                        <div className="col-12 text-center mt-8 mb-4">
                            <h2 className="text-900 font-normal mb-2">
                                Features
                            </h2>
                            <span className="text-600 text-2xl">
                                There are basic six features....
                            </span>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-yellow-200 mb-3"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i className="pi pi-fw pi-users text-2xl text-yellow-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Manage Users
                                    </h5>
                                    <span className="text-600">
                                        Allow the user to manage the profiles of
                                        teachers, career counselors, and society
                                        heads.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(145,226,237,0.2),rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-cyan-200 mb-3"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i className="pi pi-fw pi-users text-2xl text-cyan-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Manage Students
                                    </h5>
                                    <span className="text-600">
                                        Allow the user to manage the student
                                        information. This will include adding,
                                        removing, and updating student
                                        information.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-indigo-200"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i className="pi pi-fw pi-chart-line text-2xl text-indigo-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Manage Semester Result
                                    </h5>
                                    <span className="text-600">
                                        Allow the user to manage the semester
                                        results of students. This will include
                                        adding, removing, uploading, and down-
                                        loading results
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(187, 199, 205, 0.2),rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2),rgba(145, 210, 204, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-bluegray-200 mb-3"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i className="pi pi-fw pi-bookmark text-2xl text-bluegray-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Manage Student Degree
                                    </h5>
                                    <span className="text-600">
                                        Allow the user to manage the
                                        certificates of students. This will
                                        include adding, removing, and uploading
                                        certificates.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(187, 199, 205, 0.2),rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(145, 226, 237, 0.2),rgba(160, 210, 250, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-orange-200 mb-3"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i className="pi pi-fw pi-book text-2xl text-orange-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Manage Academic Profile
                                    </h5>
                                    <span className="text-600">
                                        Allow the user to manage the academic
                                        profiles of students. This will include
                                        adding, removing, and updating academic
                                        profiles.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: '160px',
                                    padding: '2px',
                                    borderRadius: '10px',
                                    background:
                                        'linear-gradient(90deg, rgba(251, 199, 145, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(212, 162, 221, 0.2))',
                                }}
                            >
                                <div
                                    className="p-3 surface-card h-full"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <div
                                        className="flex align-items-center justify-content-center bg-pink-200 mb-3"
                                        style={{
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <i
                                            className="pi pi-fw 
pi-arrow-down text-2xl text-pink-700"
                                        ></i>
                                    </div>
                                    <h5 className="mb-2 text-900">
                                        Download Student Degree
                                    </h5>
                                    <span className="text-600">
                                        User will be able to download the
                                        certificate anytime and anywhere on an
                                        internet connection.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

LandingPage.getLayout = function getLayout(page) {
    return <React.Fragment>{page}</React.Fragment>
}

export default LandingPage
