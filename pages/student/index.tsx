import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { CREATE_STUDENT } from '../../queries/students/addStudent'
import { returnFetchStudentsHook } from '../../queries/students/getStudent'
import { DELETE_STUDENT } from '../../queries/students/removeStudent'
import { UPDATE_STUDENT } from '../../queries/students/updateStudent'
import { GET_USER_TYPE } from '../../queries/users/getUserType'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'

interface Props {
    userType: String
}

interface StudentInterface {
    id: string
    name: string
    rollno: string
    email: string
    date: string
    cgpa: number
}

const StudentRecords: React.FC<Props> = (userType) => {
    let StudentRecordInterface = {
        id: '',
        name: '',
        rollno: '',
        email: '',
        cgpa: 0,
        date: '',
    }

    const mapStudentToStudentRecord = (student: StudentInterface) => {
        return {
            id: student.id,
            name: student.name,
            rollno: student.id,
            email: student.email,
            cgpa: student?.cgpa,
            date: student?.updatedAt,
        }
    }

    const router = useRouter()
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
    const toast = useRef<Toast | null>(null)
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
                console.log(_students)
                const studentsRecords =
                    _students.map(mapStudentToStudentRecord) || []
                console.log(studentsRecords)
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
            let _students = [...students]
            let _student = { ...student }
            let successMessage = ''
            let errorMessage = ''
            try {
                const index = findIndexById(_student.id)
                _students[_student.rollno] = _student
                successMessage = 'Student Added!'
                errorMessage = 'Student Not Added!'
                if (index == -1) {
                    let newStudent = await createStudentFunction({
                        variables: {
                            CreateStudentInput: {
                                id: _student.rollno,
                                name: _student.name,
                                email: _student.email,
                                cgpa: _student.cgpa,
                            },
                        },
                    })
                    newStudent = newStudent.data['CreateStudent']
                    const mappedData: StudentInterface =
                        mapStudentToStudentRecord(newStudent)
                    _students = _students.filter(
                        (item) => (item.rollno = mappedData.id)
                    )
                    _students.push(mappedData)
                } else {
                    successMessage = 'Student Updated!'
                    errorMessage = 'Student Not Updated!'
                    await updateStudentFunction({
                        variables: {
                            UpdateStudentInput: {
                                id: _student.rollno,
                                email: _student.email,
                                name: _student.name,
                                cgpa: _student.cgpa,
                            },
                        },
                    })
                }
                setStudents(_students)
                if (toast.current)
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: successMessage,
                        life: 3000,
                    })
            } catch (error) {
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage,
                        life: 3000,
                    })
                }
                console.log(error)
            }

            setStudentDialog(false)
            setStudent(StudentRecordInterface)
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
        try {
            await deleteStudentFunction({
                variables: {
                    DeleteStudentInput: {
                        id: [student.rollno],
                    },
                },
            })
            setStudents(_students)
            if (toast.current && !studentDeleteDataError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Student Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Student Not Deleted',
                    life: 3000,
                })
            }
            console.log(error)
        }
        setDeleteStudentDialog(false)
        setStudent(StudentRecordInterface)
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
        let _students = students.filter((val) => {
            if (selectedStudents) !selectedStudents.includes(val)
        })
        let _toBeDeletedStudents = students
            .filter((val) => selectedStudents.includes(val))
            .map((val) => val.id)

        try {
            await deleteStudentFunction({
                variables: {
                    DeleteStudentInput: {
                        id: _toBeDeletedStudents,
                    },
                },
            })
            if (toast.current && !studentDeleteDataError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Student Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Student Not Deleted',
                    life: 3000,
                })
            }
            console.log(error)
        }
        setStudents(_students)
        setDeleteStudentsDialog(false)
        setSelectedStudents([])
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
            if (toast.current)
                toast.current.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'File Uploaded',
                    life: 3000,
                })
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
                onClick={saveStudent}
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
                onClick={deleteStudent}
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
                onClick={deleteSelectedStudents}
            />
        </>
    )

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

                    <DataTable
                        ref={dt}
                        value={students}
                        selection={selectedStudents}
                        onSelectionChange={(e) => setSelectedStudents(e.value)}
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
                            field="cgpa"
                            header="CGPA"
                            body={cgpaBodyTemplate}
                            sortable
                        ></Column>

                        <Column
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                        ></Column>
                    </DataTable>

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
                                <i className="pi pi-fw pi-star" />
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

export const getServerSideProps: GetServerSideProps = requireAuthentication(
    async (ctx) => {
        const { req } = ctx
        if (req.headers.cookie) {
            const tokens = req.headers.cookie.split(';')
            const token = tokens.find((token) => token.includes('access_token'))
            let userType = ''
            if (token) {
                const userEmail = jwt.decode(
                    token.split('=')[1]?.toString()
                ).email
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

export default StudentRecords
