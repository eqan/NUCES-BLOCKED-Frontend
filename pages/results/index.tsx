import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toolbar } from 'primereact/toolbar'
import { Dropdown } from 'primereact/dropdown'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { returnFetchResultsHook } from '../../queries/results/getResult'
import { useMutation } from '@apollo/client'
import { DELETE_RESULT } from '../../queries/results/removeResult'
import { CREATE_RESULT } from '../../queries/results/addResult'
import { UPDATE_RESULT } from '../../queries/results/updateResult'
import { START_RESULT_CRON_JOB } from '../../queries/results/startCronJob'
import { STOP_RESULT_CRON_JOB } from '../../queries/results/stopCronJob'
import { useRouter } from 'next/router'
import { Skeleton } from 'primereact/skeleton'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'
import { NFTStorage } from 'nft.storage'
import { NFT_STORAGE_TOKEN } from '../../constants/env-variables'
import FileSaver from 'file-saver'
import axios from 'axios'
import { extractActualDataFromIPFS } from '../../utils/extractActualDataFromIPFS'
import { ethers } from 'ethers'
import ABI from '../../contracts/SemesterStore.json'
import { DeployedContracts } from '../../contracts/deployedAddresses'
import { GET_USER_DATA } from '../../queries/users/getUser'
import { Toaster, toast } from 'sonner'
import { validateTransactionBalance } from '../../utils/checkEligibleTransaction'

interface ResultsInterface {
    id: string
    semester: string
    year: number
    url: string
    date: string
}
interface Props {
    userType: string | null
    userimg: string | null
}

