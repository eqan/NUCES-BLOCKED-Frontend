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
import { DegreeService } from '../../../demo/service/DegreeService';

const Crud = () => {
    let emptyDegree = {
        id: null,
        name: '',
        rollno:'',
        hash: '',
       
    };

    const [degrees, setDegrees] = useState(null);
    const [degreeDialog, setDegreeDialog] = useState(false);
    const [deleteDegreeDialog, setDeleteDegreeDialog] = useState(false);
    const [deleteDegreesDialog, setDeleteDegreesDialog] = useState(false);
    const [degree, setDegree] = useState(emptyDegree);
    const [selectedDegrees, setSelectedDegrees] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    useEffect(() => {
        const degreeService = new DegreeService();
        degreeService.getDegrees().then((data) => setDegrees(data));
    }, []);



    const openNew = () => {
        setDegree(emptyDegree);
        setSubmitted(false);
        setDegreeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDegreeDialog(false);
    };

    const hideDeleteDegreeDialog = () => {
        setDeleteDegreeDialog(false);
    };

    const hideDeleteDegreesDialog = () => {
        setDeleteDegreesDialog(false);
    };

    const saveDegree = () => {
        setSubmitted(true);

        if (degree.name.trim()) {
            let _degrees = [...degrees];
            let _degree = { ...degree };
            if (degree.id) {
                const index = findIndexById(degree.id);

                _degrees[index] = _degree;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Certificate Updated', life: 3000 });
            } else {
                _degree.id = createId();

                _degrees.push(_degree);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Certificate Created', life: 3000 });
            }

            setDegrees(_degrees);
            setDegreeDialog(false);
            setDegree(emptyDegree);
        }
    };

    const editDegree = (degree) => {
        setDegree({ ...degree });
        setDegreeDialog(true);
    };

    const confirmDeleteDegree = (degree) => {
        setDegree(degree);
        setDeleteDegreeDialog(true);
    };

    const deleteDegree = () => {
        let _degrees = degrees.filter((val) => val.id !== degree.id);
        setDegrees(_degrees);
        setDeleteDegreeDialog(false);
        setDegree(emptyDegree);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Certificate Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < degrees.length; i++) {
            if (degrees[i].id === id) {
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
        setDeleteDegreesDialog(true);
    };

    const deleteSelectedDegrees = () => {
        let _degrees = degrees.filter((val) => !selectedDegrees.includes(val));
        setDegrees(_degrees);
        setDeleteDegreesDialog(false);
        setSelectedDegrees(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Academic Certificate Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _degree = { ...degree };
        _degree[`${name}`] = val;

        setDegree(_degree);
    };
    
    

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _degree = { ...degree };
        _degree[`${name}`] = val;

        setDegree(_degree);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedDegrees || !selectedDegrees.length} />
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

 


    const hashBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Hash</span>
                {rowData.hash}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <> 
                <Button icon="pi pi-arrow-down" className="p-button-rounded p-button-success mr-2"/>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editDegree(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteDegree(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Academic Certificate</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const degreeDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveDegree} />
        </>
    );
    const deleteDegreeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDegreeDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteDegree} />
        </>
    );
    const deleteDegreesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDegreesDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedDegrees} />
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
                        value={degrees}
                        selection={selectedDegrees}
                        onSelectionChange={(e) => setSelectedDegrees(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} degrees"
                        globalFilter={globalFilter}
                        emptyMessage="No degrees found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="hash" header="Hash" body={hashBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="name" header="Full Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="rollno" header="Roll No." sortable body={rollnoBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        

                        
                       

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={degreeDialog} style={{ width: '450px' }} header="Degree Details" modal className="p-fluid" footer={degreeDialogFooter} onHide={hideDialog}>
                        
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name" value={degree.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !degree.name })} />
                            {submitted && !degree.name && <small className="p-invalid">Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="rollno">Roll No.</label>
                            <InputText id="rollno" value={degree.rollno} onChange={(e) => onInputChange(e, 'rollno')} required autoFocus className={classNames({ 'p-invalid': submitted && !degree.rollno })} />
                            {submitted && !degree.rollno && <small className="p-invalid">Roll No. is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="hash">Hash</label>
                            <InputText id="hash" value={degree.hash} onChange={(e) => onInputChange(e, 'hash')} required autoFocus className={classNames({ 'p-invalid': submitted && !degree.hash })} />
                            {submitted && !degree.hash && <small className="p-invalid">Hash is required.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteDegreeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDegreeDialogFooter} onHide={hideDeleteDegreeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {degree && (
                                <span>
                                    Are you sure you want to delete <b>{degree.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteDegreesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDegreesDialogFooter} onHide={hideDeleteDegreesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {degree && <span>Are you sure you want to delete the selected academic certificate</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
