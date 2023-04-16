import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable, DataTableExpandedRows } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toolbar } from 'primereact/toolbar'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
import { classNames } from 'primereact/utils'
import { returnFetchStudentHook } from '../../queries/students/getStudent'
import { toast, Toaster } from 'sonner'
import { ThemeContext } from '../../utils/customHooks/themeContextProvider'

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
    _id: string
    id: string
    title: string
    type: string
    contribution: string
    date: string
    studentId: string
}

interface AddContributionDialogInterface {
    _id: string
    id: string
    studentId: string
    title: string
    type: string
    contribution: string
    date: string
}

interface Props {
    userType: string | null
    userSubType: string | null
    userimg: string | null
}

const AcademicContributionsRecords: React.FC<Props> = (props) => {
    let HeaderRowRecordInterface = {
        studentId: '',
        name: '',
        email: '',
        subRows: [],
    }

    let AddContributionDialogInterface = {
        _id: '',
        id: '',
        studentId: '',
        title: '',
        type: '',
        contribution: '',
        date: '',
    }

    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [contributionEnums, setContributionEnums] = useState([])
    const [contributionEnumsForDialog, setContributionEnumsForDialog] =
        useState([])
    const [headers, setHeaders] = useState<HeadRowInterface[]>(
        [] as HeadRowInterface[]
    )
    const [addContributionData, setAddContributionData] =
        useState<AddContributionDialogInterface>(AddContributionDialogInterface)
    const [expandedRows, setExpandedRows] =
        useState<DataTableExpandedRows>(null)
    const [addContributionDialog, setAddContributionDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deleteContributionDialog, setDeleteContributionDialog] =
        useState(false)
    const [deleteContributionsDialog, setDeleteContributionsDialog] =
        useState(false)
    const [selectedHeadRowRecord, setSelectedHeadRowRecord] = useState(
        HeaderRowRecordInterface
    )
    const [selectedHeadRecords, setSelectedSubRecords] = useState<
        HeadRowInterface[]
    >([])
    const [submitted, setSubmitted] = useState(false)
    const [fetchStudentDataId, setFetchStudentDataId] = useState<string>(null)
    const [fetchStudentData, setFetchStudentData] = useState<string>(null)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)

    const dt = useRef<DataTable>(null)
    const [
        studentData,
        studentDataLoading,
        studentDataError,
        studentDataRefetch,
    ] = returnFetchStudentHook(fetchStudentDataId)

    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = returnFetchContributionsHook(
        props ? props.userSubType : null,
        props ? props.userType : null,
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

    const mapSubRowToSubRowRecord = (
        data: object,
        contributionType: string,
        studentId: string,
        parentIndex: number
    ) => {
        const nonEmptyArrays = Object.values(data).filter(
            (arr) => arr.length !== 0
        )

        const desiredObject = nonEmptyArrays[0].map(
            ({ id, contribution, title, updatedAt }) => ({
                id,
                contribution,
                title,
                updatedAt,
            })
        )[0]
        console.log(desiredObject)
        return {
            _id: headers[parentIndex].subRows.length,
            id: desiredObject.id,
            title: desiredObject.title,
            type: contributionType,
            contribution: desiredObject.contribution,
            date: desiredObject.updatedAt,
            studentId: studentId,
        }
    }

    const returnHeadRecordsDataOfUserType = async () => {
        if (props) {
            switch (props.userType) {
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
    }

    const returnContributionType = (item) => {
        if (props) {
            switch (props.userType) {
                case 'TEACHER':
                    return item.teacherContributionType
                case 'CAREER_COUNSELLOR':
                    return item.careerCounsellorContributionType
                case 'SOCIETY_HEAD':
                    return item.societyHeadContributionType
                default:
                    return null
            }
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
                    let index = -1
                    // Map the sub-rows for this group
                    const subRows = group.map((item) => ({
                        _id: (index += 1),
                        id: item.id,
                        title: item.title,
                        type: returnContributionType(item),
                        contribution: item.contribution,
                        date: item.updatedAt,
                        studentId: item.studentId,
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
        if (props) {
            switch (props.userType) {
                case 'TEACHER':
                    setContributionEnums(['TA_SHIP', 'RESEARCH'])
                    setContributionEnumsForDialog([
                        { type: 'TA_SHIP' },
                        { type: 'RESEARCH' },
                    ])
                    break
                case 'SOCIETY_HEAD':
                    setContributionEnums([
                        'UNIVERSITY_EVENT',
                        'COMPETITION_ACHIEVEMENT',
                    ])
                    setContributionEnumsForDialog([
                        { type: 'UNIVERSITY_EVENT' },
                        { type: 'COMPETITION_ACHIEVEMENT' },
                    ])
                    break
                case 'CAREER_COUNSELLOR':
                    setContributionEnums([
                        'EXCHANGE_PROGRAM',
                        'INTERNSHIP',
                        'FELLOWSHIP_PROGRAM',
                    ])
                    setContributionEnumsForDialog([
                        { type: 'EXCHANGE_PROGRAM' },
                        { type: 'INTERNSHIP' },
                        { type: 'FELLOWSHIP_PROGRAM' },
                    ])
                    break
                default:
                    break
            }
        }
    }, [])

    useEffect(() => {
        try {
            if (!studentDataLoading && studentData) {
                const data = studentData?.GetStudentDataByUserId
                setFetchStudentData(data)
            }
        } catch (error) {
            console.error(error)
        }
    }, [studentData, studentDataLoading])

    useEffect(() => {
        if (!contributionsLoading && contributionsData) {
            fetchData()
        }
    }, [contributionsData, contributionsLoading])

    useEffect(() => {
        if (!props) {
            router.push('/auth/login')
        } else {
            if (props.userType == 'ADMIN') {
                router.push('/pages/notfound')
            } else if (
                props.userType !== 'TEACHER' &&
                props.userType !== 'CAREER_COUNSELLOR' &&
                props.userType !== 'SOCIETY_HEAD'
            ) {
                router.push('/auth/login')
            }
        }
    }, [props])
    console.log(props)

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
        setAddContributionDialog(false)
    }

    const hideDeleteContributionDialog = () => {
        setDeleteContributionDialog(false)
    }

    const hideDeleteContributionsDialog = () => {
        setDeleteContributionsDialog(false)
    }

    const returnArrayOfType = (type) => {
        const types = {
            TEACHER: null,
            SOCIETY_HEAD: null,
            CAREER_COUNSELLOR: null,
        }
        if (props) {
            switch (props.userType) {
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
        }
        return types
    }

    const findIndexById = (id: any) => {
        let index = -1
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].studentId === id) {
                index = i
                break
            }
        }
        return index
    }

    const validateRollNo = () => {
        if (addContributionData.studentId) {
            let i
            let stringbe = ''
            for (i = 0; i < addContributionData.studentId.length; i++) {
                if (i != 2) {
                    if (i >= 1) {
                        if (
                            !(
                                addContributionData.studentId[i] >= '0' &&
                                addContributionData.studentId[i] <= '9'
                            )
                        ) {
                            return 0
                        }
                        stringbe += addContributionData.studentId[i]
                    } else {
                        if (
                            !(
                                addContributionData.studentId[i] >= '1' &&
                                addContributionData.studentId[i] <= '9'
                            )
                        ) {
                            return 0
                        }
                        stringbe += addContributionData.studentId[i]
                    }
                } else if (i == 2) {
                    if (
                        (addContributionData.studentId[i] >= 'a' &&
                            addContributionData.studentId[i] <= 'z') ||
                        (addContributionData.studentId[i] >= 'A' &&
                            addContributionData.studentId[i] <= 'Z')
                    ) {
                        stringbe +=
                            addContributionData.studentId[i].toUpperCase()
                    } else {
                        return 0
                    }
                }
            }
            if (stringbe.length != 7) {
                return 0
            }
            return 1
        }
    }

    const addContribution = async () => {
        if (
            addContributionData.contribution &&
            addContributionData.studentId &&
            addContributionData.type &&
            addContributionData.title &&
            validateRollNo()
        ) {
            setSubmitted(true)
            setAddContributionDialog(false)
            let _headers = [...headers]

            const types = returnArrayOfType(addContributionData.type.type)
            let parentIndex = findIndexById(addContributionData.studentId)

            if (!_headers[parentIndex]) {
                const headerRow: HeadRowInterface = {
                    studentId: addContributionData.studentId,
                    name: fetchStudentData.name,
                    email: fetchStudentData.email,
                    subRows: [],
                }
                parentIndex = _headers.push(headerRow) - 1
            }

            let _subRows = _headers[parentIndex].subRows
            try {
                let newContribution = await contributionAddFunction({
                    variables: {
                        CreateStudentInput: {
                            contributionType: {
                                type: props.userType,
                                contributionType: props.userType,
                                teacherContributionType: types['TEACHER'],
                                societyHeadContributionType:
                                    types['SOCIETY_HEAD'],
                                careerCounsellorContributionType:
                                    types['CAREER_COUNSELLOR'],
                            },
                            contribution: addContributionData.contribution,
                            title: addContributionData.title,
                            contributor: props.userSubType,
                            studentId: addContributionData.studentId,
                        },
                    },
                })
                newContribution = newContribution.data.CreateContribution
                const mappedData: SubRowInterface = mapSubRowToSubRowRecord(
                    newContribution,
                    addContributionData?.type?.type,
                    addContributionData.studentId,
                    parentIndex
                )
                _subRows.push(mappedData)
                _headers[parentIndex].subRows = _subRows
                setPageLimit(pageLimit + 1)
                setHeaders(_headers)
                setSelectedHeadRowRecord(HeaderRowRecordInterface)
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
        } else {
            throw new Error('Please fill all the fields to proceed!')
        }
        return 'Contribution Added!'
    }

    const saveContribution = async (subRowData, parentId) => {
        let { newData, index: subRowIndex } = subRowData
        const types = returnArrayOfType(newData.type)
        if (
            newData.contribution &&
            newData.id &&
            newData.type &&
            newData.title &&
            parentId
        ) {
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
                                    type: props.userType,
                                    contributionType: props.userType,
                                    teacherContributionType: types['TEACHER'],
                                    societyHeadContributionType:
                                        types['SOCIETY_HEAD'],
                                    careerCounsellorContributionType:
                                        types['CAREER_COUNSELLOR'],
                                },
                                id: newData.id,
                                contribution: newData.contribution,
                                title: newData.title,
                                contributor: props.userSubType,
                                studentId: parentId,
                            },
                        },
                    })
                    setHeaders(_headers)
                    setSelectedHeadRowRecord(HeaderRowRecordInterface)
                } catch (error) {
                    console.log(error)
                    throw new Error(error.message)
                }
            }
        } else {
            throw new Error('Please fill all the fields to proceed!')
        }
        return 'Contribution Updated!'
    }

    const openAddUpdateUserDialog = () => {
        setSelectedHeadRowRecord(HeaderRowRecordInterface)
        setSubmitted(false)
        setAddContributionDialog(true)
    }

    const confirmDeleteContribution = (rowData) => {
        setSelectedHeadRowRecord(rowData)
        setDeleteContributionDialog(true)
    }

    const deleteContribution = async () => {
        setDeleteContributionDialog(false)
        let _headers = [...headers]
        try {
            const parentIndex = findIndexById(selectedHeadRowRecord.studentId)
            let _subRows = _headers[parentIndex].subRows
            _subRows = _subRows.filter(
                (val) => val.id !== selectedHeadRowRecord.id
            )
            await contributionDeleteFunction({
                variables: {
                    deleteContributionInputs: [
                        {
                            contributionId: selectedHeadRowRecord.id,
                            contributionType: props.userType,
                            studentId: selectedHeadRowRecord.studentId,
                        },
                    ],
                },
            })
            _headers[parentIndex].subRows = _subRows
            if (contributionDeleteError) {
                console.log(contributionDeleteData.message)
                throw new Error(contributionDeleteData.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(contributionDeleteData.message)
        }
        setSelectedHeadRowRecord(HeaderRowRecordInterface)
        setHeaders(_headers)
        return 'Contribution removed!'
    }

    const deleteSelectedContributions = async () => {
        setDeleteContributionsDialog(false)
        let _headers = [...headers]
        let _subRowsToDelete: { id: string; studentId: string }[] = []
        selectedHeadRecords.forEach((record) => {
            const parentIndex = findIndexById(record.studentId)
            const subRows = _headers[parentIndex].subRows
            _subRowsToDelete.push(
                ...subRows
                    .filter((val) => val.id === record.id)
                    .map((val) => ({
                        contributionId: val.id,
                        studentId: record.studentId,
                        contributionType: props.userType,
                    }))
            )
            _headers[parentIndex].subRows = subRows.filter(
                (val) => val.id !== record.id
            )
        })

        try {
            await contributionDeleteFunction({
                variables: {
                    deleteContributionInputs: _subRowsToDelete,
                },
            })

            if (contributionDeleteError) {
                console.log(contributionDeleteError.message)
                throw new Error(contributionDeleteError.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setSelectedSubRecords([])
        setHeaders(_headers)
        return 'Selected contributions removed!'
    }

    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV()
        }
    }

    const confirmDeleteSelected = () => {
        setDeleteContributionsDialog(true)
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const leftToolbarTemplate = () => {
        return (
            <>
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
                            !selectedHeadRecords || !selectedHeadRecords.length
                        }
                    />
                </div>
            </>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <>
                <Button
                    label="Export"
                    icon="pi pi-upload"
                    className="p-button-help"
                    onClick={exportCSV}
                />
            </>
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
                {rowData._id}
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

    const deleteContributionButtonTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteContribution(rowData)}
                />
            </>
        )
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _contribution = { ...addContributionData }
        let stringbe = ''
        if (name == 'studentId') {
            let i
            stringbe = ''
            for (i = 0; i < val.length; i++) {
                if (i != 2) {
                    if (i >= 1) {
                        if (!(val[i] >= '0' && val[i] <= '9')) {
                            return
                        }
                        stringbe += val[i]
                    } else {
                        if (!(val[i] >= '1' && val[i] <= '9')) {
                            return
                        }
                        stringbe += val[i]
                    }
                } else if (i == 2) {
                    if (
                        (val[i] >= 'a' && val[i] <= 'z') ||
                        (val[i] >= 'A' && val[i] <= 'Z')
                    ) {
                        stringbe += val[i].toUpperCase()
                    } else {
                        return
                    }
                }
                if (stringbe.length > 7) {
                    return
                }
            }
            setFetchStudentDataId(stringbe)
            _contribution[`${name}`] = stringbe
            setAddContributionData(_contribution)
            return
        }
        _contribution[`${name}`] = val
        setAddContributionData(_contribution)
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Contributions</h5>
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
                onClick={() => {
                    toast.promise(addContribution, {
                        loading: 'Contribution is being added...',
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
    const deleteContributionDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteContributionDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteContribution, {
                        loading: 'Contribution is being removed...',
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
    const deleteContributionsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteContributionsDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteSelectedContributions, {
                        loading: 'Selected contributions are being removed...',
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
                        toast.promise(
                            saveContribution(subRowData, rowData.studentId),
                            {
                                loading: 'Contribution is being updated...',
                                success: (data) => {
                                    return data
                                },
                                error: (error) => {
                                    return error.message
                                },
                            }
                        )
                    }}
                    selection={selectedHeadRecords}
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
                        body={deleteContributionButtonTemplate}
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
                        visible={addContributionDialog}
                        style={{ width: '450px' }}
                        header="Contribution Details"
                        modal
                        className="p-fluid"
                        footer={addContributionDialogFooter}
                        onHide={hideContributionDialog}
                    >
                        <div className="field">
                            <label htmlFor="studentId">Student ID</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="studentId"
                                    value={addContributionData.studentId}
                                    onChange={(e) =>
                                        onInputChange(e, 'studentId')
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid':
                                            submitted &&
                                            !addContributionData.studentId,
                                    })}
                                />
                                {submitted &&
                                    !addContributionData.studentId && (
                                        <small className="p-invalid">
                                            StudentId is required.
                                        </small>
                                    )}
                                <i className="pi pi-fw pi-user" />
                            </span>
                        </div>

                        <div className="field">
                            <label htmlFor="title">Contribution Title</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="title"
                                    value={addContributionData.title}
                                    required
                                    onChange={(e) => onInputChange(e, 'title')}
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted &&
                                                !addContributionData.title,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted &&
                                                addContributionData.title,
                                        }
                                    )}
                                />
                                {submitted && !addContributionData.title && (
                                    <small className="p-invalid">
                                        Contribution Title is required.
                                    </small>
                                )}
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="type">Contribution Type</label>
                            <Dropdown
                                id="type"
                                value={addContributionData.type}
                                options={contributionEnumsForDialog}
                                required
                                autoFocus
                                onChange={(e) => onInputChange(e, 'type')}
                                optionLabel="type"
                                placeholder="Select a type"
                                className={classNames({
                                    'p-invalid':
                                        submitted && !addContributionData.type,
                                })}
                            />
                            {submitted && !addContributionData.type && (
                                <small className="p-invalid">
                                    Contribution Type is required.
                                </small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="contribution">
                                Contribution Description
                            </label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="contribution"
                                    value={addContributionData.contribution}
                                    required
                                    autoFocus
                                    onChange={(e) =>
                                        onInputChange(e, 'contribution')
                                    }
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted &&
                                                !addContributionData.contribution,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted &&
                                                addContributionData.contribution,
                                        }
                                    )}
                                />
                                {submitted &&
                                    !addContributionData.contribution && (
                                        <small className="p-invalid">
                                            Contribution Description is
                                            required.
                                        </small>
                                    )}
                                <i className="pi pi-bars" />
                            </span>
                        </div>
                    </Dialog>
                    <Dialog
                        visible={deleteContributionDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteContributionDialogFooter}
                        onHide={hideDeleteContributionDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {selectedHeadRowRecord && (
                                <span>
                                    Are you sure you want to delete selected
                                    contribution?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteContributionsDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteContributionsDialogFooter}
                        onHide={hideDeleteContributionsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {selectedHeadRowRecord && (
                                <span>
                                    Are you sure you want to delete the selected
                                    Contributions?
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
                    userType: userData?.type || null,
                    userSubType: userData?.subType || null,
                    userimg: userData?.imgUrl || null,
                },
            }
        }
    }
)
