import { useMutation } from '@apollo/client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { CREATE_CERTIFICATE } from '../../../queries/degree/addCertificate'
import { returnFetchCertificatesHook } from '../../../queries/degree/getCertificates'
import { DELETE_CERTIFICATE } from '../../../queries/degree/removeCertificate'
import { UPDATE_CERTIFICATE } from '../../../queries/degree/updateCertificate'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../../layout/context/requireAuthetication'
import apolloClient from '../../../apollo-client'
import jwt from 'jsonwebtoken'
import { GET_USER_DATA } from '../../../queries/users/getUser'
import { Toaster, toast } from 'sonner'

interface Props {
    userType: string | null
    userimg: string | null
}

interface CertificateInterface {
    id: string
    name: string
    rollno: string
    date: string
    hash: string
}
const CertificateRecords: React.FC<Props> = (props) => {
    let CertificateRecordInterface = {
        id: '',
        name: '',
        rollno: '',
        date: '',
        hash: '',
    }

    const mapCertificateToCertificateRecord = (
        certificate: CertificateInterface
    ) => {
        return {
            id: certificate.id,
            name: certificate.student.name,
            rollno: certificate.id,
            date: certificate.updatedAt,
            hash: certificate.url,
        }
    }
    const router = useRouter()
    const [degrees, setDegrees] = useState<CertificateInterface[]>([])
    const [degreeAddDialog, setAddDegreeDialog] = useState(false)
    const [degreeUpdateDialog, setUpdateDegreeDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteDegreeDialog, setDeleteDegreeDialog] = useState(false)
    const [deleteDegreesDialog, setDeleteDegreesDialog] = useState(false)
    const [degree, setDegree] = useState(CertificateRecordInterface)
    const [selectedDegrees, setSelectedDegrees] = useState<
        CertificateInterface[]
    >([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable>(null)

    const [
        certificatesData,
        certificatesLoading,
        certificatesFetchingError,
        certificatesRefetchHook,
    ] = returnFetchCertificatesHook(globalFilter, page + 1, pageLimit)

    const [
        deleteCertificateFunction,
        {
            data: certificateDeleteData,
            loading: certificateDeteDataLoading,
            error: certificateDeleteDataError,
            reset: certificateDeleteDataReset,
        },
    ] = useMutation(DELETE_CERTIFICATE)

    const [
        createCertificateFunction,
        {
            data: certifcateCreateData,
            loading: certificateCreateDataLoading,
            error: certificateCreateDataError,
            reset: certificateCreateDataReset,
        },
    ] = useMutation(CREATE_CERTIFICATE)

    const [
        updateCertificateFunction,
        {
            data: certificateUpdateData,
            loading: certificateUpdateDataLoading,
            error: certificateUpdateDataError,
            reset: certificateUpdateDataReset,
        },
    ] = useMutation(UPDATE_CERTIFICATE)

    const fetchData = async () => {
        setIsLoading(true)
        if (!certificatesLoading) {
            try {
                let _degrees =
                    certificatesData?.GetAllCertificates.items.filter(
                        (val) => val.id != ''
                    )
                const certificateRecords =
                    _degrees.map(mapCertificateToCertificateRecord) || []
                const total = certificatesData?.GetAllCertificates?.total
                setDegrees(certificateRecords)
                setTotalRecords(total)
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

    useEffect(() => {
        if (!props) {
            router.push('/auth/login')
        } else {
            if (
                props.userType == 'TEACHER' ||
                props.userType == 'CAREER_COUNSELLOR' ||
                props.userType == 'SOCIETY_HEAD'
            ) {
                router.push('/pages/notfound')
            } else if (props.userType !== 'ADMIN') {
                router.push('/auth/login')
            }
        }
    }, [props])

    useEffect(() => {
        const handleRouteChange = () => {
            certificatesRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [certificatesRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const openNewAddDegreeDialog = () => {
        setDegree(CertificateRecordInterface)
        setSubmitted(false)
        setAddDegreeDialog(true)
    }

    const hideAddDegreeDialog = () => {
        setSubmitted(false)
        setAddDegreeDialog(false)
    }

    const hideUpdateDegreeDialog = () => {
        setSubmitted(false)
        setUpdateDegreeDialog(false)
    }

    const hideDeleteDegreeDialog = () => {
        setDeleteDegreeDialog(false)
    }

    const hideDeleteDegreesDialog = () => {
        setDeleteDegreesDialog(false)
    }

    const addDegree = async () => {
        if (degree.hash && degree.rollno) {
            setSubmitted(true)
            setAddDegreeDialog(false)
            let _degrees = [...degrees]
            let _degree = { ...degree }
            try {
                _degrees[_degree.rollno] = _degree
                let newDegree = await createCertificateFunction({
                    variables: {
                        CreateCertificateInput: {
                            id: _degree.rollno,
                            url: _degree.hash,
                        },
                    },
                })
                newDegree = newDegree.data['CreateCertificate']
                const mappedData: CertificateInterface =
                    mapCertificateToCertificateRecord(newDegree)
                _degrees = _degrees.filter(
                    (item) => (item.rollno = mappedData.id)
                )
                _degrees.push(mappedData)
                setDegrees(_degrees)
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }

            setDegree(CertificateRecordInterface)
        }
        return 'Degree Added!'
    }

    const updateDegree = async () => {
        if (degree.hash) {
            setSubmitted(true)
            let _degrees = [...degrees]
            let _degree = { ...degree }
            try {
                const index = findIndexById(_degree.rollno)
                _degrees[index] = _degree
                await updateCertificateFunction({
                    variables: {
                        UpdateCertificateInput: {
                            id: _degree.id,
                            url: _degree.hash,
                        },
                    },
                })
                setDegrees(_degrees)
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }

            setUpdateDegreeDialog(false)
            setDegree(CertificateRecordInterface)
        }
        return 'Degree Updated!'
    }

    const editDegree = (degree) => {
        setDegree({ ...degree })
        setUpdateDegreeDialog(true)
    }

    const confirmDeleteDegree = (degree) => {
        setDegree(degree)
        setDeleteDegreeDialog(true)
    }

    const deleteDegree = async () => {
        let _degrees = degrees.filter((val) => val.id !== degree.id)
        setDeleteDegreeDialog(false)
        try {
            await deleteCertificateFunction({
                variables: {
                    DeleteCertificateInput: {
                        id: [degree.rollno],
                    },
                },
            })
            setDegrees(_degrees)
            if (certificateDeleteDataError) {
                throw new Error(certificateDeleteDataError.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setDegree(CertificateRecordInterface)
        return 'Degree removed!'
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < degrees.length; i++) {
            if (degrees[i].id === id) {
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
        setDeleteDegreesDialog(true)
    }

    const deleteSelectedDegrees = async () => {
        let _degrees = degrees.filter((val) => !selectedDegrees.includes(val))
        let _toBeDeletedDegrees = degrees
            .filter((val) => selectedDegrees.includes(val))
            .map((val) => val.id)
        setDeleteDegreesDialog(false)
        try {
            await deleteCertificateFunction({
                variables: {
                    DeleteCertificateInput: {
                        id: _toBeDeletedDegrees,
                    },
                },
            })

            if (certificateDeleteDataError) {
                throw new Error(certificateDeleteDataError.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setSelectedDegrees([])
        setDegrees(_degrees)
        return 'Selected degrees removed!'
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _degree = { ...degree }
        _degree[`${name}`] = val
        setDegree(_degree)
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
                        onClick={openNewAddDegreeDialog}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedDegrees || !selectedDegrees.length}
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

    const rollnoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Roll No.</span>
                {rowData.rollno}
            </>
        )
    }

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Full Name</span>
                {rowData.name}
            </>
        )
    }

    const hashBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Hash</span>
                {rowData.hash}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-arrow-down"
                    className="p-button-rounded p-button-success mr-2"
                />
                <Button
                    icon="pi pi-refresh"
                    className="p-button-rounded p-button-warning mr-2"
                    onClick={() => editDegree(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteDegree(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Certificate</h5>
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

    const addDegreeDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddDegreeDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(addDegree, {
                        loading: 'Degree is being added...',
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

    const updateDegreeDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUpdateDegreeDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(updateDegree, {
                        loading: 'Degree is being updated...',
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
    const deleteDegreeDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteDegreeDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteDegree, {
                        loading: 'Degree is being removed...',
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
    const deleteDegreesDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteDegreesDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteSelectedDegrees, {
                        loading: 'Selected degrees are being removed...',
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

    const theme = localStorage?.getItem('theme') == 'Dark' ? 'dark' : 'light'

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
                            value={degrees}
                            selection={selectedDegrees}
                            onSelectionChange={(e) =>
                                setSelectedDegrees(e.value)
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
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} degrees"
                            emptyMessage="No degrees found."
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
                                field="hash"
                                header="Hash"
                                body={hashBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            ></Column>
                            <Column
                                field="name"
                                header="Full Name"
                                sortable
                                body={nameBodyTemplate}
                                headerStyle={{ minWidth: '15rem' }}
                            ></Column>
                            <Column
                                field="rollno"
                                header="Roll No."
                                sortable
                                body={rollnoBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>

                            <Column
                                body={actionBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>
                        </DataTable>
                    )}

                    <Dialog
                        visible={degreeAddDialog}
                        style={{ width: '450px' }}
                        header="Degree Details"
                        modal
                        className="p-fluid"
                        footer={addDegreeDialogFooter}
                        onHide={hideAddDegreeDialog}
                    >
                        <div className="field">
                            <label htmlFor="rollno">Roll No.</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="rollno"
                                    value={degree.rollno}
                                    onChange={(e) => onInputChange(e, 'rollno')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !degree.rollno,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && degree.rollno,
                                        }
                                    )}
                                />
                                <i className="pi pi-fw pi-id-card" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="hash">Hash</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="hash"
                                    value={degree.hash}
                                    onChange={(e) => onInputChange(e, 'hash')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !degree.hash,
                                    })}
                                />
                                {submitted && !degree.hash && (
                                    <small className="p-invalid">
                                        Hash is required.
                                    </small>
                                )}
                                <i className="pi pi-fw pi-prime" />
                            </span>
                        </div>
                    </Dialog>

                    <Dialog
                        visible={degreeUpdateDialog}
                        style={{ width: '450px' }}
                        header="Degree Details"
                        modal
                        className="p-fluid"
                        footer={updateDegreeDialogFooter}
                        onHide={hideUpdateDegreeDialog}
                    >
                        <div className="field">
                            <label htmlFor="hash">Hash</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="hash"
                                    value={degree.hash}
                                    onChange={(e) => onInputChange(e, 'hash')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !degree.hash,
                                    })}
                                />
                                {submitted && !degree.hash && (
                                    <small className="p-invalid">
                                        Hash is required.
                                    </small>
                                )}
                                <i className="pi pi-fw pi-prime" />
                            </span>
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteDegreeDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDegreeDialogFooter}
                        onHide={hideDeleteDegreeDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {degree && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{degree.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteDegreesDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDegreesDialogFooter}
                        onHide={hideDeleteDegreesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {degree && (
                                <span>
                                    Are you sure you want to delete the selected
                                    academic certificate
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

export default CertificateRecords
