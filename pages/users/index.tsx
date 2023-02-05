import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { UserService } from '../../demo/service/UserService';

interface emptyUsers{
    id: string|null;
    name: string|null;
    password:string|null;
    role: string|null;
    email: string|null;
}

interface sUser{
    includes:any;
    length:any;
}

const Crud = () => {
    let emptyUser = {
        id: '',
        name: '',
        password:'',
        role: '',
        email: '',
    };

    let eUser={
        includes:null,
        length:null,
    }

    const [users, setUsers] = useState<emptyUsers[]>([]);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [role, setRole] = useState<any>('');
    const [selectedUsers, setSelectedUsers] = useState<sUser>();
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>();
    const toast = useRef<Toast|null>(null);
    const dt = useRef<DataTable>(null);

    useEffect(() => {
        const userService = new UserService();
        userService.getUsers().then((data) => setUsers(data));
    }, []);



    const openNew = () => {
        setUser(emptyUser);
        setRole('');
        setSubmitted(false);
        setUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const saveUser = () => {
        setSubmitted(true);

        if (user.name.trim()&& (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email)) && user.email && user.role && user.password) {
            let _users = [...users];
            let _user = { ...user };
            if (user.id) {
                const index = findIndexById(user.id);
                _users[index] = _user;
                if(toast.current)
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
            } else {
                _user.id = createId();
                _users.push(_user);
                if(toast.current)
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
            }

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
            setRole(''); 
        }
    };

    const editUser = (user) => {
        setUser({ ...user });
        setRole({name:user.role})
        setUserDialog(true);
    };

    const confirmDeleteUser = (user) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const deleteUser = () => {
        let _users = users.filter((val) => val.id !== user.id);
        setUsers(_users);
        setDeleteUserDialog(false);
        setUser(emptyUser);
        if(toast.current)
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
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
        if(dt.current)
            dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = () => {
        let _users = users.filter((val) => {
            if(selectedUsers)
                !selectedUsers.includes(val);
        });
        setUsers(_users);
        setDeleteUsersDialog(false);
        setSelectedUsers(eUser);
        if(toast.current)
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
    };



    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        if (name =='role')
        {    
            _user[`${name}`] = val.name;
            setUser(_user);
            setRole(val); 
            return;
        }
        else if (name=="name")
        {
            let i;
            let stringbe='';
            for(i=0;i<val.length;i++)
            {
                if((val[i]>='a'&&val[i]<='z')|| (val[i]>='A'&&val[i]<='Z')|| (val[i]==' '))
                {
                    stringbe+=val[i];
                }
            }
            _user[`${name}`] = stringbe;
            setUser(_user);
            return;
        }
        _user[`${name}`] = val;
        setUser(_user);
    };
    
    
    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedUsers || !selectedUsers.length} />
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

    const nameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Full Name</span>
                {rowData.name}
            </>
        );
    };

 

    const roleBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Batch</span>
                {rowData.role}
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteUser(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage User Profile</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Search..." />
            </span>
        </div>
    );

    const userDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveUser} />
        </>
    );
    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteUser} />
        </>
    );
    const deleteUsersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedUsers} />
        </>
    );

    const passwordHeader = <h6>Pick a password</h6>;
    const passwordFooter = (
        <React.Fragment>
            <Divider />
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: '1.5' }}>
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </React.Fragment>
    );

    const roles = [
        { name: 'Admin' },
        { name: 'Teacher' },
        { name: 'Career Counselor' },
        { name: 'Society Head'}
    ];

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={users}
                        selection={selectedUsers}
                        onSelectionChange={(e) => setSelectedUsers(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                        globalFilter={globalFilter}
                        emptyMessage="No users found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="name" header="Full Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="email" header="Email" body={emailBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="role" header="Role" body={roleBodyTemplate} sortable></Column>
                        
                       

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                        
                        <div className="field">
                        <label htmlFor="name">Name</label>
                            <span className="p-input-icon-right">
                                <InputText id="name" value={user.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.name })} />
                                {submitted && !user.name && <small className="p-invalid">Name is required.</small>}
                                <i className="pi pi-fw pi-user" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <span className="p-input-icon-right">
                                <InputText id="email" value={user.email} onChange={(e) => onInputChange(e, 'email')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.email } , { 'p-invalid1': submitted && user.email })} />
                                {submitted && !user.email && <small className="p-invalid">Email is required.</small> ||
                                submitted && user.email && (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email) && <small className="p-invalid1">Invalid email address. E.g. example@email.com</small>)}
                                <i className="pi pi-envelope" />
                            </span>
                        </div>
                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <Password id="password" name="password" value={user.password} onChange={(e) => onInputChange(e, 'password')} toggleMask required autoFocus
                             className={classNames({ 'p-invalid': submitted && !user.password })} header={passwordHeader} footer={passwordFooter} />
                            {submitted && !user.password && <small className="p-invalid">Password is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="role">Role</label>
                            <Dropdown id="role" value={role} options={roles} onChange={(e)=>onInputChange(e,'role')} required autoFocus
                             optionLabel="name" placeholder="Select a Role" className={classNames({ 'p-invalid': submitted && !user.role })} />
                             {submitted && !user.role && <small className="p-invalid">Role is required.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && (
                                <span>
                                    Are you sure you want to delete <b>{user.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUsersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && <span>Are you sure you want to delete the selected users?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
