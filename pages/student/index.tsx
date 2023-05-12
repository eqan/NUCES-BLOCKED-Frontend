import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toolbar } from 'primereact/toolbar'
import { Skeleton } from 'primereact/skeleton'
import { classNames } from 'primereact/utils'
import jwt from 'jsonwebtoken'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { CREATE_STUDENT } from '../../queries/students/addStudent'
import { returnFetchStudentsHook } from '../../queries/students/getStudents'
import { DELETE_STUDENT } from '../../queries/students/removeStudent'
import { UPDATE_STUDENT } from '../../queries/students/updateStudent'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import { GET_USER_DATA } from '../../queries/users/getUser'
import { toast, Toaster } from 'sonner'
import { ThemeContext } from '../../utils/customHooks/themeContextProvider'
import { Props } from '../../utils/interfaces/UserPropsForAuthentication'
import { serverSideProps } from '../../utils/requireAuthentication'

interface StudentInterface {
    id: string
    name: string
    rollno: string
    email: string
    date: string
    batch: string
    cgpa: string
    honours: string
    eligibilityStatus: string
}

const StudentRecords: React.FC<Props> = (props) => {
    let StudentRecordInterface: StudentInterface = {
        id: '',
        name: '',
        rollno: '',
        email: '',
        cgpa: '',
        batch: '',
        date: '',
        honours: '',
        eligibilityStatus: '',
    }

    const mapStudentToStudentRecord = (student: StudentInterface) => {
        return {
            id: student.id,
            name: student.name,
            rollno: student.id,
            email: student.email,
            cgpa: student.cgpa,
            batch: student.batch,
            date: student.updatedAt,
            honours: student.honours,
            eligibilityStatus: student.eligibilityStatus,
        }
    }

    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [students, setStudents] = useState<StudentInterface[]>([])
    const [studentDialog, setStudentDialog] = useState(false)
    const [deleteStudentDialog, setDeleteStudentDialog] = useState(false)
    const [deleteStudentsDialog, setDeleteStudentsDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [student, setStudent] = useState(StudentRecordInterface)
    const [selectedStudents, setSelectedStudents] = useState<
        StudentInterface[]
    >([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable | null>(null)

    const [
        studentsData,
        studentsLoading,
        studentsFetchingError,
        studentsRefetchHook,
    ] = returnFetchStudentsHook(globalFilter, page + 1, pageLimit)

    const [
        deleteStudentFunction,
        {
            data: studentDeleteData,
            loading: studentDeteDataLoading,
            error: studentDeleteDataError,
            reset: studentDeleteDataReset,
        },
    ] = useMutation(DELETE_STUDENT)

    const [
        createStudentFunction,
        {
            data: certifcateCreateData,
            loading: studentCreateDataLoading,
            error: studentCreateDataError,
            reset: studentCreateDataReset,
        },
    ] = useMutation(CREATE_STUDENT)

    const [
        updateStudentFunction,
        {
            data: studentUpdateData,
            loading: studentUpdateDataLoading,
            error: studentUpdateDataError,
            reset: studentUpdateDataReset,
        },
    ] = useMutation(UPDATE_STUDENT)

    const fetchData = async () => {
        setIsLoading(true)
        if (!studentsLoading) {
            try {
                let _students = studentsData?.GetAllStudents.items.filter(
                    (val) => val.id != ''
                )
                const studentsRecords =
                    _students.map(mapStudentToStudentRecord) || []
                const total = _students?.GetAllStudents?.total
                setStudents(studentsRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (!studentsLoading && studentsData) {
            fetchData()
        }
    }, [studentsData, studentsLoading])

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
        const handleRouteChange = () => {
            studentsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [studentsRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const openNew = () => {
        let _student = StudentRecordInterface
        setStudent(_student)
        setSubmitted(false)
        setStudentDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setStudentDialog(false)
    }

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false)
    }

    const hideDeleteStudentsDialog = () => {
        setDeleteStudentsDialog(false)
    }

    const saveStudent = async () => {
        setSubmitted(true)
        if (
            student.name.trim() &&
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(student.email) &&
            student.email &&
            student.rollno &&
            validateRollNo()
        ) {
            setStudentDialog(false)
            let _students = [...students]
            let _student = { ...student }
            let message = ''
            try {
                const index = findIndexById(_student.id)
                if (index == -1) {
                    _students[_student.rollno] = _student
                    let newStudent = await createStudentFunction({
                        variables: {
                            CreateStudentInput: {
                                id: _student.rollno,
                                name: _student.name,
                                email: _student.email,
                                cgpa: _student.cgpa,
                                batch: _student.batch,
                                honours: _student.honours,
                            },
                        },
                    })
                    newStudent = newStudent.data['CreateStudent']
                    const mappedData: StudentInterface =
                        mapStudentToStudentRecord(newStudent)
                    _students = _students.filter(
                        (item) => (item.rollno = mappedData.rollno)
                    )
                    _students.push(mappedData)
                    message = 'Student Added!'
                } else {
                    _students[index] = _student
                    await updateStudentFunction({
                        variables: {
                            UpdateStudentInput: {
                                id: _student.rollno,
                                email: _student.email,
                                name: _student.name,
                                cgpa: _student.cgpa,
                                batch: _student.batch,
                                honours: _student.honours,
                                eligibilityStatus: _student.eligibilityStatus,
                            },
                        },
                    })
                    message = 'Student Updated!'
                }
                setStudents(_students)
                setStudent(StudentRecordInterface)
                return message
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
        } else {
            throw new Error('Please fill all the fields to proceed!')
        }
    }

    const editStudent = (student) => {
        setStudent({ ...student })
        setStudentDialog(true)
    }

    const confirmDeleteStudent = (student) => {
        setStudent(student)
        setDeleteStudentDialog(true)
    }

    const deleteStudent = async () => {
        let _students = students.filter((val) => val.id !== student.id)
        setDeleteStudentDialog(false)
        try {
            await deleteStudentFunction({
                variables: {
                    DeleteStudentInput: {
                        id: [student.rollno],
                    },
                },
            })
            setStudents(_students)
            if (studentDeleteDataError) {
                throw new Error(studentDeleteDataError.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setDeleteStudentDialog(false)
        setStudent(StudentRecordInterface)
        return 'Student is removed!'
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < students.length; i++) {
            if (students[i].id === id) {
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
        setDeleteStudentsDialog(true)
    }

    const deleteSelectedStudents = async () => {
        let _students = students.filter(
            (val) => !selectedStudents.includes(val)
        )
        let _toBeDeletedStudents = students
            .filter((val) => selectedStudents.includes(val))
            .map((val) => val.id)
        setDeleteStudentsDialog(false)
        try {
            await deleteStudentFunction({
                variables: {
                    DeleteStudentInput: {
                        id: _toBeDeletedStudents,
                    },
                },
            })
            if (studentDeleteDataError) {
                throw new Error(studentCreateDataError.message)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
        setStudents(_students)
        setDeleteStudentsDialog(false)
        setSelectedStudents([])
        return 'Selected students are removed!'
    }

    const validateRollNo = () => {
        if (student.rollno) {
            let i
            let stringbe = ''
            for (i = 0; i < student.rollno.length; i++) {
                if (i != 2) {
                    if (i >= 1) {
                        if (
                            !(
                                student.rollno[i] >= '0' &&
                                student.rollno[i] <= '9'
                            )
                        ) {
                            return 0
                        }
                        stringbe += student.rollno[i]
                    } else {
                        if (
                            !(
                                student.rollno[i] >= '1' &&
                                student.rollno[i] <= '9'
                            )
                        ) {
                            return 0
                        }
                        stringbe += student.rollno[i]
                    }
                } else if (i == 2) {
                    if (
                        (student.rollno[i] >= 'a' &&
                            student.rollno[i] <= 'z') ||
                        (student.rollno[i] >= 'A' && student.rollno[i] <= 'Z')
                    ) {
                        stringbe += student.rollno[i].toUpperCase()
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

    const validateYear = () => {
        if (student.batch) {
            let temp = parseInt(student.batch)
            let today = new Date()
            if (!(temp >= 2014 && temp <= today.getFullYear())) {
                return 0
            }
            return 1
        }
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _student = { ...student }
        let stringbe
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
            _student[`${name}`] = stringbe
            setStudent(_student)
            return
        } else if (name == 'batch') {
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
            _student[`${name}`] = stringbe
            setStudent(_student)
            return
        } else if (name == 'name') {
            let i
            let stringbe = ''
            for (i = 0; i < val.length; i++) {
                if (
                    (val[i] >= 'a' && val[i] <= 'z') ||
                    (val[i] >= 'A' && val[i] <= 'Z') ||
                    val[i] == ' '
                ) {
                    stringbe += val[i]
                }
            }
            _student[`${name}`] = stringbe
            setStudent(_student)
            return
        } else if (name == 'rollno') {
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
            }
            if (stringbe.length > 7) {
                return
            }
            _student[`${name}`] = stringbe
            setStudent(_student)
            return
        }
        _student[`${name}`] = val
        setStudent(_student)
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
                        onClick={openNew}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedStudents || !selectedStudents.length}
                    />
                </div>
            </React.Fragment>
        )
    }

    const toCapitalize = (s) => {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    const importCSV = (e) => {
        const file = e.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            const csv = (e.target as FileReader | any).result
            const data = csv.split('\n')
            console.log(data)

            // Prepare DataTable
            const cols = data[0].replace(/['"]+/g, '').split(',')
            data.shift()

            let _importedCols = cols.map((col) => ({
                field: col,
                header: toCapitalize(col.replace(/['"]+/g, '')),
            }))
            let _importedData = data.map((d) => {
                d = d.split(',')
                return cols.reduce((obj, c, i) => {
                    if (c == 'Full Name') {
                        c = 'name'
                    }
                    if (c == 'Roll No.') {
                        c = 'rollno'
                    }
                    if (c == 'Email') {
                        c = 'email'
                    }
                    obj[c] = d[i].replace(/['"]+/g, '')
                    return obj
                }, {})
            })

            let _students = [...students]
            console.log(_students)
            for (let i = 0; i < _importedData.length; i++) {
                // _importedData[i].id = createId()
                _students.push(_importedData[i])
            }
            setStudents(_students)
        }

        reader.readAsText(file, 'UTF-8')
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload
                    chooseOptions={{ label: 'import', icon: 'pi pi-download' }}
                    mode="basic"
                    name="demo[]"
                    auto
                    url="/api/upload" // <- Need to check this out
                    accept=".csv"
                    className="mr-2"
                    onUpload={importCSV}
                />
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

    const cgpaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">CGPA</span>
                {rowData.cgpa}
            </>
        )
    }

    const honoursBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">CGPA</span>
                {rowData.honours}
            </>
        )
    }

    const batchBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Batch</span>
                {rowData.batch}
            </>
        )
    }

    const emailBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success mr-2"
                    onClick={() => editStudent(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteStudent(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Students</h5>
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

    const studentDialogFooter = (
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
                onClick={() => {
                    toast.promise(saveStudent, {
                        loading: 'Result is being added/modified...',
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
    const deleteStudentDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteStudentDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteStudent, {
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
    const deleteStudentsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteStudentsDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteSelectedStudents, {
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
                            value={students}
                            selection={selectedStudents}
                            onSelectionChange={(e) =>
                                setSelectedStudents(e.value)
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
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                            emptyMessage="No students found."
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
                                field="email"
                                header="Email"
                                body={emailBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
                            ></Column>
                            <Column
                                field="batch"
                                header="Batch"
                                body={batchBodyTemplate}
                                sortable
                            ></Column>
                            <Column
                                field="cgpa"
                                header="CGPA"
                                body={cgpaBodyTemplate}
                                sortable
                            ></Column>
                            <Column
                                field="honours"
                                header="Honours"
                                body={honoursBodyTemplate}
                                sortable
                            ></Column>

                            <Column
                                body={actionBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>
                        </DataTable>
                    )}

                    <Dialog
                        visible={studentDialog}
                        style={{ width: '450px' }}
                        header="Student Details"
                        modal
                        className="p-fluid"
                        footer={studentDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="name"
                                    value={student.name}
                                    onChange={(e) => onInputChange(e, 'name')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !student.name,
                                    })}
                                />
                                {submitted && !student.name && (
                                    <small className="p-invalid">
                                        Name is required.
                                    </small>
                                )}
                                <i className="pi pi-fw pi-user" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="rollno">Roll No.</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="rollno"
                                    value={student.rollno}
                                    onChange={(e) => onInputChange(e, 'rollno')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !student.rollno,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && student.rollno,
                                        }
                                    )}
                                />
                                {(submitted && !student.rollno && (
                                    <small className="p-invalid">
                                        Roll No. is required.
                                    </small>
                                )) ||
                                    (submitted &&
                                        student.rollno &&
                                        !validateRollNo() && (
                                            <small className="p-invalid1">
                                                Valid Roll no. is like 19F0000
                                            </small>
                                        ))}
                                <i className="pi pi-fw pi-id-card" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="email"
                                    value={student.email}
                                    onChange={(e) => onInputChange(e, 'email')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !student.email,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && student.email,
                                        }
                                    )}
                                />
                                {(submitted && !student.email && (
                                    <small className="p-invalid">
                                        Email is required.
                                    </small>
                                )) ||
                                    (submitted &&
                                        student.email &&
                                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                            student.email
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
                            <label htmlFor="batch">Batch</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="year"
                                    value={student.batch}
                                    onChange={(e) => onInputChange(e, 'batch')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !student.batch,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && student.batch,
                                        }
                                    )}
                                />
                                {(submitted && !student.batch && (
                                    <small className="p-invalid">
                                        Student batch is required.
                                    </small>
                                )) ||
                                    (submitted &&
                                        student.batch &&
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
                            <label htmlFor="cgpa">CGPA</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="cgpa"
                                    value={student.cgpa}
                                    onChange={(e) => onInputChange(e, 'cgpa')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !student.cgpa,
                                    })}
                                />
                                {submitted && !student.cgpa && (
                                    <small className="p-invalid">
                                        CGPA is required.
                                    </small>
                                )}
                            </span>
                        </div>

                        <div className="field">
                            <label htmlFor="honours">Honours</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="honours"
                                    value={student.honours}
                                    onChange={(e) =>
                                        onInputChange(e, 'honours')
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid':
                                            submitted && !student.honours,
                                    })}
                                />
                                {submitted && !student.honours && (
                                    <small className="p-invalid">
                                        Honours is required.
                                    </small>
                                )}
                            </span>
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteStudentDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteStudentDialogFooter}
                        onHide={hideDeleteStudentDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {student && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{student.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteStudentsDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteStudentsDialogFooter}
                        onHide={hideDeleteStudentsDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {student && (
                                <span>
                                    Are you sure you want to delete the selected
                                    students?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = serverSideProps
export default StudentRecords
