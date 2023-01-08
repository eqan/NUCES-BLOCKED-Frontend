import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { AcademicService } from '../../demo/service/AcademicService';

const Crud = () => {
    let emptyAcademic = {
        id: null,
        name: '',
        rollno:'',
        date:'',
        description: '',
        contribution: '',
       
    };

    const [academics, setAcademics] = useState(null);
    const [academicDialog, setAcademicDialog] = useState(false);
    const [deleteAcademicDialog, setDeleteAcademicDialog] = useState(false);
    const [deleteAcademicsDialog, setDeleteAcademicsDialog] = useState(false);
    const [academic, setAcademic] = useState(emptyAcademic);
    const [selectedAcademics, setSelectedAcademics] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    useEffect(() => {
        const academicService = new AcademicService();
        academicService.getAcademics().then((data) => setAcademics(data));
    }, []);



    const openNew = () => {
        setAcademic(emptyAcademic);
        setSubmitted(false);
        setAcademicDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAcademicDialog(false);
    };

    const hideDeleteAcademicDialog = () => {
        setDeleteAcademicDialog(false);
    };

    const hideDeleteAcademicsDialog = () => {
        setDeleteAcademicsDialog(false);
    };

    const saveAcademic = () => {
        setSubmitted(true);

        if (academic.name.trim()) {
            let _academics = [...academics];
            let _academic = { ...academic };
            if (academic.id) {
                const index = findIndexById(academic.id);

                _academics[index] = _academic;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Profile Updated', life: 3000 });
            } else {
                _academic.id = createId();

                _academics.push(_academic);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Profile Created', life: 3000 });
            }

            setAcademics(_academics);
            setAcademicDialog(false);
            setAcademic(emptyAcademic);
        }
    };

    const editAcademic = (academic) => {
        setAcademic({ ...academic });
        setAcademicDialog(true);
    };

    const confirmDeleteAcademic = (academic) => {
        setAcademic(academic);
        setDeleteAcademicDialog(true);
    };

    const deleteAcademic = () => {
        let _academics = academics.filter((val) => val.id !== academic.id);
        setAcademics(_academics);
        setDeleteAcademicDialog(false);
        setAcademic(emptyAcademic);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Profile Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < academics.length; i++) {
            if (academics[i].id === id) {
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
        setDeleteAcademicsDialog(true);
    };

    const deleteSelectedAcademics = () => {
        let _academics = academics.filter((val) => !selectedAcademics.includes(val));
        setAcademics(_academics);
        setDeleteAcademicsDialog(false);
        setSelectedAcademics(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Profile Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _academic = { ...academic };
        _academic[`${name}`] = val;

        setAcademic(_academic);
    };
    
    

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _academic = { ...academic };
        _academic[`${name}`] = val;

        setAcademic(_academic);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                   
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedAcademics || !selectedAcademics.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
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
    const dateBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Date</span>
                {rowData.date}
            </>
        );
    };

 

    const descriptionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        );
    };
    const contributionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contribution</span>
                {rowData.contribution}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editAcademic(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteAcademic(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Academic Profile</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const academicDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveAcademic} />
        </>
    );
    const deleteAcademicDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAcademicDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteAcademic} />
        </>
    );
    const deleteAcademicsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAcademicsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedAcademics} />
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
                        value={academics}
                        selection={selectedAcademics}
                        onSelectionChange={(e) => setSelectedAcademics(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} academics"
                        globalFilter={globalFilter}
                        emptyMessage="No academics found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="name" header="Full Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="rollno" header="Roll No." sortable body={rollnoBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="date" header="Date" sortable body={dateBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="contribution" header="Contribution" body={contributionBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="description" header="Contribution Detail" body={descriptionBodyTemplate} sortable headerStyle={{ minWidth: '20rem' }}></Column>
                        
                       

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={academicDialog} style={{ width: '450px' }} header="Academic Details" modal className="p-fluid" footer={academicDialogFooter} onHide={hideDialog}>
                        
                       
                        <div className="field">
                            <label htmlFor="date">Date</label>
                            <InputText id="date" value={academic.date} onChange={(e) => onInputChange(e, 'date')} required autoFocus className={classNames({ 'p-invalid': submitted && !academic.date })} />
                            {submitted && !academic.date && <small className="p-invalid">Date is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="contribution">Contribution</label>
                            <InputText id="contribution" value={academic.contribution} onChange={(e) => onInputChange(e, 'contribution')} required autoFocus className={classNames({ 'p-invalid': submitted && !academic.contribution })} />
                            {submitted && !academic.contribution && <small className="p-invalid">Contribution is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <InputText id="description" value={academic.description} onChange={(e) => onInputChange(e, 'description')} required autoFocus className={classNames({ 'p-invalid': submitted && !academic.description })} />
                            {submitted && !academic.description && <small className="p-invalid">Description is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAcademicDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAcademicDialogFooter} onHide={hideDeleteAcademicDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {academic && (
                                <span>
                                    Are you sure you want to delete <b>{academic.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAcademicsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAcademicsDialogFooter} onHide={hideDeleteAcademicsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {academic && <span>Are you sure you want to delete the selected Academic Profile?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
