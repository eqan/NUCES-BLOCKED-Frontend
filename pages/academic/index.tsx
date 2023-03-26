import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable, DataTableExpandedRows } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import React, { useEffect, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'
import { returnFetchContributionsHook } from '../../queries/academic/getStudentContributions'
import { useRouter } from 'next/router'
import { Skeleton } from 'primereact/skeleton'
import { CREATE_STUDENT_CONTRIBUTIONS } from '../../queries/academic/createStudentContributionAdmin'
import { useMutation } from '@apollo/client'
import { DELETE_STUDENT_CONTRIBUTION } from '../../queries/academic/deleteStudentContributionAdmin'
import { GET_USER_DATA } from '../../queries/users/getUser'
import { Dropdown } from 'primereact/dropdown'
import { UPDATE_STUDENT_CONTRIBUTIONS } from '../../queries/academic/updateStudentContribution.dto'

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

    const [contributionEnums, setContributionEnums] = useState([])
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
    const [subRowRecord, setHeaderRecord] = useState(HeaderRowRecordInterface)
    const [selectedSubRecords, setSelectedSubRecords] = useState<
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
        contributionAddFunction,
        {
            data: contributionAddData,
            loading: contributionAddLoading,
            error: contributionAddError,
            reset: contributionAddReset,
        },
    ] = useMutation(CREATE_STUDENT_CONTRIBUTIONS)

    const [
        contributionUpdateFunction,
        {
            data: contributionUpdateData,
            loading: contributionUpdateLoading,
            error: contributionUpdateError,
            reset: contributionUpdateReset,
        },
    ] = useMutation(UPDATE_STUDENT_CONTRIBUTIONS)

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

                const total = contributionsData?.GetAllContributions.total
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

                setHeaders(headRows)
                setPageLimit(total)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        switch (userType) {
            case 'TEACHER':
                setContributionEnums(['TA_SHIP', 'RESEARCH'])
                break
            case 'SOCIETY_HEAD':
                setContributionEnums([
                    'UNIVERSITY_EVENT',
                    'COMPETITION_ACHIEVEMENT',
                ])
                break
            case 'CAREER_COUNSELLOR':
                setContributionEnums([
                    'EXCHANGE_PROGRAM',
                    'INTERNSHIP',
                    'FELLOWSHIP_PROGRAM',
                ])
                break
            default:
                break
        }
    }, [])

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

    const hideContributionDialog = () => {
        setSubmitted(false)
        setAcademicDialog(false)
    }

    const hideDeleteAcademicDialog = () => {
        setDeleteContributionDialog(false)
    }

    const hideDeleteAcademicsDialog = () => {
        setDeleteContributionsDialog(false)
    }

    const returnArrayOfType = (type) => {
        const types = {
            TEACHER: null,
            SOCIETY_HEAD: null,
            CAREER_COUNSELLOR: null,
        }
        switch (userType) {
            case 'TEACHER':
                types['TEACHER'] = type
                break
            case 'SOCIETY_HEAD':
                types['SOCIETY_HEAD'] = type
                break
            case 'CAREER_COUNSELLOR':
                types['CAREER_COUNSELLOR'] = type
                break
            default:
                break
        }
        return types
    }

    const addContribution = async () => {
        setSubmitted(true)
        if (subRowRecord.contribution) {
            let _academics = [...headers]
            let _academic = { ...subRowRecord }
            if (subRowRecord.id) {
                const index = findIndexById(subRowRecord.id)

                _academics[index] = _academic
                try {
                    await contributionAddFunction({
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

    const saveContribution = async (subRowData, parentId) => {
        let { newData, index: subRowIndex } = subRowData
        const types = returnArrayOfType(newData.type)
        if (newData.contribution) {
            let _headers = [...headers]
            let _subrow = { ...newData }
            if (newData.id) {
                const parentIndex = findIndexById(parentId)
                _headers[parentIndex].subRows[subRowIndex] = _subrow
                try {
                    await contributionUpdateFunction({
                        variables: {
                            UpdateStudentInput: {
                                contributionType: {
                                    type: userType,
                                    contributionType: userType,
                                    teacherContributionType: types['TEACHER'],
                                    societyHeadContributionType:
                                        types['SOCIETY_HEAD'],
                                    careerCounsellorContributionType:
                                        types['CAREER_COUNSELLOR'],
                                },
                                id: newData.id,
                                contribution: newData.contribution,
                                title: newData.title,
                                contributor: userSubType,
                                studentId: parentId,
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
            setHeaders(_headers)
            setHeaderRecord(HeaderRowRecordInterface)
        }
    }

    const openAddUpdateUserDialog = () => {
        // setAcademic(SubRowRecordInterface)
        setSubmitted(false)
        setAcademicDialog(true)
    }

    const confirmDeleteAcademic = (academic) => {
        setHeaderRecord(academic)
        setDeleteContributionDialog(true)
    }

    const deleteAcademic = async () => {
        let _academics = headers.filter((val) => val.id !== subRowRecord.id)
        try {
            await contributionDeleteFunction({
                variables: {
                    DeleteContributionInput: {
                        contributionType: userType,
                        studentId: subRowRecord.id,
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
            if (headers[i].studentId === id) {
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

    const contributionDescriptionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution Description</span>
                {rowData.contribution}
            </>
        )
    }

    const deleteAcademicButtonTemplate = (rowData) => {
        return (
            <>
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

    const addContributionDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideContributionDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={addContribution}
            />
        </>
    )
    const deleteContributionDialogFooter = (
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
    const deleteContributionsDialogFooter = (
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
    const contributionEnumEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={contributionEnums}
                onChange={(e) => {
                    options.editorCallback(e.value)
                }}
                placeholder="Select a Type"
                itemTemplate={(option) => {
                    return option
                }}
            />
        )
    }

    const contributionTemplate = (rowData) => {
        return rowData.type
    }
    const textEditor = (options) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
            />
        )
    }
    const rowExpansionTemplate = (rowData) => {
        return (
            <div className="p-3">
                <DataTable
                    value={rowData.subRows}
                    editMode="row"
                    onRowEditComplete={(subRowData) => {
                        saveContribution(subRowData, rowData.studentId)
                    }}
                    selection={selectedSubRecords}
                    onSelectionChange={(e) => setSelectedSubRecords(e.value)}
                    className="datatable-responsive"
                >
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: '4rem' }}
                    ></Column>

                    <Column
                        field="id"
                        header="Contribution ID"
                        sortable
                        body={idBodyTemplate}
                    />
                    <Column
                        field="title"
                        header="Contribution Title"
                        editor={textEditor}
                        sortable
                        body={titleBodyTemplate}
                    />
                    <Column
                        field="type"
                        header="Contribution Type"
                        sortable
                        editor={contributionEnumEditor}
                        body={contributionTemplate}
                    />
                    <Column
                        field="contribution"
                        header="Description"
                        sortable
                        editor={textEditor}
                        body={contributionDescriptionBodyTemplate}
                    />
                    <Column
                        field="updatedAt"
                        header="Date"
                        sortable
                        body={dateBodyTemplate}
                    />
                    <Column
                        rowEditor
                        bodyStyle={{ textAlign: 'right' }}
                    ></Column>
                    <Column
                        body={deleteAcademicButtonTemplate}
                        bodyStyle={{ textAlign: 'left' }}
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
                            totalRecords={totalRecords}
                            loading={isLoading}
                            responsiveLayout="scroll"
                            emptyMessage="No Contributions found."
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} contributions"
                            className="datatable-responsive"
                            defaultValue={1}
                            paginator
                            rows={pageLimit}
                            first={page * pageLimit}
                            onPage={onPageChange}
                            rowsPerPageOptions={[5, 10, totalRecords]}
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
                        visible={userSaveDialog}
                        style={{ width: '450px' }}
                        header="User Details"
                        modal
                        className="p-fluid"
                        footer={addContributionDialogFooter}
                        onHide={hideContributionDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="name"
                                    value={user.name}
                                    onChange={(e) => onInputChange(e, 'name')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !user.name,
                                    })}
                                />
                                {submitted && !user.name && (
                                    <small className="p-invalid">
                                        Name is required.
                                    </small>
                                )}
                                <i className="pi pi-fw pi-user" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="email"
                                    value={user.email}
                                    onChange={(e) => onInputChange(e, 'email')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !user.email,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && user.email,
                                        }
                                    )}
                                />
                                {(submitted && !user.email && (
                                    <small className="p-invalid">
                                        Email is required.
                                    </small>
                                )) ||
                                    (submitted &&
                                        user.email &&
                                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                            user.email
                                        ) && (
                                            <small className="p-invalid1">
                                                Invalid email address. E.g.
                                                example@email.com
                                            </small>
                                        ))}
                                <i className="pi pi-envelope" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="role">Role</label>
                            <Dropdown
                                id="role"
                                value={role}
                                options={roles}
                                onChange={(e) => onInputChange(e, 'role')}
                                required
                                autoFocus
                                optionLabel="name"
                                placeholder="Select a Role"
                                className={classNames({
                                    'p-invalid': submitted && !user.role,
                                })}
                            />
                            {submitted && !user.role && (
                                <small className="p-invalid">
                                    Role is required.
                                </small>
                            )}
                        </div>
                    </Dialog>
                    <Dialog
                        visible={deleteAcademicDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteContributionDialogFooter}
                        onHide={hideDeleteAcademicDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {subRowRecord && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{subRowRecord.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteAcademicsDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteContributionsDialogFooter}
                        onHide={hideDeleteAcademicsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {subRowRecord && (
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
