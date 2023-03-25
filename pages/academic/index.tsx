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
import { CREATE_UPDATE_STUDENT_CONTRIBUTIONS } from '../../queries/academic/createUpdateStudentContributionAdmin'
import { useMutation } from '@apollo/client'
import { DELETE_STUDENT_CONTRIBUTION } from '../../queries/academic/deleteStudentContributionAdmin'
import { GET_USER_DATA } from '../../queries/users/getUser'

// Header Row: studentid, name, email,
// SubRow: id, Contribution, contributor, title

// First expand this to header then the subrow

interface HeadRowInterface {
    studentId: string
    name: string
    email: string
    subRows: SubRowInterface[]
}

interface SubRowInterface {
    id: string
    title: string
    type: string
    contribution: string
    date: string
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
        email: '',
        subRows: [],
    }

    const [headers, setHeaders] = useState<HeadRowInterface[]>(
        [] as HeadRowInterface[]
    )
    const [expandedRows, setExpandedRows] =
        useState<DataTableExpandedRows>(null)
    const [academicDialog, setAcademicDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteAcademicDialog, setDeleteContributionDialog] = useState(false)
    const [deleteAcademicsDialog, setDeleteContributionsDialog] =
        useState(false)
    const [headerRecord, setHeaderRecord] = useState(HeaderRowRecordInterface)
    const [selectedSubRecords, setSelectedSubRecords] = useState<
        HeadRowInterface[]
    >([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalHeaderRecords, setTotalHeaderRecords] = useState(1)

    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable>(null)
    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = returnFetchContributionsHook(
        userSubType,
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
                // console.log(contributionRecords)
                const total = contributionsData?.GetAllContributions?.total
                const groupedData = contributionRecords.reduce((acc, item) => {
                    if (!acc[item.studentId]) {
                        acc[item.studentId] = []
                    }
                    acc[item.studentId].push(item)
                    return acc
                }, {})

                // Map each group to a HeadRowInterface object
                const headRows = Object.values(groupedData).map((group) => {
                    // Map the sub-rows for this group
                    const subRows = group.map((item) => ({
                        id: item.id,
                        title: item.title,
                        type: item.teacherContributionType,
                        contribution: item.contribution,
                        date: item.updatedAt,
                    }))

                    // Create a new object that matches the HeadRowInterface and include the mapped sub-rows
                    return {
                        studentId: group[0].studentId,
                        name: group[0].student.name,
                        email: group[0].student.email,
                        subRows: subRows,
                    }
                })

                console.log(headRows)
                setHeaders(headRows)
                // setSubRows(contributionSubRecords)
                setTotalHeaderRecords(total)
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
        setDeleteContributionDialog(false)
    }

    const hideDeleteAcademicsDialog = () => {
        setDeleteContributionsDialog(false)
    }

    const saveAcademic = async () => {
        setSubmitted(true)

        if (headerRecord.contribution) {
            let _academics = [...headers]
            let _academic = { ...headerRecord }
            if (headerRecord.id) {
                const index = findIndexById(headerRecord.id)

                _academics[index] = _academic
                try {
                    await contributionAddUpdateFunction({
                        variables: {
                            CreateUpdateStudentInput: {
                                contributionType: {
                                    type: userType,
                                    contributionType: userType,
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
            setHeaderRecord(HeaderRowRecordInterface)
        }
    }

    const openAddUpdateUserDialog = () => {
        // setAcademic(SubRowRecordInterface)
        setSubmitted(false)
        setAcademicDialog(true)
    }
    const editAcademic = (academic) => {
        setHeaderRecord({ ...academic })
        setAcademicDialog(true)
    }

    const confirmDeleteAcademic = (academic) => {
        setHeaderRecord(academic)
        setDeleteContributionDialog(true)
    }

    const deleteAcademic = async () => {
        let _academics = headers.filter((val) => val.id !== headerRecord.id)
        try {
            await contributionDeleteFunction({
                variables: {
                    DeleteContributionInput: {
                        contributionType: userType,
                        studentId: headerRecord.id,
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
        setHeaderRecord(HeaderRowRecordInterface)
        setDeleteContributionDialog(false)
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
        setDeleteContributionsDialog(true)
    }

    const deleteSelectedContributions = async () => {
        let _academics = headers.filter(
            (val) => !selectedSubRecords.includes(val)
        )
        try {
            selectedSubRecords.map(async (academic) => {
                await contributionDeleteFunction({
                    variables: {
                        DeleteContributionInput: {
                            contributionType: userType,
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
        setSelectedSubRecords([])
        setHeaders(_academics)
        setDeleteContributionsDialog(false)
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _academic = { ...headerRecord }
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
            setHeaderRecord(_academic)
            return
        }
        _academic[`${name}`] = val
        setHeaderRecord(_academic)
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label="New"
                        icon="pi pi-plus"
                        className="p-button-success mr-2"
                        onClick={openAddUpdateUserDialog}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={
                            !selectedSubRecords || !selectedSubRecords.length
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

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Student Name</span>
                {rowData.name}
            </>
        )
    }

    const emailBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Student Email</span>
                {rowData.email}
            </>
        )
    }
    const studentIdBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Student ID</span>
                {rowData.studentId}
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
            <h5 className="m-0">Manage Contributions</h5>
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
                onClick={deleteSelectedContributions}
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

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution ID</span>
                {rowData.id}
            </>
        )
    }

    const titleBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution Title</span>
                {rowData.title}
            </>
        )
    }

    const contributionTypeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution Type</span>
                {rowData.type}
            </>
        )
    }

    const contributionDescriptionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution Description</span>
                {rowData.contribution}
            </>
        )
    }

    const rowExpansionTemplate = (rowData) => {
        return (
            <div className="p-3">
                <DataTable value={rowData.subRows}>
                    <Column
                        field="id"
                        header="Contribution ID"
                        sortable
                        body={idBodyTemplate}
                    />
                    <Column
                        field="title"
                        header="Contribution Title"
                        sortable
                        body={titleBodyTemplate}
                    />
                    <Column
                        field="type"
                        header="Contribution Type"
                        sortable
                        body={contributionTypeBodyTemplate}
                    />
                    <Column
                        field="contribution"
                        header="Description"
                        sortable
                        body={contributionDescriptionBodyTemplate}
                    />
                    <Column
                        field="updatedAt"
                        header="Date"
                        sortable
                        body={dateBodyTemplate}
                    />
                    <Column
                        body={actionBodyTemplate}
                        headerStyle={{ minWidth: '10rem' }}
                    ></Column>
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
                            dataKey="studentId"
                            header={header}
                            rowExpansionTemplate={rowExpansionTemplate}
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e?.data)}
                        >
                            <Column expander style={{ width: '5em' }} />
                            <Column
                                field="studentId"
                                header="Student ID"
                                body={studentIdBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            />
                            <Column
                                field="name"
                                header="Student Name"
                                body={nameBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            />
                            <Column
                                field="email"
                                header="Student Email"
                                body={emailBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
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
                            <label htmlFor="studentId">Student ID</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="studentId"
                                    value={headerRecord.studentId}
                                    onChange={(e) =>
                                        onInputChange(e, 'studentId')
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid':
                                            submitted &&
                                            !headerRecord.studentId,
                                    })}
                                />
                                {submitted && !headerRecord.studentId && (
                                    <small className="p-invalid">
                                        Student Id is required!
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
                            {headerRecord && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{headerRecord.name}</b>?
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
                            {headerRecord && (
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
