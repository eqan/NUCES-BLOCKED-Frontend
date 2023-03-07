import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Password } from 'primereact/password'
import { Divider } from 'primereact/divider'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { Dropdown } from 'primereact/dropdown'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { returnFetchUsersHook } from './queries/getUsers'
import { DELETE_USER } from './queries/removeUsers'
import { CREATE_USER } from './queries/addUser'
import { useMutation } from '@apollo/client'
import { UPDATE_USER } from './queries/updateUsers'

interface UserInterface {
    id: string
    name: string
    password: string
    role: string
    email: string
    imgUrl: string
}

const UserRecords = () => {
    let UserRecordInterface = {
        id: '',
        name: '',
        password: '',
        role: '',
        email: '',
        imgUrl: '',
    }

    const mapUserToUserRecord = (user: UserInterface) => {
        return {
            id: user.id,
            name: user.name,
            password: user.password,
            role: user.role,
            email: user.email,
            imgUrl: user.imgUrl,
        }
    }
    const router = useRouter()
    const [users, setUsers] = useState<UserInterface[]>([])
    const [userAddDialog, setUserAddDialog] = useState(false)
    const [userUpdateDialog, setUpdateUserDialog] = useState(false)
    const [deleteUserDialog, setDeleteUserDialog] = useState(false)
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(UserRecordInterface)
    const [role, setRole] = useState<any>('')
    const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>()
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)

    const toast = useRef<Toast | null>(null)
    const dt = useRef<DataTable>(null)

    const [usersData, usersLoading, usersFetchingError, usersRefetchHook] =
        returnFetchUsersHook(globalFilter, page + 1, pageLimit)

    const [
        deleteuserFunction,
        {
            data: userDeleteData,
            loading: userDeteDataLoading,
            error: userDeleteDataError,
            reset: userDeleteDataReset,
        },
    ] = useMutation(DELETE_USER)

    const [
        createuserFunction,
        {
            data: certifcateCreateData,
            loading: userCreateDataLoading,
            error: userCreateDataError,
            reset: userCreateDataReset,
        },
    ] = useMutation(CREATE_USER)

    const [
        updateuserFunction,
        {
            data: userUpdateData,
            loading: userUpdateDataLoading,
            error: userUpdateDataError,
            reset: userUpdateDataReset,
        },
    ] = useMutation(UPDATE_USER)

    const fetchData = async () => {
        setIsLoading(true)
        if (!usersLoading) {
            try {
                let _users = usersData?.GetAllusers.items.filter(
                    (val) => val.id != ''
                )
                const total = usersData?.GetAllusers?.total
                setUsers(users)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }
    useEffect(() => {
        if (!usersLoading && usersData) {
            fetchData()
        }
    }, [usersData, usersLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            usersRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [usersRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const openNewAddUserDialog = () => {
        setUser(UserRecordInterface)
        setRole('')
        setSubmitted(false)
        setUserAddDialog(true)
    }

    const hideAddUserDialog = () => {
        setSubmitted(false)
        setUserAddDialog(false)
    }

    const hideUpdateUserDialog = () => {
        setSubmitted(false)
        setUpdateUserDialog(false)
    }

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false)
    }

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false)
    }

    const addUser = async () => {
        setSubmitted(true)

        if (user.name && user.email) {
            let _users = [...users]
            let _user = { ...user }
            try {
                _users[_user.id] = _user
                let newUser = await createuserFunction({
                    variables: {
                        CreateuserInput: {
                            id: _user.id,
                        },
                    },
                })
                newUser = newUser.data['Createuser']
                const mappedData: UserInterface = mapUserToUserRecord(newUser)
                _users = _users.filter((item) => (item.id = mappedData.id))
                _users.push(mappedData)
                setUsers(_users)
                if (toast.current)
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Added',
                        life: 3000,
                    })
            } catch (error) {
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'User Not Added',
                        life: 3000,
                    })
                }
                console.log(error)
            }

            setUserAddDialog(false)
            setUser(UserRecordInterface)
        }
    }

    const updateUser = async () => {
        setSubmitted(true)

        if (user.email) {
            let _users = [...users]
            let _user = { ...user }
            try {
                const index = findIndexById(_user.id)
                _users[index] = _user
                await updateuserFunction({
                    variables: {
                        UpdateuserInput: {
                            id: _user.id,
                        },
                    },
                })
                setUsers(_users)
                if (toast.current)
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Updated',
                        life: 3000,
                    })
            } catch (error) {
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'User Not Updated',
                        life: 3000,
                    })
                }
                console.log(error)
            }

            setUpdateUserDialog(false)
            setUser(UserRecordInterface)
        }
    }

    const saveUser = () => {
        setSubmitted(true)

        if (
            user.name.trim() &&
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email) &&
            user.email &&
            user.role &&
            user.password
        ) {
            let _users = [...users]
            let _user = { ...user }
            if (user.id) {
                const index = findIndexById(user.id)
                _users[index] = _user
                if (toast.current)
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Updated',
                        life: 3000,
                    })
            } else {
                // _user.id = createId()
                _users.push(_user)
                if (toast.current)
                    toast.current.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Created',
                        life: 3000,
                    })
            }

            setUsers(_users)
            setUserAddDialog(false)
            setUser(UserRecordInterface)
            setRole('')
        }
    }

    const editUser = (user) => {
        setUser({ ...user })
        setRole({ name: user.role })
        setUserAddDialog(true)
    }

    const confirmDeleteUser = (user) => {
        setUser(user)
        setDeleteUserDialog(true)
    }

    const deleteUser = () => {
        let _users = users.filter((val) => val.id !== user.id)
        setUsers(_users)
        setDeleteUserDialog(false)
        setUser(UserRecordInterface)
        if (toast.current)
            toast.current.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'User Deleted',
                life: 3000,
            })
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
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
        setDeleteUsersDialog(true)
    }

    const deleteSelectedUsers = async () => {
        let _users = users.filter((val) => !selectedUsers.includes(val))
        let _toBeDeletedUsers = users
            .filter((val) => selectedUsers.includes(val))
            .map((val) => val.id)

        try {
            await deleteuserFunction({
                variables: {
                    DeleteuserInput: {
                        id: _toBeDeletedUsers,
                    },
                },
            })
            if (toast.current && !userDeleteDataError) {
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
        setSelectedUsers([])
        setUsers(_users)
        setDeleteUsersDialog(false)
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _user = { ...user }
        if (name == 'role') {
            _user[`${name}`] = val.name
            setUser(_user)
            setRole(val)
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
            _user[`${name}`] = stringbe
            setUser(_user)
            return
        }
        _user[`${name}`] = val
        setUser(_user)
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label="New"
                        icon="pi pi-plus"
                        className="p-button-success mr-2"
                        onClick={openNewAddUserDialog}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedUsers || !selectedUsers.length}
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
                <span className="p-column-title">Full Name</span>
                {rowData.name}
            </>
        )
    }

    const roleBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Batch</span>
                {rowData.role}
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
                    onClick={() => editUser(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteUser(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage User Profile</h5>
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

    const addUserDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddUserDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={addUser}
            />
        </>
    )
    const updateUserDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUpdateUserDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={updateUser}
            />
        </>
    )
    const deleteUserDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteUserDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={deleteUser}
            />
        </>
    )
    const deleteUsersDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteUsersDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={deleteSelectedUsers}
            />
        </>
    )

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const passwordHeader = <h6>Pick a password</h6>
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
    )

    const roles = [
        { name: 'ADMIN' },
        { name: 'TEACHER' },
        { name: 'CAREER_COUNSELLOR' },
        { name: 'SOCIETY_HEAD' },
    ]

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
                        value={users}
                        selection={selectedUsers}
                        onSelectionChange={(e) => setSelectedUsers(e.value)}
                        dataKey="id"
                        defaultValue={1}
                        paginator
                        rows={pageLimit}
                        first={page * pageLimit}
                        onPage={onPageChange}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                        emptyMessage="No users found."
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
                            field="email"
                            header="Email"
                            body={emailBodyTemplate}
                            sortable
                            headerStyle={{ minWidth: '15rem' }}
                        ></Column>
                        <Column
                            field="role"
                            header="Role"
                            body={roleBodyTemplate}
                            sortable
                        ></Column>

                        <Column
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                        ></Column>
                    </DataTable>

                    <Dialog
                        visible={userAddDialog}
                        style={{ width: '450px' }}
                        header="User Details"
                        modal
                        className="p-fluid"
                        footer={addUserDialogFooter}
                        onHide={hideAddUserDialog}
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
                            <label htmlFor="password">Password</label>
                            <Password
                                id="password"
                                name="password"
                                value={user.password}
                                onChange={(e) => onInputChange(e, 'password')}
                                toggleMask
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !user.password,
                                })}
                                header={passwordHeader}
                                footer={passwordFooter}
                            />
                            {submitted && !user.password && (
                                <small className="p-invalid">
                                    Password is required.
                                </small>
                            )}
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
                        visible={deleteUserDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteUserDialogFooter}
                        onHide={hideDeleteUserDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {user && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{user.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteUsersDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteUsersDialogFooter}
                        onHide={hideDeleteUsersDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {user && (
                                <span>
                                    Are you sure you want to delete the selected
                                    users?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default UserRecords
