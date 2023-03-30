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
import { FileUpload } from 'primereact/fileupload'
import React, { useEffect, useRef, useState } from 'react'
import { useEventListener } from 'primereact/hooks'
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
import getConfig from 'next/config'
import { Skeleton } from 'primereact/skeleton'
import { Image as PrimeImage } from 'primereact/image'
import { Panel } from 'primereact/panel'
import { GET_USER_DATA } from '../../queries/users/getUser'
import { NFT_STORAGE_TOKEN } from '../../constants/env-variables'
import { NFTStorage } from 'nft.storage'
import { extractActualDataFromIPFS } from '../../utils/extractActualDataFromIPFS'

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
    userSubType: string
}

const UserRecords: React.FC<Props> = (userType) => {
    let UserRecordInterface = {
        id: '',
        name: '',
        password: '',
        role: '',
        email: '',
        imgUrl: '',
        userSubType: '',
    }

    const mapUserToUserRecord = (user: UserInterface) => {
        return {
            id: user.id,
            name: user.name,
            password: user.password,
            role: user.type,
            email: user.email,
            imgUrl: user.imgUrl,
            userSubType: user.userSubType,
        }
    }
    const contextPath = getConfig().publicRuntimeConfig.contextPath
    const img: string = `${contextPath}/image.png`
    const router = useRouter()
    const [users, setUsers] = useState<UserInterface[]>([])
    const [userSaveDialog, setSaveUserDialog] = useState(false)
    const [deleteUserDialog, setDeleteUserDialog] = useState(false)
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(UserRecordInterface)
    const [role, setRole] = useState<any>('')
    const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const [actualfile, setActualfile] = useState('')
    const [imgfile, setImgFile] = useState<string>(img)
    const [previewimg, setPreviewImg] = useState(img)
    const elementRef = useRef<string>(null)
    const toast = useRef<Toast | null>(null)
    const dt = useRef<DataTable>(null)
    const imgref = useRef(null)

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
        if (
            userType == 'TEACHER' ||
            userType == 'CAREER_COUNSELLOR' ||
            userType == 'SOCIETY_HEAD'
        ) {
            router.push('/pages/notfound')
        }
    }, [userType])

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
        handleReset()
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

    const handleUpload = async (id) => {
        let url = null
        try {
            setUploading(true)

            const nftstorage = new NFTStorage({
                token: NFT_STORAGE_TOKEN,
            })
            const binaryFileWithMetaData = new File([actualfile], id + '.png', {
                type: 'image/png',
            })

            const metadata = {
                name: id,
                description: `User profile image of ${id}`,
            }
            const value = await nftstorage.store({
                image: binaryFileWithMetaData,
                name: metadata.name,
                description: metadata.description,
            })
            console.log(value.url)
            url = await extractActualDataFromIPFS(value.url, '.png')
            handleReset()
            if (toast.current)
                toast.current.show({
                    severity: 'info',
                    summary: 'Success',
                    detail: 'File Uploaded',
                    life: 3000,
                })
        } catch (error) {
            if (toast.current)
                toast.current.show({
                    severity: 'error',
                    summary: 'error',
                    detail: 'File Not Uploaded',
                    life: 3000,
                })
            console.error(error)
        }
        setUploading(false)
        return url
    }

    const getUserSubType = () => {}

    const saveUser = async () => {
        setSubmitted(true)

        if (
            user.name.trim() &&
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(user.email) &&
            user.email &&
            user.role &&
            user.password &&
            validatepass(user.password) &&
            imgfile != img
        ) {
            let _users = [...users]
            let _user = { ...user }
            let successMessage = ''
            let errorMessage = ''
            try {
                const index = findIndexById(_user.id)
                successMessage = 'User Added!'
                errorMessage = 'User With this email already created!'
                const url = await handleUpload(_user.email)
                if (index == -1) {
                    _users[user.id] = _user
                    let newUser = await createuserFunction({
                        variables: {
                            CreateUserInput: {
                                name: _user.name,
                                email: _user.email,
                                password: _user.password,
                                type: _user.role,
                                subType: null,
                                imgUrl: url,
                            },
                        },
                    })
                    newUser = newUser.data.CreateUser
                    const mappedData: UserInterface =
                        mapUserToUserRecord(newUser)
                    _users = _users.filter((item) => (item.id = mappedData.id))
                    _users.push(mappedData)
                    console.log('create', _users)
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
                                imgUrl: _user.imgUrl,
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
                console.log(error)
                if (toast.current) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage,
                        life: 3000,
                    })
                }
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

    const onInputChange = async (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _user = { ...user }
        if (name == 'img') {
            _user['imgUrl'] = e.slice(5, e.length)
            setUser(_user)
        }
        if (name == 'role') {
            _user[`${name}`] = val.name
            setUser(_user)
            setRole(val)
            return
        } else if (name == 'name' || name == 'subType') {
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
        console.log(rowData.imgUrl)
        return (
            <>
                <div className="flex align-items-center gap-2">
                    <img
                        alt={rowData.name}
                        src={`${rowData.imgUrl}`}
                        width="32"
                    />
                    <span>{rowData.name}</span>
                </div>
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
                    onClick={() => {
                        handleReset()
                        editUser(rowData)
                    }}
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
    const resizeImage = (
        file: File,
        maxWidth: number,
        maxHeight: number
    ): Promise<Blob> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                let width = img.width
                let height = img.height

                if (width > maxWidth && maxWidth != 0) {
                    width = maxWidth
                }
                if (height > maxHeight && maxHeight != 0) {
                    height = maxHeight
                }
                console.log(`Resizing image to ${width}x${height}`)

                canvas.width = width
                canvas.height = height

                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        resolve(blob as Blob)
                    },
                    'image/jpeg',
                    0.9
                )
            }

            img.src = URL.createObjectURL(file)
        })
    }

    const uploadHandler = async ({ files }) => {
        handleReset()
        const file = files[0]
        setActualfile(file)
        const resizedimgP = await resizeImage(file, 0, 0)
        setPreviewImg(URL.createObjectURL(resizedimgP))
        const resizedimgA = await resizeImage(file, 150, 150)
        setImgFile(URL.createObjectURL(resizedimgA))
        onInputChange(file, 'img')
    }
    const handleReset = () => {
        if (imgref.current != null) imgref.current.clear() // call the clear method on file upload ref
        setImgFile(img)
        setPreviewImg(img)
    }
    const [imageLoadListener, imageUnloadListener] = useEventListener({
        target: elementRef,
        type: 'mousedown',
        listener: async () => {
            await setHover(true)
        },
    })

    useEffect(() => {
        imageLoadListener()

        return () => {
            imageUnloadListener()
        }
    }, [imageLoadListener, imageUnloadListener])

    useEffect(() => {
        if (
            userType == 'TEACHER' ||
            userType == 'CAREER_COUNSELLOR' ||
            userType == 'SOCIETY_HEAD'
        ) {
            router.push('/pages/notfound')
        }
    }, [userType])

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
                                showFilterMatchModes={false}
                                filterMenuStyle={{ width: '14rem' }}
                                style={{ minWidth: '14rem' }}
                                filter
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
                        style={{ width: '800px' }}
                        header="User Details"
                        modal
                        className="p-fluid"
                        footer={saveUserDialogFooter}
                        onHide={hideUserDialog}
                    >
                        <div className="grid line-height-3">
                            <div className="col-6">
                                <div className="field">
                                    <label htmlFor="name">Name</label>
                                    <span className="p-input-icon-right">
                                        <InputText
                                            id="name"
                                            value={user.name}
                                            onChange={(e) =>
                                                onInputChange(e, 'name')
                                            }
                                            required
                                            autoFocus
                                            className={classNames({
                                                'p-invalid':
                                                    submitted && !user.name,
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
                                            onChange={(e) =>
                                                onInputChange(e, 'email')
                                            }
                                            required
                                            autoFocus
                                            className={classNames(
                                                {
                                                    'p-invalid':
                                                        submitted &&
                                                        !user.email,
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
                                                        Invalid email address.
                                                        E.g. example@email.com
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
                                        onChange={(e) =>
                                            onInputChange(e, 'password')
                                        }
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
                                        onChange={(e) =>
                                            onInputChange(e, 'role')
                                        }
                                        required
                                        autoFocus
                                        optionLabel="name"
                                        placeholder="Select a Role"
                                        className={classNames({
                                            'p-invalid':
                                                submitted && !user.role,
                                        })}
                                    />
                                    {submitted && !user.role && (
                                        <small className="p-invalid">
                                            Role is required.
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className="col-6">
                                {user['role'] == 'SOCIETY_HEAD' ? (
                                    <div className="field">
                                        <label htmlFor="subType">
                                            Society Name
                                        </label>
                                        <span className="p-input-icon-right">
                                            <InputText
                                                id="subType"
                                                value={user.userSubType}
                                                onChange={(e) =>
                                                    onInputChange(e, 'subType')
                                                }
                                                required
                                                autoFocus
                                                className={classNames({
                                                    'p-invalid':
                                                        submitted && !user.name,
                                                })}
                                            />
                                            {submitted && !user.userSubType && (
                                                <small className="p-invalid">
                                                    Society Head is required.
                                                </small>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                <div className="field align-content-center">
                                    <Panel header=" " className=" pb-4">
                                        <div
                                            style={{
                                                textAlign: 'center',
                                            }}
                                        >
                                            {imgfile == img ? (
                                                <PrimeImage
                                                    src={`${imgfile}`}
                                                    zoomSrc={`${previewimg}`}
                                                    width="250"
                                                    style={{
                                                        align: 'center',
                                                    }}
                                                />
                                            ) : (
                                                <PrimeImage
                                                    src={`${imgfile}`}
                                                    zoomSrc={`${previewimg}`}
                                                    width="250"
                                                    style={{
                                                        align: 'center',
                                                    }}
                                                    preview
                                                />
                                            )}
                                        </div>
                                    </Panel>
                                    <div
                                        ref={elementRef}
                                        style={{
                                            textAlign: 'center',
                                        }}
                                    >
                                        <FileUpload
                                            ref={imgref}
                                            mode="basic"
                                            name="img"
                                            accept="image/*"
                                            maxFileSize={1000000}
                                            chooseOptions={{
                                                label: 'Browse',
                                                icon: 'pi pi-download',
                                            }}
                                            chooseLabel="Browse"
                                            customUpload={true}
                                            uploadHandler={uploadHandler}
                                            auto
                                        />
                                    </div>
                                </div>
                            </div>
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