const SemesterResult: React.FC<Props> = (props) => {
    let ResultsRecordInterface = {
        id: '',
        semester: '',
        year: 0,
        url: '',
        date: '',
    }

    const mapSemesterToSemesterRecord = (result: ResultsInterface) => {
        return {
            id: result.id,
            url: result.url,
            semester: result.type,
            year: result.year,
            date: result.updatedAt,
        }
    }
    const router = useRouter()
    const [file, setFile] = useState(null)
    const fileUploadRef = useRef(null)
    const [results, setResults] = useState<ResultsInterface[]>([])
    const [resultAddDialog, setAddResultDialog] = useState(false)
    const [resultUpdateDialog, setUpdateResultDialog] = useState(false)
    const [deleteResultDialog, setDeleteResultDialog] = useState(false)
    const [deleteResultsDialog, setDeleteResultsDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [result, setResult] = useState(ResultsRecordInterface)
    const [semester, setSemester] = useState<any>('')
    const [selectedResults, setSelectedResults] = useState<ResultsInterface[]>(
        []
    )
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable | null>(null)
    const [contract, setContract] = useState(null)
    const [provider, setProvider] = useState(null)

    const [
        resultsData,
        resultsLoading,
        resultsFetchingError,
        resultsRefetchHook,
    ] = returnFetchResultsHook(globalFilter, page + 1, pageLimit)

    const [
        deleteResultFunction,
        {
            data: rsesultDeleteData,
            loading: resultDeteDataLoading,
            error: resultDeleteDataError,
            reset: resultDeleteDataReset,
        },
    ] = useMutation(DELETE_RESULT)

    const [
        createResultFunction,
        {
            data: certifcateCreateData,
            loading: resultCreateDataLoading,
            error: resultCreateDataError,
            reset: resultCreateDataReset,
        },
    ] = useMutation(CREATE_RESULT)

    const [
        updateResultFunction,
        {
            data: resultUpdateData,
            loading: resultUpdateDataLoading,
            error: resultUpdateDataError,
            reset: resultUpdateDataReset,
        },
    ] = useMutation(UPDATE_RESULT)

    const [startCronJobFunction] = useMutation(START_RESULT_CRON_JOB)
    const [stopCronJobFunction] = useMutation(STOP_RESULT_CRON_JOB)

    const fetchData = async () => {
        setIsLoading(true)
        if (!resultsLoading) {
            try {
                let _results = resultsData?.GetAllResults.items.filter(
                    (val) => val.id != ''
                )
                const resultRecords =
                    _results.map(mapSemesterToSemesterRecord) || []
                const total = resultsData?.GetAllResults?.total
                setResults(resultRecords)
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
            const abiArray = ABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contractInstance = new ethers.Contract(
                DeployedContracts.SemesterStore,
                abiArray,
                signer
            )
            setContract(contractInstance)
            setProvider(provider)
        } else {
            console.error('Metamask not found')
        }
    }, [])

    useEffect(() => {
        if (!resultsLoading && resultsData) {
            fetchData()
        }
    }, [resultsData, resultsLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            resultsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [resultsRefetchHook, router.events])

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
    useEffect(() => {}, [globalFilter])

    const openNewAddResultDialog = () => {
        setResult(ResultsRecordInterface)
        setSubmitted(false)
        setAddResultDialog(true)
    }

    const hideAddResultDialog = () => {
        setSubmitted(false)
        setAddResultDialog(false)
    }

    const hideUpdateResultDialog = () => {
        setSubmitted(false)
        setUpdateResultDialog(false)
    }

    const hideDeleteResultDialog = () => {
        setDeleteResultDialog(false)
    }

    const hideDeleteResultsDialog = () => {
        setDeleteResultsDialog(false)
    }

    const validateYear = () => {
        if (result.year) {
            let temp = result.year
            let today = new Date()
            if (!(temp >= 2014 && temp <= today.getFullYear())) {
                return 0
            }
            return 1
        }
    }

    const addResult = async () => {
        if (result.semester && result.year && file) {
            setSubmitted(true)
            setAddResultDialog(false)
            stopCronJobFunction()
            let _results = [...results]
            let _result = { ...result }
            try {
                if (validateTransactionBalance(provider)) {
                    const id = _result.semester + '_' + _result.year
                    _results[id] = _result
                    const url = await handleUpload(id)

                    let newResult = await createResultFunction({
                        variables: {
                            CreateResultInput: {
                                year: _result.year.toString(),
                                type: _result.semester,
                                url: url,
                            },
                        },
                    })
                    await contract.functions.addSemester(
                        _result.semester,
                        _result.year,
                        url,
                        { from: sessionStorage.getItem('walletAddress') }
                    )
                    newResult = newResult.data['CreateResult']
                    const mappedData: ResultsInterface =
                        mapSemesterToSemesterRecord(newResult)
                    _results.push(mappedData)
                    setResults(_results)
                } else {
                    throw new Error(
                        'Gas fees may not be sufficient, check your wallet!'
                    )
                }
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
        } else {
            throw new Error('Please fill all the fields!')
        }
        startCronJobFunction()
        setResult(ResultsRecordInterface)
        return 'Result has been added!'
    }

    const updateResult = async () => {
        if (result.semester && result.year && file) {
            setSubmitted(true)
            setUpdateResultDialog(false)
            stopCronJobFunction()
            let _results = [...results]
            let _result = { ...result }
            try {
                if (validateTransactionBalance(provider)) {
                    const index = findIndexById(_result.id)
                    const url = await handleUpload(result.id)
                    _results[index] = _result
                    await updateResultFunction({
                        variables: {
                            UpdateResultInput: {
                                id: result.id,
                                url: url,
                            },
                        },
                    })
                    await contract.functions.updateSemester(result.id, url, {
                        from: sessionStorage.getItem('walletAddress'),
                    })
                    setResults(_results)
                } else {
                    throw new Error(
                        'Gas fees may not be sufficient, check your wallet!'
                    )
                }
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
        } else {
            throw new Error('Please fill all the fields!')
        }

        startCronJobFunction()
        setResult(ResultsRecordInterface)
        return 'Result has been updated!'
    }

    const uploadResult = (result) => {
        setResult({ ...result })
        setSemester({ name: result.semester })
        setUpdateResultDialog(true)
    }

    const confirmDeleteResult = (result) => {
        setResult(result)
        setDeleteResultDialog(true)
    }

    const deleteResult = async () => {
        let _results = results.filter((val) => val.id !== result.id)
        setDeleteResultDialog(false)
        try {
            if (validateTransactionBalance(provider)) {
                await deleteResultFunction({
                    variables: {
                        DeleteResultInput: {
                            id: [result.id],
                        },
                    },
                })
                await contract.functions.removeSemester(result.id, {
                    from: sessionStorage.getItem('walletAddress'),
                })
                setResults(_results)
                if (resultDeleteDataError) {
                    throw new Error(resultDeleteDataError.message)
                }
            } else {
                throw new Error(
                    'Gas fees may not be sufficient, check your wallet!'
                )
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setResult(ResultsRecordInterface)
        return 'Result has been deleted!'
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < results.length; i++) {
            if (results[i].id === id) {
                index = i
                break
            }
        }

        return index
    }

    const exportCSV = () => {
        if (dt.current) dt.current.exportCSV()
    }

    const confirmDeleteSelected = () => {
        setDeleteResultsDialog(true)
    }

    const deleteSelectedResults = async () => {
        let _results = results.filter((val) => !selectedResults.includes(val))
        let _toBeDeletedResults = results
            .filter((val) => selectedResults.includes(val))
            .map((val) => val.id)
        setDeleteResultsDialog(false)
        try {
            if (validateTransactionBalance(provider)) {
                await deleteResultFunction({
                    variables: {
                        DeleteResultInput: {
                            id: _toBeDeletedResults,
                        },
                    },
                })
                await contract.functions.removeSemesters(_toBeDeletedResults)
                if (resultDeleteDataError) {
                    throw new Error(resultDeleteDataError.message)
                }
            } else {
                throw new Error(
                    'Gas fees may not be sufficient, check your wallet!'
                )
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setResults(_results)
        setSelectedResults([])
        return 'Results have been deleted!'
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _result = { ...result }
        if (name == 'semester') {
            _result[`${name}`] = val.name
            setResult(_result)
            setSemester(val)
            return
        } else if (name == 'year') {
            let i
            let stringbe = ''
            for (i = 0; i < val.length; i++) {
                if (!(val[i] >= '0' && val[i] <= '9')) {
                    return
                }
                stringbe += val[i]
            }
            if (stringbe.length > 4) {
                return
            }
            _result[`${name}`] = stringbe
            setResult(_result)
            return
        }
        _result[`${name}`] = val
        setResult(_result)
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label="New"
                        icon="pi pi-plus"
                        className="p-button-success mr-2"
                        onClick={openNewAddResultDialog}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedResults || !selectedResults.length}
                    />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    label="Export"
                    icon="pi pi-upload"
                    className="p-button-help"
                    onClick={exportCSV}
                />
            </React.Fragment>
        )
    }

    const yearBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Year</span>
                {rowData.year}
            </>
        )
    }

    const semesterBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Semester</span>
                {rowData.semester}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-arrow-down"
                    className="p-button-rounded p-button-success mr-2"
                    onClick={() => {
                        toast.promise(downloadSemesterResult(rowData), {
                            loading: 'Result is being downloaded...',
                            success: (data) => {
                                return data
                            },
                            error: (error) => {
                                return error.message
                            },
                        })
                    }}
                />
                <Button
                    icon="pi pi-arrow-up"
                    className="p-button-rounded p-button-warning mr-2"
                    onClick={() => uploadResult(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteResult(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Semester Result</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) =>
                        setGlobalFilter((e.target as HTMLInputElement).value)
                    }
                    placeholder="Search..."
                />
            </span>
        </div>
    )

    const addResultDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddResultDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(addResult, {
                        loading: 'Result is being added...',
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

    const updateResultDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUpdateResultDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(updateResult, {
                        loading: 'Result is being updated...',
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
    const deleteResultDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteResultDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteResult, {
                        loading: 'Result is being removed...',
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
    const deleteResultsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteResultsDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteSelectedResults, {
                        loading: 'Results are being removed...',
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

    const LoadingTemplate = ({ w, h }: { w: string; h: string }) => {
        return (
            <div
                className="flex align-items-center"
                style={{
                    height: '17px',
                    flexGrow: '1',
                    overflow: 'hidden',
                }}
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

    const downloadSemesterResult = async (result) => {
        try {
            const response = await axios.get(result.url)
            FileSaver.saveAs(
                new Blob([response.data], {
                    type: 'text/csv',
                }),
                `${result.id}.csv`
            )
        } catch (error) {
            console.error(error)
            throw new Error(error.message)
        }
        return 'Result Downloaded!'
    }

    const uploadHandler = ({ files }) => {
        handleReset()
        const fileToUpload = files[0]
        setFile(fileToUpload)
    }
    const handleReset = () => {
        if (fileUploadRef.current != null) fileUploadRef.current.clear() // call the clear method on file upload ref
        setFile(null)
    }

    const handleUpload = async (id) => {
        let url = null
        try {
            const nftstorage = new NFTStorage({
                token: NFT_STORAGE_TOKEN,
            })
            const binaryFileWithMetaData = new File([file], id + '.csv', {
                type: 'text/csv',
            })

            const metadata = {
                name: id,
                description: `Semester result of the ${id}`,
            }
            const value = await nftstorage.store({
                image: binaryFileWithMetaData,
                name: metadata.name,
                description: metadata.description,
            })
            console.log(value.url)
            url = await extractActualDataFromIPFS(value.url, '.csv')
            handleReset()
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        return url
    }
    const theme =
        typeof localStorage !== 'undefined' &&
        localStorage.getItem('theme') === 'Dark'
            ? 'dark'
            : 'light'

    const semesters = [{ name: 'FALL' }, { name: 'SPRING' }, { name: 'SUMMER' }]
    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toaster richColors theme={theme} />
                    <Toolbar
                        className="mb-4"
                        left={leftToolbarTemplate}
                        right={rightToolbarTemplate}
                    ></Toolbar>

                    {isLoading ? (
                        <>
                            {[1, 2, 3, 4, 5].map((v) => (
                                <SkeletonTable />
                            ))}
                        </>
                    ) : (
                        <DataTable
                            ref={dt}
                            value={results}
                            selection={selectedResults}
                            onSelectionChange={(e) =>
                                setSelectedResults(e.value)
                            }
                            dataKey="id"
                            defaultValue={1}
                            paginator
                            rows={pageLimit}
                            first={page * pageLimit}
                            onPage={onPageChange}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                            emptyMessage="No results found."
                            header={header}
                            responsiveLayout="scroll"
                            totalRecords={totalRecords}
                            loading={isLoading}
                        >
                            <Column
                                selectionMode="multiple"
                                headerStyle={{ width: '4rem' }}
                            ></Column>
                            <Column
                                field="semester"
                                header="Semester Name"
                                sortable
                                body={semesterBodyTemplate}
                                headerStyle={{ minWidth: '15rem' }}
                            ></Column>
                            <Column
                                field="year"
                                header="Year"
                                sortable
                                body={yearBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>

                            <Column
                                body={actionBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>
                        </DataTable>
                    )}

                    <Dialog
                        visible={resultAddDialog}
                        style={{ width: '450px' }}
                        header="Result Details"
                        modal
                        className="p-fluid"
                        footer={addResultDialogFooter}
                        onHide={hideAddResultDialog}
                    >
                        <div className="field">
                            <label htmlFor="semester">Semeter Name</label>
                            <Dropdown
                                id="semester"
                                value={semester}
                                options={semesters}
                                onChange={(e) => onInputChange(e, 'semester')}
                                required
                                autoFocus
                                optionLabel="name"
                                placeholder="Select a Semester"
                                className={classNames({
                                    'p-invalid': submitted && !result.semester,
                                })}
                            />
                            {submitted && !result.semester && (
                                <small className="p-invalid">
                                    Semester is required.
                                </small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="year">Year</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="year"
                                    value={result.year}
                                    onChange={(e) => onInputChange(e, 'year')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !result.year,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && result.year,
                                        }
                                    )}
                                />
                                {(submitted && !result.year && (
                                    <small className="p-invalid">
                                        Year is required.
                                    </small>
                                )) ||
                                    (submitted &&
                                        result.year &&
                                        !validateYear() && (
                                            <small className="p-invalid1">
                                                Invalid year, range from 1990 to
                                                Current Year
                                            </small>
                                        ))}
                                <i className="pi pi-fw pi-calendar" />
                            </span>
                        </div>

                        <div className="field">
                            <label htmlFor="file">File</label>

                            <FileUpload
                                ref={fileUploadRef}
                                chooseOptions={{
                                    label: 'import',
                                    icon: 'pi pi-download',
                                }}
                                name="file"
                                accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                customUpload={true}
                                uploadHandler={uploadHandler}
                                mode="basic"
                                className="mr-2"
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        visible={resultUpdateDialog}
                        style={{ width: '450px' }}
                        header="Result Details"
                        modal
                        className="p-fluid"
                        footer={updateResultDialogFooter}
                        onHide={hideUpdateResultDialog}
                    >
                        <div className="field">
                            <label htmlFor="file">File</label>

                            <FileUpload
                                ref={fileUploadRef}
                                chooseOptions={{
                                    label: 'import',
                                    icon: 'pi pi-download',
                                }}
                                name="file"
                                accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                customUpload={true}
                                uploadHandler={uploadHandler}
                                mode="basic"
                                className="mr-2"
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteResultDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteResultDialogFooter}
                        onHide={hideDeleteResultDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {result && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{result.semester}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteResultsDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteResultsDialogFooter}
                        onHide={hideDeleteResultsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {result && (
                                <span>
                                    Are you sure you want to delete the selected
                                    semester result?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
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
                    .catch((error) => {
                        console.log(error)
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

export default SemesterResult
