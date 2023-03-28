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
import { returnFetchUsersHook } from '../../queries/users/getUsers'
import { DELETE_USER } from '../../queries/users/removeUsers'
import { CREATE_USER } from '../../queries/users/addUser'
import { useMutation } from '@apollo/client'
import { UPDATE_USER } from '../../queries/users/updateUsers'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../../layout/context/requireAuthetication'
import apolloClient from '../../apollo-client'
import jwt from 'jsonwebtoken'
import { Skeleton } from 'primereact/skeleton'
import { GET_USER_DATA } from '../../queries/users/getUser'

interface Props {
    userType: String
}

interface UserInterface {
    id: string
    name: string
    password: string
    role: string
    email: string
    imgUrl: string
}

const UserRecords: React.FC<Props> = (userType) => {
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
            role: user.type,
            email: user.email,
            imgUrl: user?.imgUrl || 'https://www.linkedin.com/in/noms',
        }
    }
    const router = useRouter()
    const [users, setUsers] = useState<UserInterface[]>([])
    const [userSaveDialog, setSaveUserDialog] = useState(false)
    const [deleteUserDialog, setDeleteUserDialog] = useState(false)
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(UserRecordInterface)
    const [role, setRole] = useState<any>('')
    const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
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
                let _users = usersData?.GetAllUsers.items.filter(
                    (val) => val.id != ''
                )
                const usersRecord = _users.map(mapUserToUserRecord) || []
                const total = usersData?.GetAllusers?.total
                setUsers(usersRecord)
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

    const openAddUpdateUserDialog = () => {
        setUser(UserRecordInterface)
        setRole('')
        setSubmitted(false)
        setSaveUserDialog(true)
    }

    const hideUserDialog = () => {
        setSubmitted(false)
        setSaveUserDialog(false)
    }

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false)
    }

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false)
    }

    const saveUser = async () => {
        setSubmitted(true)

        if (
            user.name.trim() &&
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email) &&
            user.email &&
            user.role &&
            user.password &&
            validatepass(user.password)
        ) {
            let _users = [...users]
            let _user = { ...user }
            let successMessage = ''
            let errorMessage = ''
            try {
                const index = findIndexById(_user.id)
                successMessage = 'User Added!'
                errorMessage = 'User Not Added!'
                if (index == -1) {
                    _users[user.id] = _user
                    let newUser = await createuserFunction({
                        variables: {
                            CreateUserInput: {
                                name: _user.name,
                                email: _user.email,
                                password: _user.password,
                                type: _user.role,
                                imgUrl: 'https://www.instagram.com/p/Csaadsad/',
                            },
                        },
                    })
                    newUser = newUser.data.CreateUser
                    const mappedData: UserInterface =
                        mapUserToUserRecord(newUser)
                    _users = _users.filter((item) => (item.id = mappedData.id))
                    _users.push(mappedData)
                } else {
                    _users[index] = _user
                    successMessage = 'User Updated!'
                    errorMessage = 'User Not Updated!'
                    await updateuserFunction({
                        variables: {
                            UpdateUserInput: {
                                email: _user.email,
                                name: _user.name,
                                password: _user.password,
                                type: _user.role,
                            },
                        },
                    })
                }
                setUsers(_users)
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

            setSaveUserDialog(false)
            setUser(UserRecordInterface)
        }
    }

    const editUser = (user) => {
        setUser({ ...user })
        setRole({ name: user.role })
        setSaveUserDialog(true)
    }

    const confirmDeleteUser = (user) => {
        setUser(user)
        setDeleteUserDialog(true)
    }

    const deleteUser = async () => {
        let _users = users.filter((val) => val.id !== user.id)
        try {
            await deleteuserFunction({
                variables: {
                    DeleteUserInput: {
                        id: [user.id],
                    },
                },
            })
            setUsers(_users)
            if (toast.current && !userDeleteDataError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'User Not Deleted',
                    life: 3000,
                })
            }
            console.log(error)
        }
        setUsers(_users)
        setDeleteUserDialog(false)
        setUser(UserRecordInterface)
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
                    DeleteUserInput: {
                        id: _toBeDeletedUsers,
                    },
                },
            })
            if (toast.current && !userDeleteDataError) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User Deleted',
                    life: 3000,
                })
            }
        } catch (error) {
            if (toast.current) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'User Not Deleted',
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

    const validatepass = (password: string) => {
        if (password.length > 6) {
            let lowerCasecheck = false,
                upperCasecheck = false,
                numericCheck = false,
                symbolCheck = false
            let i = 0
            for (i = 0; i < password.length; i++) {
                if (password[i] >= '0' && password[i] <= '9')
                    numericCheck = true
                else if (password[i] >= 'a' && password[i] <= 'z')
                    lowerCasecheck = true
                else if (password[i] >= 'A' && password[i] <= 'Z')
                    upperCasecheck = true
                else symbolCheck = true
            }
            if (
                (numericCheck && lowerCasecheck) ||
                (numericCheck && upperCasecheck) ||
                (numericCheck && symbolCheck) ||
                (lowerCasecheck && upperCasecheck) ||
                (lowerCasecheck && symbolCheck) ||
                (upperCasecheck && symbolCheck)
            ) {
                return true
            }
            return false
        }
        return false
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
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

    const saveUserDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUserDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveUser}
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
                    <Toast ref={toast} />
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
                    )}

                    <Dialog
                        visible={userSaveDialog}
                        style={{ width: '450px' }}
                        header="User Details"
                        modal
                        className="p-fluid"
                        footer={saveUserDialogFooter}
                        onHide={hideUserDialog}
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
                            <label htmlFor="email">Password</label>
                            <Password
                                id="password"
                                name="password"
                                value={user.password}
                                onChange={(e) => onInputChange(e, 'password')}
                                toggleMask
                                required
                                autoFocus
                                className={classNames(
                                    {
                                        'p-invalid':
                                            submitted && !user.password,
                                    },
                                    {
                                        'p-invalid1': validatepass(
                                            user.password
                                        ),
                                    }
                                )}
                                header={passwordHeader}
                                footer={passwordFooter}
                            />
                            {(submitted && !user.password && (
                                <small className="p-invalid">
                                    Password is required.
                                </small>
                            )) ||
                                (!validatepass(user.password) && (
                                    <small className="p-invalid1">
                                        Password isn't Too Strong.
                                    </small>
                                ))}
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
                return {
                    props: { userType: userData?.type },
                }
            }
        }
    }
)

export default UserRecords
