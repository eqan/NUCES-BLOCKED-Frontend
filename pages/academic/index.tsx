import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import {
    DataTable,
    DataTableExpandedRows,
    DataTableRowEventParams,
} from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'
import { returnFetchContributionsHook } from '../../queries/academic/getStudentContributions'
import { useRouter } from 'next/router'
import { Skeleton } from 'primereact/skeleton'
import { CREATE_UPDATE_STUDENT_CONTRIBUTIONS_ADMIN as CREATE_UPDATE_STUDENT_CONTRIBUTIONS } from '../../queries/academic/createUpdateStudentContributionAdmin'
import { useMutation } from '@apollo/client'
import { DELETE_STUDENT_CONTRIBUTION_ADMIN as DELETE_STUDENT_CONTRIBUTION } from '../../queries/academic/deleteStudentContributionAdmin'
import { GET_USER_DATA } from '../../queries/users/getUser'

// Header Row: studentid, name, email,
// SubRow: id, Contribution, contributor, title

// First expand this to header then the subrow

interface HeadRowInterface {
    studentId: string
    name: string
    rollno: string
    email: string
}

interface SubRowInterface {
    id: string
    title: string
    type: string
    contribution: string
    updatedAt: string
}

interface Props {
    userType: string
    userSubType: string
}

