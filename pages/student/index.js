import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { StudentService } from '../../demo/service/StudentService';

const Crud = () => {
    let emptyStudent = {
        id: null,
        name: '',
        rollno:'',
        batch: '',
        email: '',
       
    };

    const [students, setStudents] = useState(null);
    const [studentDialog, setStudentDialog] = useState(false);
    const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
    const [deleteStudentsDialog, setDeleteStudentsDialog] = useState(false);
    const [student, setStudent] = useState(emptyStudent);
    const [selectedStudents, setSelectedStudents] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const studentService = new StudentService();
        studentService.getStudents().then((data) => setStudents(data));
    }, []);



    const openNew = () => {
        setStudent(emptyStudent);
        setSubmitted(false);
        setStudentDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setStudentDialog(false);
    };

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false);
    };

    const hideDeleteStudentsDialog = () => {
        setDeleteStudentsDialog(false);
    };

    const saveStudent = () => {
        setSubmitted(true);

        if (student.name.trim() && (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(student.email)) && student.email && student.rollno && student.batch) {
            let _students = [...students];
            let _student = { ...student };
            if (student.id) {
                const index = findIndexById(student.id);

                _students[index] = _student;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Student Updated', life: 3000 });
            } else {
                _student.id = createId();

                _students.push(_student);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Student Created', life: 3000 });
            }

            setStudents(_students);
            setStudentDialog(false);
            setStudent(emptyStudent);
        }
    };

    const editStudent = (student) => {
        setStudent({ ...student });
        setStudentDialog(true);
    };

    const confirmDeleteStudent = (student) => {
        setStudent(student);
        setDeleteStudentDialog(true);
    };

    const deleteStudent = () => {
        let _students = students.filter((val) => val.id !== student.id);
        setStudents(_students);
        setDeleteStudentDialog(false);
        setStudent(emptyStudent);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Student Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < students.length; i++) {
            if (students[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteStudentsDialog(true);
    };

    const deleteSelectedStudents = () => {
        let _students = students.filter((val) => !selectedStudents.includes(val));
        setStudents(_students);
        setDeleteStudentsDialog(false);
        setSelectedStudents(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Students Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _student = { ...student };
        _student[`${name}`] = val;

        setStudent(_student);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedStudents || !selectedStudents.length} />
                </div>
            </React.Fragment>
        );
    };

    const toCapitalize = (s) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    const importCSV = (e) => {
        const file = e.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const data = csv.split('\n');

            // Prepare DataTable
            const cols = data[0].replace(/['"]+/g, '').split(',');
            data.shift();

            let _importedCols = cols.map(col => ({ field: col, header: toCapitalize(col.replace(/['"]+/g, '')) }));
            let _importedData = data.map(d => {
                d = d.split(',');
                return cols.reduce((obj, c, i) => {
                    if (c=="Full Name")
                    {
                        c="name";
                    }
                    if (c=="Roll No.")
                    {
                        c="rollno";
                    }
                    if (c=="Email")
                    {
                        c="email";
                    }
                    if (c=="Batch")
                    {
                        c="batch";
                    }
                    obj[c] = d[i].replace(/['"]+/g, '');
                    return obj;
                }, {});
            });

            let _students = [...students];
            console.log(_students); 
            for(let i=0;i<_importedData.length;i++)
            {
                _importedData[i].id = createId();
                _students.push(_importedData[i]);
            }
            setStudents(_students);
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
        };

        reader.readAsText(file, 'UTF-8');
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload chooseOptions={{ label: 'import', icon: 'pi pi-download' }} mode="basic" name="demo[]" auto url="/api/upload" accept=".csv" className="mr-2" onUpload={importCSV} />
               <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const rollnoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Roll No.</span>
                {rowData.rollno}
            </>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Full Name</span>
                {rowData.name}
            </>
        );
    };

 

    const batchBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Batch</span>
                {rowData.batch}
            </>
        );
    };
    const emailBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editStudent(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteStudent(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Students</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const studentDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveStudent} />
        </>
    );
    const deleteStudentDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteStudentDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteStudent} />
        </>
    );
    const deleteStudentsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteStudentsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedStudents} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={students}
                        selection={selectedStudents}
                        onSelectionChange={(e) => setSelectedStudents(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        globalFilter={globalFilter}
                        emptyMessage="No students found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="name" header="Full Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="rollno" header="Roll No." sortable body={rollnoBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="email" header="Email" body={emailBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="batch" header="Batch" body={batchBodyTemplate} sortable></Column>
                        
                       

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={studentDialog} style={{ width: '450px' }} header="Student Details" modal className="p-fluid" footer={studentDialogFooter} onHide={hideDialog}>
                        
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name" value={student.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !student.name })} />
                            {submitted && !student.name && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="rollno">Roll No.</label>
                            <InputText id="rollno" value={student.rollno} onChange={(e) => onInputChange(e, 'rollno')} required autoFocus className={classNames({ 'p-invalid': submitted && !student.rollno })} />
                            {submitted && !student.rollno && <small className="p-invalid">Roll No. is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" value={student.email} onChange={(e) => onInputChange(e, 'email')} required autoFocus className={classNames({ 'p-invalid': submitted && !student.email } , { 'p-invalid': submitted && student.email })} />
                            {submitted && !student.email && <small className="p-invalid">Email is required.</small> || 
                            submitted && student.email && (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(student.email) && <small className="p-invalid">Invalid email address. E.g. example@email.com</small>)}
                        </div>
                        <div className="field">
                            <label htmlFor="batch">Batch</label>
                            <InputText id="batch" value={student.batch} onChange={(e) => onInputChange(e, 'batch')} required autoFocus className={classNames({ 'p-invalid': submitted && !student.batch })} />
                            {submitted && !student.batch && <small className="p-invalid">Batch is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteStudentDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteStudentDialogFooter} onHide={hideDeleteStudentDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {student && (
                                <span>
                                    Are you sure you want to delete <b>{student.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteStudentsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteStudentsDialogFooter} onHide={hideDeleteStudentsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {student && <span>Are you sure you want to delete the selected students?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
