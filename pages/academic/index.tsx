import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { returnFetchContributionsHook } from './queries/getStudentContributions'
import { useRouter } from 'next/router'

interface AcademicContributionInterface {
    id: string
    name: string | null
    rollno: string | null
    date: string | null
    cgpa: string | null
}

interface sAcademic {
    includes?: any
    length?: any
}

const Crud = () => {
    const router = useRouter()

    let AcademicRecordInterface = {
        id: '',
        name: '',
        rollno: '',
        date: '',
        cgpa: '',
    }

    let eAcedmic = {
        includes: null,
        length: null,
    }

    const mapContributionToAcademicRecord = (
        contribution: AcademicContributionInterface
    ) => {
        return {
            id: contribution.id,
            name: contribution.student.name,
            rollno: contribution.id,
            date: contribution.updatedAt,
            cgpa: contribution.contribution,
        }
    }

    const [academics, setAcademics] = useState<AcademicContributionInterface[]>(
        [] as AcademicContributionInterface[]
    )
    const [academicDialog, setAcademicDialog] = useState(false)
    const [contributionLoading, setContributionsLoading] = useState(false)
    const [deleteAcademicDialog, setDeleteAcademicDialog] = useState(false)
    const [deleteAcademicsDialog, setDeleteAcademicsDialog] = useState(false)
    const [academic, setAcademic] = useState(AcademicRecordInterface)
    const [selectedAcademics, setSelectedAcademics] = useState<sAcademic>()
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>()
    const [page, setPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable>(null)
    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = returnFetchContributionsHook('ADMIN', page, pageLimit)

    const fetchData = async () => {
        if (!contributionsLoading) {
            setContributionsLoading(true)
            try {
                const academicRecords =
                    contributionsData?.GetAllContributions.adminContributions?.map(
                        mapContributionToAcademicRecord
                    ) || []
                const total = contributionsData?.GetAllContributions?.total
                setAcademics(academicRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setContributionsLoading(false)
            }
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

    // useEffect(() => {
    //     fetchData()
    // }, [contributionsLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            contributionsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [contributionsRefetchHook, router.events])

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

    const saveAcademic = () => {
        setSubmitted(true)

        if (academic.cgpa) {
            let _academics = [...academics]
            let _academic = { ...academic }
            if (academic.id) {
                const index = findIndexById(academic.id)

                _academics[index] = _academic
                if (toast.current) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Academic Profile Updated',
                        life: 3000,
                    })
                }
            }

            setAcademics(_academics)
            setAcademicDialog(false)
            setAcademic(AcademicRecordInterface)
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

    const deleteAcademic = () => {
        let _academics = academics.filter((val) => val.id !== academic.id)
        setAcademics(_academics)
        setDeleteAcademicDialog(false)
        setAcademic(AcademicRecordInterface)
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Academic Profile Deleted',
                life: 3000,
            })
        }
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < academics.length; i++) {
            if (academics[i].id === id) {
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

    const deleteSelectedAcademics = () => {
        let _academics = academics.filter((val) => {
            if (selectedAcademics) {
                !selectedAcademics.includes(val)
            }
        })
        setAcademics(_academics)
        setDeleteAcademicsDialog(false)
        setSelectedAcademics(eAcedmic)
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Academic Profile Deleted',
                life: 3000,
            })
        }
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
                    onInput={(e) =>
                        setGlobalFilter((e.target as HTMLInputElement).value)
                    }
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
                        value={academics}
                        selection={selectedAcademics}
                        onSelectionChange={(e) => setSelectedAcademics(e.value)}
                        dataKey="id"
                        paginator
                        rows={pageLimit}
                        first={page * pageLimit}
                        onPage={onPageChange}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} academics"
                        globalFilter={globalFilter}
                        emptyMessage="No academics found."
                        header={header}
                        responsiveLayout="scroll"
                        totalRecords={totalRecords}
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
                            field="date"
                            header="Last Updated"
                            sortable
                            body={dateBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                        ></Column>
                        <Column
                            field="cgpa"
                            header="CGPA"
                            body={cgpaBodyTemplate}
                            sortable
                            headerStyle={{ minWidth: '15rem' }}
                        ></Column>

                        <Column
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                        ></Column>
                    </DataTable>
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

export default Crud