const AcademicContributionsRecords: React.FC<Props> = ({
    userType,
    userSubType,
}) => {
    const router = useRouter()

    let HeaderRowRecordInterface = {
        studentId: '',
        name: '',
        rollno: '',
        email: '',
    }

    let SubRowRecordInterface = {
        id: '',
        title: '',
        contribution: '',
        email: '',
        updatedAt: '',
    }

    const mapContributionToHeadRowContributionRecord = (
        contribution: HeadRowInterface
    ) => {
        return {
            studentId: contribution.studentId,
            name: contribution.student.name,
            rollno: contribution.studentId,
            email: contribution.student.email,
        }
    }

    const mapContributionToSubRowContributionRecord = (
        contribution: SubRowInterface
    ) => {
        return {
            id: contribution.id,
            title: contribution.title,
            contribution: contribution.contribution,
            updatedAt: contribution.updatedAt,
        }
    }

    const [headers, setHeaders] = useState<HeadRowInterface[]>(
        [] as HeadRowInterface[]
    )
    const [subRows, setSubRows] = useState<SubRowInterface[]>(
        [] as SubRowInterface[]
    )
    const [expandedRows, setExpandedRows] =
        useState<DataTableExpandedRows>(null)
    const [academicDialog, setAcademicDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteAcademicDialog, setDeleteAcademicDialog] = useState(false)
    const [deleteAcademicsDialog, setDeleteAcademicsDialog] = useState(false)
    const [academic, setAcademic] = useState(HeaderRowRecordInterface)
    const [selectedAcademics, setSelectedAcademics] = useState<
        HeadRowInterface[]
    >([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)

    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable>(null)
    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = returnFetchContributionsHook(
        '',
        userType,
        page + 1,
        pageLimit,
        globalFilter
    )

    const [
        contributionDeleteFunction,
        {
            data: contributionDeleteData,
            loading: contributionDeleteLoading,
            error: contributionDeleteError,
            reset: contributionDeleteReset,
        },
    ] = useMutation(DELETE_STUDENT_CONTRIBUTION)

    const [
        contributionAddUpdateFunction,
        {
            data: contributionAddUpdateData,
            loading: contributionAddUpdateLoading,
            error: contributionAddUpdateError,
            reset: contributionAddUpdateReset,
        },
    ] = useMutation(CREATE_UPDATE_STUDENT_CONTRIBUTIONS)

    const returnHeadRecordsDataOfUserType = async () => {
        switch (userType) {
            case 'TEACHER':
                return (
                    contributionsData?.GetAllContributions
                        .teachersContribution || []
                )
            case 'CAREER_COUNSELLOR':
                return (
                    contributionsData?.GetAllContributions
                        .careerCounsellorContributions || []
                )
            case 'SOCIETY_HEAD':
                return (
                    contributionsData?.GetAllContributions
                        .societyHeadsContributions || []
                )
            default:
                return null
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        if (!contributionsLoading) {
            try {
                const contributionRecords =
                    await returnHeadRecordsDataOfUserType()
                const contributionHeadRecords = contributionRecords
                    ?.map(mapContributionToHeadRowContributionRecord)
                    ?.filter(
                        (record, index, self) =>
                            index === self.findIndex((r) => r.id === record.id)
                    )

                const contributionSubRecords = contributionRecords?.map(
                    mapContributionToSubRowContributionRecord
                )
                const total = contributionsData?.GetAllContributions?.total
                setHeaders(contributionHeadRecords)
                setSubRows(contributionSubRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (!contributionsLoading && contributionsData) {
            fetchData()
        }
    }, [contributionsData, contributionsLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            contributionsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [contributionsRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const hideDialog = () => {
        setSubmitted(false)
        setAcademicDialog(false)
    }

    const hideDeleteAcademicDialog = () => {
        setDeleteAcademicDialog(false)
    }

    const hideDeleteAcademicsDialog = () => {
        setDeleteAcademicsDialog(false)
    }

    const saveAcademic = async () => {
        setSubmitted(true)

        if (academic.contribution) {
            let _academics = [...headers]
            let _academic = { ...academic }
            if (academic.id) {
                const index = findIndexById(academic.id)

                _academics[index] = _academic
                try {
                    await contributionAddUpdateFunction({
                        variables: {
                            CreateUpdateStudentInput: {
                                contributionType: {
                                    type: 'SOCIETY_HEAD',
                                    contributionType: 'SOCIETY_HEAD',
                                    teacherContributionType: 'RESEARCH',
                                    societyHeadContributionType:
                                        'UNIVERSITY_EVENT',
                                    careerCounsellorContributionType: null,
                                },
                                contribution: 'Hosted FCAP speed programming',
                                title: 'Daira 2023',
                                contributor: 'Rehan Farooq',
                                studentId: '19F0256',
                            },
                        },
                    })
                    if (toast.current) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Academic Profile Updated',
                            life: 3000,
                        })
                    }
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
            }

            setHeaders(_academics)
            setAcademicDialog(false)
            setAcademic(HeaderRowRecordInterface)
        }
    }

    const editAcademic = (academic) => {
        setAcademic({ ...academic })
        setAcademicDialog(true)
    }

    const confirmDeleteAcademic = (academic) => {
        setAcademic(academic)
        setDeleteAcademicDialog(true)
    }

    const deleteAcademic = async () => {
        let _academics = headers.filter((val) => val.id !== academic.id)
        try {
            await contributionDeleteFunction({
                variables: {
                    DeleteContributionInput: {
                        contributionType: 'ADMIN',
                        studentId: academic.id,
                    },
                },
            })
            if (toast.current && !contributionDeleteError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Academic Profile Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Academic Profile Not Deleted',
                    life: 3000,
                })
            }
            console.log(error)
        }
        setAcademic(HeaderRowRecordInterface)
        setDeleteAcademicDialog(false)
        setHeaders(_academics)
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].id === id) {
                index = i
                break
            }
        }
        return index
    }

    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV()
        }
    }

    const confirmDeleteSelected = () => {
        setDeleteAcademicsDialog(true)
    }

    const deleteSelectedAcademics = async () => {
        let _academics = headers.filter(
            (val) => !selectedAcademics.includes(val)
        )
        try {
            selectedAcademics.map(async (academic) => {
                await contributionDeleteFunction({
                    variables: {
                        DeleteContributionInput: {
                            contributionType: 'ADMIN',
                            studentId: academic.id,
                        },
                    },
                })
            })
            if (toast.current && !contributionDeleteError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Academic Profile Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Academic Profile Not Deleted',
                    life: 3000,
                })
            }
            console.log(error)
        }
        setSelectedAcademics([])
        setHeaders(_academics)
        setDeleteAcademicsDialog(false)
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _academic = { ...academic }
        if (name == 'cgpa') {
            let stringbe = ''
            let i
            let value = val.toString()
            for (i = 0; i < value.length; i++) {
                if (i == 0) {
                    if (value[i] >= '0' && value[i] <= '4') {
                        stringbe += value[i]
                    }
                } else if (i == 1) {
                    if (value[i] == '.') {
                        stringbe += value[i]
                    }
                } else {
                    if (value[0] != 4) {
                        if (value[i] >= '0' && value[i] <= '9') {
                            stringbe += value[i]
                        }
                    } else {
                        stringbe += '0'
                    }
                }
            }
            if (stringbe.length > 4) {
                return
            }
            _academic[`${name}`] = stringbe
            setAcademic(_academic)
            return
        }
        _academic[`${name}`] = val
        setAcademic(_academic)
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={
                            !selectedAcademics || !selectedAcademics.length
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
    const dateBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Last Updated</span>
                {rowData.date}
            </>
        )
    }

    const cgpaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">CGPA</span>
                {rowData.cgpa}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success mr-2"
                    onClick={() => editAcademic(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteAcademic(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Academic Profile</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={async (e) => {
                        setGlobalFilter((e.target as HTMLInputElement).value)
                    }}
                    placeholder="Search..."
                />
            </span>
        </div>
    )

    const academicDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveAcademic}
            />
        </>
    )
    const deleteAcademicDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteAcademicDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={deleteAcademic}
            />
        </>
    )
    const deleteAcademicsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteAcademicsDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={deleteSelectedAcademics}
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

    const onRowExpand = (event: DataTableRowEventParams) => {
        toast.current.show({
            severity: 'info',
            summary: 'Product Expanded',
            detail: event.data.name,
            life: 3000,
        })
    }

    const onRowCollapse = (event: DataTableRowEventParams) => {
        toast.current.show({
            severity: 'success',
            summary: 'Product Collapsed',
            detail: event.data.name,
            life: 3000,
        })
    }

    const rowExpansionTemplate = (rowData) => {
        return (
            <div className="p-3">
                <DataTable value={rowData}>
                    <Column field="id" header="Id" sortable></Column>
                    <Column
                        field="title"
                        header="Contribution Title"
                        sortable
                    ></Column>
                    <Column
                        field="type"
                        header="Contribution Type"
                        sortable
                    ></Column>
                    <Column
                        field="contribution"
                        header="Description"
                        sortable
                    ></Column>
                    <Column field="date" header="Date" sortable></Column>
                    <Column headerStyle={{ width: '4rem' }}></Column>
                </DataTable>
            </div>
        )
    }
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
                            value={headers}
                            expandedRows={subRows}
                            onRowToggle={(e) => setExpandedRows(e?.data)}
                            onRowExpand={onRowExpand}
                            onRowCollapse={onRowCollapse}
                            rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="id"
                            header={header}
                            tableStyle={{ minWidth: '60rem' }}
                        >
                            <Column style={{ width: '5rem' }} />
                            <Column
                                field="studentId"
                                header="Student ID"
                                sortable
                            />
                            <Column
                                field="name"
                                header="Student Name"
                                sortable
                            />
                            <Column
                                field="email"
                                header="Student Email"
                                sortable
                            />
                        </DataTable>
                    )}

                    <Dialog
                        visible={academicDialog}
                        style={{ width: '450px' }}
                        header="Academic Details"
                        modal
                        className="p-fluid"
                        footer={academicDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="cgpa">CGPA</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="cgpa"
                                    value={academic.cgpa}
                                    onChange={(e) => onInputChange(e, 'cgpa')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid':
                                            submitted && !academic.cgpa,
                                    })}
                                />
                                {submitted && !academic.cgpa && (
                                    <small className="p-invalid">
                                        CGPA is required.
                                    </small>
                                )}
                                <i className="pi pi-fw pi-star" />
                            </span>
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteAcademicDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteAcademicDialogFooter}
                        onHide={hideDeleteAcademicDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {academic && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{academic.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteAcademicsDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteAcademicsDialogFooter}
                        onHide={hideDeleteAcademicsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {academic && (
                                <span>
                                    Are you sure you want to delete the selected
                                    Academic Profile?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AcademicContributionsRecords
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
                    userType: userData?.type,
                    userSubType: userData?.subType,
                },
            }
        }
    }
)
