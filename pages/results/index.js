import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ResultService } from '../../demo/service/ResultService';
import { empty } from '@apollo/client';
import { string } from 'prop-types';



const Crud = () => {
    let emptyResult = {
        id: null,
        semester: '',
        year:'',
        hash:'',
       
    };

    

    
    const [results, setResults] = useState(null);
    const [resultDialog, setResultDialog] = useState(false);
    const [deleteResultDialog, setDeleteResultDialog] = useState(false);
    const [deleteResultsDialog, setDeleteResultsDialog] = useState(false);
    const [result, setResult] = useState(emptyResult);
    const [semester, setSemester] = useState(null);
    const [selectedResults, setSelectedResults] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const resultService = new ResultService();
        resultService.getResults().then((data) => setResults(data));
    }, []);

    const onUpload = () => {
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    };


    const openNew = () => {
        setResult(emptyResult);
        setSemester('');
        setSubmitted(false);
        setResultDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResultDialog(false);
    };

    const hideDeleteResultDialog = () => {
        setDeleteResultDialog(false);
    };

    const hideDeleteResultsDialog = () => {
        setDeleteResultsDialog(false);
    };

    const validateYear=()=>{
        if (result.year) {
            
            let temp=parseInt(result.year);
            let today=new Date;
            if(!(temp>=1990&&temp<=today.getFullYear()))
            {
                return 0;
            }
            return 1;
        }
    }

    const saveResult = () => {
        setSubmitted(true);

        if (result.semester.trim()&& result.year) {
            let _results = [...results];
            let _result = { ...result };
            
            let temp=parseInt(result.year);
            let today=new Date;
            if(!(temp>=1990&&temp<=today.getFullYear()))
            {
                return 0;
            }
            if (result.id) {
                const index = findIndexById(result.id);

                _results[index] = _result;
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Semester Result Updated', life: 3000 });
            } else {
                _result.id = createId();

                _results.push(_result);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Semester Result Created', life: 3000 });
            }

            setResults(_results);
            setResultDialog(false);
            setResult(emptyResult);
            setSemester(emptyResult.semester);
            return 1;
        }
    };

    const editResult = (result) => {
        setResult({ ...result });
        console.log(result);
        setSemester({name: result.semester});
        setResultDialog(true);
    };

    const confirmDeleteResult = (result) => {
        setResult(result);
        setDeleteResultDialog(true);
    };

    const deleteResult = () => {
        let _results = results.filter((val) => val.id !== result.id);
        setResults(_results);
        setDeleteResultDialog(false);
        setResult(emptyResult);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Semester Result Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < results.length; i++) {
            if (results[i].id === id) {
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
        setDeleteResultsDialog(true);
    };

    const deleteSelectedResults = () => {
        let _results = results.filter((val) => !selectedResults.includes(val));
        setResults(_results);
        setDeleteResultsDialog(false);
        setSelectedResults(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Semester Result Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _result = { ...result };
        if (name =='semester')
        {    
            _result[`${name}`] = val.name;
            setResult(_result);
            setSemester(val); 
            return;
        }
        else if(name=='year')
        {
            let i;
            let stringbe='';
            for(i=0;i<val.length;i++)
            {
                if(!(val[i]>='0'&&val[i]<='9'))
                {
                    return;
                }
                stringbe+=val[i];
            }
            if(stringbe.length>4)
            {
                return;
            }
            _result[`${name}`] = stringbe;
            setResult(_result);
            return;
        }
        _result[`${name}`] = val;
        setResult(_result);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedResults || !selectedResults.length} />
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

    const yearBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Year</span>
                {rowData.year}
            </>
        );
    };

    const semesterBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Semester</span>
                {rowData.semester}
            </>
        );
    };

 
    const actionBodyTemplate = (rowData) => {
        return (
            <> 
                <Button icon="pi pi-arrow-down" className="p-button-rounded p-button-success mr-2" onClick={exportCSV}/>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning mr-2" onClick={() => editResult(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteResult(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Semester Result</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const resultDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveResult} />
        </>
    );
    const deleteResultDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteResultDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteResult} />
        </>
    );
    const deleteResultsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteResultsDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedResults} />
        </>
    );

    const semesters = [
        { name: 'Fall' },
        { name: 'Spring' },
        { name: 'Summer'}
    ];

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={results}
                        selection={selectedResults}
                        onSelectionChange={(e) => setSelectedResults(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                        globalFilter={globalFilter}
                        emptyMessage="No results found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="semester" header="Semester Name" sortable body={semesterBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="year" header="Year" sortable body={yearBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        

                        
                       

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={resultDialog} style={{ width: '450px' }} header="Result Details" modal className="p-fluid" footer={resultDialogFooter} onHide={hideDialog}>
                        
                        <div className="field">
                            <label htmlFor="semester">Semeter Name</label>
                            <Dropdown id="semester" value={semester} options={semesters} onChange={(e) => onInputChange(e, 'semester')} required autoFocus
                             optionLabel="name" placeholder="Select a Semester" className={classNames({ 'p-invalid': submitted && !result.semester })} />
                            {submitted && !result.semester && <small className="p-invalid">Semester is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="year">Year</label>
                            <span className="p-input-icon-right">
                                <InputText id="year" value={result.year} onChange={(e) => onInputChange(e, 'year')} required autoFocus className={classNames({ 'p-invalid': submitted && !result.year }, { 'p-invalid1': submitted && result.year })} />
                                {submitted && !result.year && <small className="p-invalid">Year is required.</small> ||
                                submitted && result.year && (!(validateYear()) && <small className="p-invalid1">Invalid year, range from 1990 to Current Year</small>)}
                                <i className="pi pi-fw pi-calendar"/>
                            </span>
                        </div>

                        <div className="field">
                        <label htmlFor="file">File</label>
                        <FileUpload chooseOptions={{ label: 'import', icon: 'pi pi-download' }} mode="basic" name="demo[]" auto url="/api/upload" accept=".csv" className="mr-2" onUpload={onUpload} />
                        </div>

                    </Dialog>

                    <Dialog visible={deleteResultDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResultDialogFooter} onHide={hideDeleteResultDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {result && (
                                <span>
                                    Are you sure you want to delete <b>{result.semester}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResultsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResultsDialogFooter} onHide={hideDeleteResultsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {result && <span>Are you sure you want to delete the selected semester result?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
