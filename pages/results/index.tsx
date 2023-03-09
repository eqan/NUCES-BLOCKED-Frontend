import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { Dropdown } from 'primereact/dropdown'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { returnFetchResultsHook } from './queries/getResult'
import { useMutation } from '@apollo/client'
import { DELETE_RESULT } from './queries/removeResult'
import { CREATE_RESULT } from './queries/addResult'
import { UPDATE_RESULT } from './queries/updateResult'
import { useRouter } from 'next/router'
import { Skeleton } from 'primereact/skeleton'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'
import { GET_USER_TYPE } from '../users/queries/getUserType'

interface ResultsInterface {
    id: string
    semester: string
    year: number
    url: string
    date: string
}
interface Props {
    userType: String
}

const SemesterResult: React.FC<Props> = (userType) => {
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
    const toast = useRef<Toast | null>(null)
    const dt = useRef<DataTable | null>(null)

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

    useEffect(() => {}, [globalFilter])

    const onUpload = () => {
        if (toast.current)
            toast.current.show({
                severity: 'info',
                summary: 'Success',
                detail: 'File Uploaded',
                life: 3000,
            })
    }

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

        const onUpload = () => {
            if (toast.current)
                toast.current.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'File Uploaded',
                    life: 3000,
                })
        }

        const addResult = async () => {
            setSubmitted(true)

            if (result.semester && result.year) {
                let _results = [...results]
                let _result = { ...result }
                try {
                    _results[_result.id] = _result
                    let newResult = await createResultFunction({
                        variables: {
                            CreateResultInput: {
                                year: result.year,
                                type: result.semester,
                                url: result.url,
                            },
                        },
                    })
                    newResult = newResult.data['CreateResult']
                    const mappedData: ResultsInterface =
                        mapSemesterToSemesterRecord(newResult)
                    _results = _results.filter(
                        (item) => (item.id = mappedData.id)
                    )
                    _results.push(mappedData)
                    setResults(_results)
                    if (toast.current)
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Academic Certificate Updated',
                            life: 3000,
                        })
                } catch (error) {
                    if (toast.current) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Academic Profile Not Updated',
                            life: 3000,
                        })
                    }
                    console.log(error)
                }

                setAddResultDialog(false)
                setResult(ResultsRecordInterface)
            }
        }

        const updateResult = async () => {
            setSubmitted(true)

            if (result.url) {
                let _results = [...results]
                let _result = { ...result }
                try {
                    const index = findIndexById(_result.id)
                    _results[index] = _result
                    await updateResultFunction({
                        variables: {
                            UpdateResultInput: {
                                id: '',
                                url: '',
                            },
                        },
                    })
                    setResults(_results)
                    if (toast.current)
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Academic Certificate Updated',
                            life: 3000,
                        })
                } catch (error) {
                    if (toast.current) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Academic Profile Not Updated',
                            life: 3000,
                        })
                    }
                    console.log(error)
                }

                setUpdateResultDialog(false)
                setResult(ResultsRecordInterface)
            }
        }

        const editResult = (result) => {
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
            try {
                await deleteResultFunction({
                    variables: {
                        DeleteResultInput: {
                            id: [result.id],
                        },
                    },
                })
                setResults(_results)
                if (toast.current && !resultDeleteDataError) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Semester Result Deleted',
                        life: 3000,
                    })
                }
            } catch (error) {
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Semester Result Not Deleted',
                        life: 3000,
                    })
                }
                console.log(error)
            }
            setDeleteResultDialog(false)
            setResult(ResultsRecordInterface)
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
            let _results = results.filter(
                (val) => !selectedResults.includes(val)
            )
            let _toBeDeletedResults = results
                .filter((val) => selectedResults.includes(val))
                .map((val) => val.id)

            try {
                await deleteResultFunction({
                    variables: {
                        DeleteResultInput: {
                            id: _toBeDeletedResults,
                        },
                    },
                })
                if (toast.current && !resultDeleteDataError) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Result Deleted',
                        life: 3000,
                    })
                }
            } catch (error) {
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Result Not Deleted',
                        life: 3000,
                    })
                }
                console.log(error)
            }
            setResults(_results)
            setSelectedResults([])
            setDeleteResultsDialog(false)
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
                            disabled={
                                !selectedResults || !selectedResults.length
                            }
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
                        onClick={exportCSV}
                    />
                    <Button
                        icon="pi pi-arrow-up"
                        className="p-button-rounded p-button-warning mr-2"
                        onClick={() => editResult(rowData)}
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
                            setGlobalFilter(
                                (e.target as HTMLInputElement).value
                            )
                        }
                        placeholder="Search..."
                    />
                </span>
            </div>
        )

        const addResultDialogFooter = (
            <>
                <Button
                    label="AddResult"
                    icon="pi pi-times"
                    className="p-button-text"
                    onClick={hideAddResultDialog}
                />
                <Button
                    label="Save"
                    icon="pi pi-check"
                    className="p-button-text"
                    onClick={addResult}
                />
            </>
        )

        const updateResultDialogFooter = (
            <>
                <Button
                    label="UpdateResult"
                    icon="pi pi-times"
                    className="p-button-text"
                    onClick={hideUpdateResultDialog}
                />
                <Button
                    label="Save"
                    icon="pi pi-check"
                    className="p-button-text"
                    onClick={updateResult}
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
                    onClick={deleteResult}
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
                    onClick={deleteSelectedResults}
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
        const semesters = [
            { name: 'FALL' },
            { name: 'SPRING' },
            { name: 'SUMMER' },
        ]
        return (
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
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
                                    onChange={(e) =>
                                        onInputChange(e, 'semester')
                                    }
                                    required
                                    autoFocus
                                    optionLabel="name"
                                    placeholder="Select a Semester"
                                    className={classNames({
                                        'p-invalid':
                                            submitted && !result.semester,
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
                                        onChange={(e) =>
                                            onInputChange(e, 'year')
                                        }
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
                                                    Invalid year, range from
                                                    1990 to Current Year
                                                </small>
                                            ))}
                                    <i className="pi pi-fw pi-calendar" />
                                </span>
                            </div>

                            <div className="field">
                                <label htmlFor="file">File</label>
                                <FileUpload
                                    chooseOptions={{
                                        label: 'import',
                                        icon: 'pi pi-download',
                                    }}
                                    mode="basic"
                                    name="demo[]"
                                    auto
                                    url="/api/upload"
                                    accept=".csv"
                                    className="mr-2"
                                    onUpload={onUpload}
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
                                <label htmlFor="hash">Hash</label>
                                <span className="p-input-icon-right">
                                    <InputText
                                        id="hash"
                                        value={result.url}
                                        onChange={(e) =>
                                            onInputChange(e, 'hash')
                                        }
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid':
                                                submitted && !result.url,
                                        })}
                                    />
                                    {submitted && !result.url && (
                                        <small className="p-invalid">
                                            Hash is required.
                                        </small>
                                    )}
                                    <i className="pi pi-fw pi-prime" />
                                </span>
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
                                        Are you sure you want to delete the
                                        selected semester result?
                                    </span>
                                )}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        )
    }
}

export default SemesterResult
export const getServerSideProps: GetServerSideProps = requireAuthentication(
    async (ctx) => {
        const { req } = ctx
        if (req.headers.cookie) {
            const tokens = req.headers.cookie.split(';')
            const token = tokens.find((token) => token.includes('access_token'))
            let userType = ''
            if (token) {
                const userEmail = jwt
                    .decode(tokens[1].split('=')[1].toString())
                    .email.toString()
                await apolloClient
                    .query({
                        query: GET_USER_TYPE,
                        variables: { userEmail },
                    })
                    .then((result) => {
                        userType = result.data.GetUserTypeByUserEmail.toString()
                    })
            }
            return {
                props: { userType },
            }
        }
    }
)
