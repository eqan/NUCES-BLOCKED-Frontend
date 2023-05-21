import React, { useState, useEffect, useRef, useContext } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { Button } from 'primereact/button'
import { useMutation } from '@apollo/client'
import { Toaster, toast } from 'sonner'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Tag } from 'primereact/tag'
import { ThemeContext } from '../../utils/customHooks/themeContextProvider'
import useMetaMask from '../../utils/customHooks/useMetaMask'
import { DeployedContracts } from '../../contracts/deployedAddresses'
import { Props } from '../../interfaces/UserPropsForAuthentication'
import DAOContractABI from '../../contracts/DAO.json'
import { serverSideProps } from '../../utils/requireAuthentication'
import { ethers } from 'ethers'
import { Dialog } from 'primereact/dialog'
import { useFetchProposalsHook } from '../../queries/proposals/getProposals'

interface ProposalInterface {
    id: string
    description: string
    yesVotes: number
    noVotes: number
    status: string
}

const Proposals: React.FC<Props> = (props) => {
    const mapProposalToProposalsRecord = (proposal: ProposalInterface) => {
        return {
            id: proposal.id,
            description: proposal.description,
            yesVotes: proposal.yesVotes,
            noVotes: proposal.noVotes,
            status: proposal.status,
        }
    }

    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [account, isMetaMaskConnected, connectToMetaMask] = useMetaMask()
    const [textContent, setTextContent] = useState<string>('')
    const [isEligbleToGenerate, setIsEligibleToGenerate] =
        useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(true)
    const [continueInProgressDialog, setContinueInProgressDialog] =
        useState<boolean>(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
    const [proposals, setProposals] = useState<ProposalInterface[]>([])
    const [DAOContract, setDAOContract] = useState(null)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable | null>(null)

    const proposalsStatusEnums = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']

    const [
        proposalsData,
        proposalsLoading,
        proposalsFetchingError,
        proposalsRefetchHook,
    ] = useFetchProposalsHook(globalFilter, page + 1, pageLimit)

    const fetchProposalsData = async () => {
        setIsLoading(true)
        if (!proposalsLoading) {
            try {
                let _proposals = proposalsData?.GetAllProposals.items.filter(
                    (val) => val.id != ''
                )
                const total = _proposals?.GetAllProposals?.total
                const proposalRecords =
                    _proposals.map(mapProposalToProposalsRecord) || []
                setProposals(proposalRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (window.ethereum !== 'undefined') {
            const abiArrayForDAO = DAOContractABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const daoContractInstance = new ethers.Contract(
                DeployedContracts.DAO,
                abiArrayForDAO,
                signer
            )
            setDAOContract(daoContractInstance)
        } else {
            console.error('Metamask not found')
        }
    }, [])

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

    useEffect(() => {
        if (!proposalsLoading && proposalsData) {
            fetchProposalsData()
        }
    }, [proposalsData, proposalsLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            proposalsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [proposalsRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const openContinueInProgress = () => {
        setSubmitted(false)
        setContinueInProgressDialog(true)
    }

    const hideAddProposalDialog = async () => {
        setSubmitted(false)
        setContinueInProgressDialog(false)
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.id}
            </>
        )
    }

    const descriptionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        )
    }

    const getSeverity = (status) => {
        switch (status) {
            case 'NOT_STARTED':
                return 'warning'
            case 'IN_PROGRESS':
                return 'info'
            case 'COMPLETED':
                return 'Primary'
            default:
                return null
        }
    }

    const statusBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.status}
                severity={getSeverity(rowData.status)}
            ></Tag>
        )
    }

    const yesBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Yes Votes</span>
                {rowData.yesVotes}
            </>
        )
    }

    const noBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">No Votes</span>
                {rowData.noVotes}
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Proposals</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left md:flex-grow">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
    )

    const LoadingTemplate = ({ w, h }: { w: string; h: string }) => {
        return (
            <div
                className="flex align-items-center"
                style={{ height: '17px', flexGrow: '1', overflow: 'hidden' }}
            >
                <Skeleton width={w} height={h} />
            </div>
        )
    }

    const SkeletonTable = () => {
        return (
            <>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '10px',
                    }}
                >
                    <LoadingTemplate h="40px" w="40px" />
                    <LoadingTemplate h="10px" w="100px" />
                    <LoadingTemplate h="10px" w="80px" />
                    <LoadingTemplate h="10px" w="40px" />
                </div>
            </>
        )
    }

    return (
        <>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toaster richColors theme={theme} />
                        <div className="card">
                            <h5>{textContent}</h5>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Button
                                        label="New"
                                        icon="pi pi-plus"
                                        className="p-button-success mr-2"
                                        onClick={openContinueInProgress}
                                    />
                                    <Button
                                        label="Update Statuses To Latest"
                                        style={{ marginRight: '10px' }}
                                        icon="pi pi-sync"
                                        className="p-button-info"
                                        // onClick={sendMailsToRelevantPeople}
                                        disabled={isButtonDisabled}
                                    />
                                    <Button
                                        label="Auto Update Eligibility"
                                        style={{ marginRight: '10px' }}
                                        className="p-button-warning"
                                        // onClick={updateEligibilityStatuses}
                                        disabled={isButtonDisabled}
                                    />
                                </div>
                            </div>
                        </div>
                        {isLoading ? (
                            <>
                                {[1, 2, 3, 4, 5].map((v) => (
                                    <SkeletonTable />
                                ))}
                            </>
                        ) : (
                            <DataTable
                                ref={dt}
                                value={proposals}
                                dataKey="id"
                                defaultValue={1}
                                paginator
                                rows={pageLimit}
                                first={page * pageLimit}
                                onPage={onPageChange}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                                emptyMessage="No students found."
                                header={header}
                                responsiveLayout="scroll"
                                totalRecords={totalRecords}
                                loading={isLoading}
                            >
                                <Column
                                    field="id"
                                    header="Proposal Name"
                                    sortable
                                    body={idBodyTemplate}
                                    headerStyle={{ minWidth: '10rem' }}
                                ></Column>
                                <Column
                                    field="description"
                                    header="Description"
                                    sortable
                                    body={descriptionBodyTemplate}
                                    headerStyle={{ minWidth: '15rem' }}
                                ></Column>
                                <Column
                                    field="yesVotes"
                                    header="Yes Votes"
                                    body={yesBodyTemplate}
                                    sortable
                                    headerStyle={{ minWidth: '15rem' }}
                                ></Column>
                                <Column
                                    field="noVotes"
                                    header="No Votes"
                                    body={noBodyTemplate}
                                    sortable
                                ></Column>
                                <Column
                                    field="status"
                                    header="Current Status"
                                    body={statusBodyTemplate}
                                    sortable
                                ></Column>
                            </DataTable>
                        )}
                        <Dialog
                            visible={continueInProgressDialog}
                            style={{ width: '450px' }}
                            header="Confirm"
                            modal
                            className="p-fluid"
                            // footer={continueInProgressDialogFooter}
                            onHide={hideAddProposalDialog}
                        >
                            <div className="flex align-items-center justify-content-center">
                                <i
                                    className="pi pi-exclamation-triangle mr-3"
                                    style={{ fontSize: '2rem' }}
                                />
                                {
                                    <span>
                                        It seems like there are some degrees
                                        which are inprogress of being published,
                                        Do you want to continue the progress?
                                    </span>
                                }
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = serverSideProps
export default Proposals
