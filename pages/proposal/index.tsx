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
import { classNames } from 'primereact/utils'
import { START_PROPOSAL_CRON_JOB } from '../../queries/proposals/startCron'
import { STOP_PROPOSAL_CRON_JOB } from '../../queries/proposals/stopCron'
import { validateTransactionBalance } from '../../utils/checkEligibleTransaction'
import { CREATE_PROPOSAL } from '../../queries/proposals/addProposal'
import { DELETE_PROPOSAL } from '../../queries/proposals/removeProposal'
import { UPDATE_PROPOSALS } from '../../queries/proposals/updateProposals'

interface ProposalInterface {
    id: string
    description: string
    yesVotes: number
    noVotes: number
    status: string
}

const Proposals: React.FC<Props> = (props) => {
    let ProposalRecordInterface: ProposalInterface = {
        id: '',
        description: '',
        yesVotes: 0,
        noVotes: 0,
        status: '',
    }

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
    const [submitted, setSubmitted] = useState<boolean>(true)
    const [addProposalDialog, setAddProposalDialog] = useState<boolean>(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
    const [proposals, setProposals] = useState<ProposalInterface[]>([])
    const [proposal, setProposal] = useState(ProposalRecordInterface)
    const [provider, setProvider] = useState(null)
    const [DAOContract, setDAOContract] = useState(null)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const [startCronJobFunction] = useMutation(START_PROPOSAL_CRON_JOB)
    const [stopCronJobFunction] = useMutation(STOP_PROPOSAL_CRON_JOB)
    const [updateProposalsFunction] = useMutation(UPDATE_PROPOSALS)
    const dt = useRef<DataTable | null>(null)

    const [
        proposalsData,
        proposalsLoading,
        proposalsFetchingError,
        proposalsRefetchHook,
    ] = useFetchProposalsHook(globalFilter, page + 1, pageLimit)

    const [
        addProposalFunction,
        {
            data: proposalCreateData,
            loading: proposalCreateDataLoading,
            error: proposalCreateDataError,
            reset: proposalCreateDataReset,
        },
    ] = useMutation(CREATE_PROPOSAL)

    const [
        deleteProposalFunction,
        {
            data: proposalDeleteData,
            loading: proposalDeteDataLoading,
            error: proposalDeleteDataError,
            reset: proposalDeleteDataReset,
        },
    ] = useMutation(DELETE_PROPOSAL)

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
            setProvider(provider)
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

    const addProposal = async () => {
        await connectToMetaMask()
        setSubmitted(true)
        setAddProposalDialog(false)
        if (isMetaMaskConnected) {
            if (proposal.id && proposal.description) {
                stopCronJobFunction()
                let _proposals = [...proposals]
                let _proposal = { ...proposal }
                const id = _proposal.id
                try {
                    if (validateTransactionBalance(provider)) {
                        _proposals[id] = _proposal

                        let newProposal = await addProposalFunction({
                            variables: {
                                CreateProposalInput: {
                                    id: _proposal.id,
                                    description: _proposal.description,
                                    yesVotes: 0,
                                    noVotes: 0,
                                    status: 'NOT_STARTED',
                                },
                            },
                        })
                        await DAOContract.functions.createProposal(
                            _proposal.id,
                            _proposal.description,
                            { from: sessionStorage.getItem('walletAddress') }
                        )
                        newProposal = newProposal.data['CreateProposal']
                        const mappedData: ProposalInterface =
                            mapProposalToProposalsRecord(newProposal)
                        _proposals.push(mappedData)
                        setProposals(_proposals)
                    } else {
                        throw new Error(
                            'Gas fees may not be sufficient, check your wallet!'
                        )
                    }
                } catch (error) {
                    console.log(error)
                    await deleteProposalFunction({
                        variables: {
                            DeleteProposalInput: {
                                id: [id],
                            },
                        },
                    })
                    throw new Error(error.message)
                }
            } else {
                throw new Error('Please fill all the fields!')
            }
            startCronJobFunction()
            setProposal(ProposalRecordInterface)
            return 'Result has been added!'
        } else {
            throw new Error('Metamask not connected!')
        }
    }
    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const openAddProposalDialog = () => {
        setSubmitted(false)
        setAddProposalDialog(true)
    }

    const hideAddProposalDialog = async () => {
        setSubmitted(false)
        setAddProposalDialog(false)
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

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _proposal = { ...proposal }
        if (name != '') {
            _proposal[`${name}`] = val
            setProposal(_proposal)
            console.log(proposal)
            return
        }
        _proposal[`${name}`] = val
        setProposal(_proposal)
        console.log(proposal)
    }

    const proposalDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddProposalDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(addProposal, {
                        loading: 'Proposal is being added...',
                        success: (data) => {
                            return data
                        },
                        error: (error) => {
                            return error.message
                        },
                    })
                }}
            />
        </>
    )

    const updateAndRefetchData = async () => {
        stopCronJobFunction()
        setIsButtonDisabled(true)
        try {
            await DAOContract.functions.updateStatuses({
                from: sessionStorage.getItem('walletAddress'),
            })
            await updateProposalsFunction()
            await fetchProposalsData()
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setIsButtonDisabled(false)
        startCronJobFunction()
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
                                        onClick={openAddProposalDialog}
                                        disabled={isButtonDisabled}
                                    />
                                    <Button
                                        label="Update Statuses To Latest"
                                        style={{ marginRight: '10px' }}
                                        icon="pi pi-sync"
                                        className="p-button-info"
                                        onClick={updateAndRefetchData}
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
                            visible={addProposalDialog}
                            style={{ width: '450px' }}
                            header="Confirm"
                            modal
                            className="p-fluid"
                            footer={proposalDialogFooter}
                            onHide={hideAddProposalDialog}
                        >
                            <div className="field">
                                <label htmlFor="id">Proposal Name</label>
                                <span className="p-input-icon-right">
                                    <InputText
                                        id="id"
                                        value={proposal.id}
                                        onChange={(e) => {
                                            onInputChange(e, 'id')
                                        }}
                                        required
                                        autoFocus
                                        className={classNames(
                                            {
                                                'p-invalid':
                                                    submitted && !proposal.id,
                                            },
                                            {
                                                'p-invalid1':
                                                    submitted && proposal.id,
                                            }
                                        )}
                                    />
                                    {submitted && !proposal.id && (
                                        <small className="p-invalid">
                                            Proposal name is required.
                                        </small>
                                    )}
                                </span>
                            </div>
                            <div className="field">
                                <label htmlFor="description">Description</label>
                                <span className="p-input-icon-right">
                                    <InputText
                                        id="description"
                                        value={proposal.description}
                                        onChange={(e) => {
                                            onInputChange(e, 'description')
                                        }}
                                        required
                                        autoFocus
                                        className={classNames(
                                            {
                                                'p-invalid':
                                                    submitted &&
                                                    !proposal.description,
                                            },
                                            {
                                                'p-invalid1':
                                                    submitted &&
                                                    proposal.description,
                                            }
                                        )}
                                    />
                                    {submitted && !proposal.description && (
                                        <small className="p-invalid">
                                            Proposal description is required.
                                        </small>
                                    )}
                                </span>
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
