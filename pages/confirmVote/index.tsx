import React, { useRef } from 'react'
import ABI from '../../contracts/DAO.json'
import { DeployedContracts } from '../../contracts/deployedAddresses'
import Head from 'next/head'
import { Toaster, toast } from 'sonner'
import getConfig from 'next/config'
import Link from 'next/link'
import { StyleClass } from 'primereact/styleclass'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'
import './confirmVote.module.css'
import useMetaMask from '../../utils/customHooks/useMetaMask'
import { ethers } from 'ethers'

const VotePage = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const [account, isMetaMaskConnected, connectToMetaMask] = useMetaMask()
    const menuRef = useRef()
    const handleVote = async (vote) => {
        await connectToMetaMask()
        if (isMetaMaskConnected) {
            const abiArray = ABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(
                window['ethereum']
            )
            const signer = provider.getSigner()
            const contractInstance = new ethers.Contract(
                DeployedContracts.DAO,
                abiArray,
                signer
            )
            const latestProposalName: string = (
                await contractInstance.functions.getLatestProposalName({
                    from: sessionStorage.getItem('walletAddress'),
                })
            )[0]
            console.log(latestProposalName)
            await contractInstance.functions
                .vote(latestProposalName, vote, {
                    from: sessionStorage.getItem('walletAddress'),
                })
                .then(() => {
                    toast.success('Successfully voted!')
                })
                .catch((error) => {
                    console.log(error.message)
                    toast.error(
                        'Voting not successfull might be you already voted!'
                    )
                })
        } else {
            console.log('Metamask not connected!')
        }
    }

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
                    ></div>
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
                            Vote to participate in the consensus mechanism
                        </p>
                    </div>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4">
                        <br />

                        <div className="button-container">
                            <Button
                                label="Yes"
                                className="p-button-success p-button-lg"
                                onClick={() => handleVote(true)}
                            />
                            <Button
                                label="No"
                                className="p-button-danger p-button-lg"
                                onClick={() => handleVote(false)}
                            />
                        </div>
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
            </div>
        </div>
    )
}

VotePage.getLayout = function getLayout(page) {
    return <React.Fragment>{page}</React.Fragment>
}

export default VotePage
