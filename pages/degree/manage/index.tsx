import { useMutation } from '@apollo/client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { CREATE_CERTIFICATE } from '../../../queries/degree/addCertificate'
import { useFetchCertificatesHook } from '../../../queries/degree/getCertificates'
import { DELETE_CERTIFICATE } from '../../../queries/degree/removeCertificate'
import { UPDATE_CERTIFICATE } from '../../../queries/degree/updateCertificate'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { Toaster, toast } from 'sonner'
import { ThemeContext } from '../../../utils/customHooks/themeContextProvider'
import useMetaMask from '../../../utils/customHooks/useMetaMask'
import { START_CERTIFICATE_CRON_JOB } from '../../../queries/degree/startCronJob'
import { STOP_CERTIFICATE_CRON_JOB } from '../../../queries/degree/stopCronJob'
import {
    Footer,
    Student,
    StudentHeading,
    StudentMetaDataDetails,
    StudentTopSectionInformation,
} from '../../../utils/resumer-generator/interfaces/interfaces'
import { DeployedContracts } from '../../../contracts/deployedAddresses'
import ABI from '../../../contracts/CertificateStore.json'
import { ethers } from 'ethers'
import { cvGeneratorAndUploader } from '../../../utils/CVGeneratorUtils'
import {
    CertificateInterface,
    IndexAllContributionsForResume,
} from '../../../interfaces/CVGenerator'
import { Props } from '../../../interfaces/UserPropsForAuthentication'
import { serverSideProps } from '../../../utils/requireAuthentication'
import { useFetchIndexedContributions } from '../../../queries/academic/indexAllContributions'
import { downloadCertificateResult } from '../../../utils/downloadCertificateResult'
import { checkIfEligibleToDeploy } from '../../../utils/getLatestProposalStatus'

const CertificateRecords: React.FC<Props> = (props) => {
    let CertificateRecordInterface = {
        id: '',
        name: '',
        rollno: '',
        date: '',
        url: '',
    }

    const mapCertificateToCertificateRecord = (certificate: any) => {
        return {
            id: certificate.id,
            name: certificate.student.name,
            rollno: certificate.id,
            date: certificate.updatedAt,
            url: certificate.url,
        }
    }
    const mapContributionToStudentRecord = (
        data: IndexAllContributionsForResume
    ): Student => {
        try {
            const contributionsByStudentId: { [id: string]: Student } = {}
            const dataToIterateOver = [
                {
                    contributions: data?.careerCounsellorContributions,
                    type: 'Career Counsellor',
                },
                { contributions: data?.teacherContributions, type: 'Teacher' },
                {
                    contributions: data?.societyHeadsContributions,
                    type: 'Society',
                },
            ]
            for (const { contributions, type } of dataToIterateOver) {
                if (contributions != null) {
                    contributions.forEach((contribution) => {
                        const header: StudentHeading = {
                            id: contribution.studentId,
                            studentName: contribution.student.name,
                            degreeName: 'Bachelors in Computer Science',
                            degreeProvider:
                                'National University Of Computer & Emerging Sciences',
                            batch: contribution.student.batch,
                        }
                        const metaDataDetails: StudentMetaDataDetails = {
                            degreeId: '3232434',
                            rollNumber: contribution.studentId,
                            email: contribution.student.email,
                        }

                        const studentTopPriorityInformation: StudentTopSectionInformation =
                            {
                                cgpa: contribution.student.cgpa,
                                honors: contribution.student.honours,
                            }

                        const footerProps: Footer = {
                            hecTransactionId: 'kask32232jkdas',
                            chancellorTransactionId: 'ewlsdlkalk3232kldsa',
                            directorTransactionId: 'adsladsl3232k',
                        }

                        const contributionType =
                            contribution.societyHeadContributionType ||
                            contribution.teacherContributionType ||
                            contribution.careerCounsellorContributionType

                        if (!contributionsByStudentId[contribution.studentId]) {
                            contributionsByStudentId[contribution.studentId] = {
                                heading: header,
                                metaDataDetails: metaDataDetails,
                                topPriorityInformation:
                                    studentTopPriorityInformation,
                                contributions: [],
                                footerProps: footerProps,
                            }
                        }

                        let foundMatchingContributorType = false
                        contributionsByStudentId[
                            contribution.studentId
                        ].contributions.forEach((c, index) => {
                            if (c.contributorType == type) {
                                foundMatchingContributorType = true
                                contributionsByStudentId[
                                    contribution.studentId
                                ].contributions[index].subContributions.push({
                                    contributionType: contributionType,
                                    contributor: contribution.contributor,
                                    title: contribution.title,
                                    contribution: contribution.contribution,
                                    date: contribution.updatedAt.toString(),
                                })
                            }
                        })

                        if (!foundMatchingContributorType) {
                            contributionsByStudentId[
                                contribution.studentId
                            ].contributions.push({
                                contributorType: type,
                                subContributions: [
                                    {
                                        contributionType: contributionType,
                                        contributor: contribution.contributor,
                                        title: contribution.title,
                                        contribution: contribution.contribution,
                                        date: contribution.updatedAt.toString(),
                                    },
                                ],
                            })
                        }
                    })
                }
            }
            return contributionsByStudentId[studentDataToFetch] || null
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [account, isMetaMaskConnected, connectToMetaMask] = useMetaMask()
    const [startCronJobFunction] = useMutation(START_CERTIFICATE_CRON_JOB)
    const [stopCronJobFunction] = useMutation(STOP_CERTIFICATE_CRON_JOB)
    const [contract, setContract] = useState(null)
    const [studentDataToFetch, setStudentDataToFetch] = useState<string>('')
    const [degrees, setDegrees] = useState<CertificateInterface[]>([])
    const [degreeAddDialog, setAddDegreeDialog] = useState(false)
    const [degreeUpdateDialog, setUpdateDegreeDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isDisabled, setIsDisabled] = useState(true)
    const [deleteDegreeDialog, setDeleteDegreeDialog] = useState(false)
    const [deleteDegreesDialog, setDeleteDegreesDialog] = useState(false)
    const [degree, setDegree] = useState(CertificateRecordInterface)
    const [selectedDegrees, setSelectedDegrees] = useState<
        CertificateInterface[]
    >([])
    const [student, setStudent] = useState<Student>()
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable>(null)

    const [
        certificatesData,
        certificatesLoading,
        certificatesFetchingError,
        certificatesRefetchHook,
    ] = useFetchCertificatesHook(globalFilter, page + 1, pageLimit)

    const [
        deleteCertificateFunction,
        {
            data: certificateDeleteData,
            loading: certificateDeteDataLoading,
            error: certificateDeleteDataError,
            reset: certificateDeleteDataReset,
        },
    ] = useMutation(DELETE_CERTIFICATE)

    const [
        createCertificateFunction,
        {
            data: certifcateCreateData,
            loading: certificateCreateDataLoading,
            error: certificateCreateDataError,
            reset: certificateCreateDataReset,
        },
    ] = useMutation(CREATE_CERTIFICATE)

    const [
        updateCertificateFunction,
        {
            data: certificateUpdateData,
            loading: certificateUpdateDataLoading,
            error: certificateUpdateDataError,
            reset: certificateUpdateDataReset,
        },
    ] = useMutation(UPDATE_CERTIFICATE)

    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = useFetchIndexedContributions(studentDataToFetch, 'ELIGIBLE')

    const fetchData = async () => {
        setIsLoading(true)
        if (!certificatesLoading) {
            try {
                let _degrees =
                    certificatesData?.GetAllCertificates.items.filter(
                        (val) => val.id != ''
                    )
                const certificateRecords =
                    _degrees.map(mapCertificateToCertificateRecord) || []
                const total = certificatesData?.GetAllCertificates?.total
                setDegrees(certificateRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (!certificatesLoading && certificatesData) {
            fetchData()
        }
    }, [certificatesData, certificatesLoading])

    useEffect(() => {
        if (!props) {
            router.push('/auth/login')
        } else {
            if (
                props.userType == 'TEACHER' ||
                props.userType == 'CAREER_COUNSELLOR' ||
                props.userType == 'SOCIETY_HEAD'
            ) {
                router.push('/pages/notfound')
            } else if (props.userType !== 'ADMIN') {
                router.push('/auth/login')
            }
        }
    }, [props])

    useEffect(() => {
        const handleRouteChange = () => {
            certificatesRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [certificatesRefetchHook, router.events])

    useEffect(() => {
        if (window['ethereum'] !== 'undefined') {
            const abiArray = ABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(
                window['ethereum']
            )
            const signer = provider.getSigner()
            const contractInstance = new ethers.Contract(
                DeployedContracts.CertificateStore,
                abiArray,
                signer
            )
            setContract(contractInstance)

            checkIfEligibleToDeploy()
                .then((status) => {
                    setIsDisabled(!status)
                })
                .catch((error) => {
                    console.log(error.message)
                })
        } else {
            console.error('Metamask not found')
        }
    }, [])

    useEffect(() => {}, [globalFilter])

    const openNewAddDegreeDialog = () => {
        setDegree(CertificateRecordInterface)
        setSubmitted(false)
        setAddDegreeDialog(true)
    }

    const hideAddDegreeDialog = () => {
        setSubmitted(false)
        setAddDegreeDialog(false)
    }

    const hideUpdateDegreeDialog = () => {
        setSubmitted(false)
        setUpdateDegreeDialog(false)
    }

    const hideDeleteDegreeDialog = () => {
        setDeleteDegreeDialog(false)
    }

    const hideDeleteDegreesDialog = () => {
        setDeleteDegreesDialog(false)
    }

    const fetchContributionsData = async () => {
        setIsLoading(true)
        if (!contributionsLoading) {
            try {
                let contributions =
                    contributionsData?.IndexAllContributionsForResume
                const contributionRecords =
                    mapContributionToStudentRecord(contributions)
                setStudent(contributionRecords)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const addDegree = async (): Promise<string> => {
        if (student) {
            await connectToMetaMask()
            stopCronJobFunction()
            if (degree.rollno && isMetaMaskConnected) {
                setSubmitted(true)
                setAddDegreeDialog(false)
                let _degrees = [...degrees]
                let _degree = { ...degree }
                try {
                    const { dataForBlockchain, dataForDatabase } =
                        await cvGeneratorAndUploader([student])
                    const _tempDataForDatabase = dataForDatabase?.pop()
                    const _tempDataForBlockchain = dataForBlockchain?.pop()
                    if (dataForDatabase) {
                        _degrees[_degree.rollno] = _degree
                        let _newDegree = await createCertificateFunction({
                            variables: {
                                CreateCertificateInput: _tempDataForDatabase,
                            },
                        })
                        if (_newDegree) {
                            _tempDataForBlockchain.batch =
                                _newDegree?.data?.CreateCertificate?.student?.batch
                            _tempDataForBlockchain.email =
                                _newDegree?.data?.CreateCertificate?.student?.email
                            await contract.functions.addCertificate(
                                ..._tempDataForBlockchain,
                                {
                                    from: sessionStorage.getItem(
                                        'walletAddress'
                                    ),
                                }
                            )
                            _newDegree = _newDegree.data['CreateCertificate']
                            const mappedData: CertificateInterface =
                                mapCertificateToCertificateRecord(_newDegree)
                            _degrees = _degrees.filter(
                                (item) => (item.rollno = mappedData.id)
                            )
                            _degrees.push(mappedData)
                            setDegrees(_degrees)
                        }
                    } else {
                        throw new Error('No Certificate to deploy!')
                    }
                } catch (error) {
                    console.log(error)
                    throw new Error(error.message)
                }
                setDegree(CertificateRecordInterface)
            }
            startCronJobFunction()
            return 'Certificate has been deployed!'
        } else {
            setStudentDataToFetch(degree.rollno)
            await fetchContributionsData()
            return 'Currently data is being fetched in the background!'
        }
    }

    const updateDegree = async (): Promise<String> => {
        if (student) {
            await connectToMetaMask()
            stopCronJobFunction()
            if (degree.url && isMetaMaskConnected) {
                setSubmitted(true)
                setUpdateDegreeDialog(false)
                let _degrees = [...degrees]
                let _degree = { ...degree }
                try {
                    setStudentDataToFetch(degree.rollno)
                    await fetchContributionsData()
                    const { dataForBlockchain, dataForDatabase } =
                        await cvGeneratorAndUploader([student])
                    const _tempDataForDatabase = dataForDatabase?.pop()
                    const _tempDataForBlockchain = dataForBlockchain?.pop()
                    const index = findIndexById(_degree.rollno)
                    _degrees[index] = _degree
                    let _updatedDegree = await updateCertificateFunction({
                        variables: {
                            UpdateCertificateInput: _tempDataForDatabase,
                        },
                    })

                    if (_updatedDegree) {
                        _tempDataForBlockchain.batch =
                            _updatedDegree?.data?.UpdateCertificate?.student?.batch
                        _tempDataForBlockchain.email =
                            _updatedDegree?.data?.UpdateCertificate?.student?.email
                        await contract.functions.updateCertificate(
                            ..._tempDataForBlockchain,
                            {
                                from: sessionStorage.getItem('walletAddress'),
                            }
                        )
                    } else {
                        throw new Error('No Certificate to update!')
                    }
                    setDegrees(_degrees)
                } catch (error) {
                    console.log(error)
                    throw new Error(error.message)
                }

                setDegree(CertificateRecordInterface)
            }
            startCronJobFunction()
            return 'Certificate has been updated!'
        } else {
            setStudentDataToFetch(degree.rollno)
            await fetchContributionsData()
            return 'Currently data is being fetched in the background!'
        }
    }

    const editDegree = (degree) => {
        setDegree({ ...degree })
        setUpdateDegreeDialog(true)
    }

    const confirmDeleteDegree = (degree) => {
        setDegree(degree)
        setDeleteDegreeDialog(true)
    }

    const deleteDegree = async () => {
        await connectToMetaMask()
        stopCronJobFunction()
        if (isMetaMaskConnected) {
            let _degrees = degrees.filter((val) => val.id !== degree.id)
            setDeleteDegreeDialog(false)
            try {
                await deleteCertificateFunction({
                    variables: {
                        DeleteCertificateInput: {
                            id: [degree.rollno],
                        },
                    },
                })
                await contract.functions.removeCertificate(degree.id, {
                    from: sessionStorage.getItem('walletAddress'),
                })
                setDegrees(_degrees)
                if (certificateDeleteDataError) {
                    throw new Error(certificateDeleteDataError.message)
                }
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
            setDegree(CertificateRecordInterface)
        }

        startCronJobFunction()
        return 'Degree removed!'
    }

    const findIndexById = (id) => {
        let index = -1
        for (let i = 0; i < degrees.length; i++) {
            if (degrees[i].id === id) {
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
        setDeleteDegreesDialog(true)
    }

    const deleteSelectedDegrees = async () => {
        await connectToMetaMask()
        stopCronJobFunction()
        if (isMetaMaskConnected) {
            let _degrees = degrees.filter(
                (val) => !selectedDegrees.includes(val)
            )
            let _toBeDeletedDegrees = degrees
                .filter((val) => selectedDegrees.includes(val))
                .map((val) => val.id)
            setDeleteDegreesDialog(false)
            try {
                await contract.functions.removeCertificates(
                    _toBeDeletedDegrees,
                    {
                        from: sessionStorage.getItem('walletAddress'),
                    }
                )

                await deleteCertificateFunction({
                    variables: {
                        DeleteCertificateInput: {
                            id: _toBeDeletedDegrees,
                        },
                    },
                })
                if (certificateDeleteDataError) {
                    throw new Error(certificateDeleteDataError.message)
                }
            } catch (error) {
                console.log(error)
                throw new Error(error.message)
            }
            setSelectedDegrees([])
            setDegrees(_degrees)
        }
        startCronJobFunction()
        return 'Selected degrees removed!'
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || ''
        let _degree = { ...degree }
        _degree[`${name}`] = val
        setDegree(_degree)
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
                        onClick={openNewAddDegreeDialog}
                        disabled={isDisabled}
                    />
                    <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedDegrees || !selectedDegrees.length}
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

    const urlBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">url</span>
                {rowData.url}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-arrow-down"
                    className="p-button-rounded p-button-success mr-2"
                    onClick={() => {
                        toast.promise(downloadCertificateResult(rowData), {
                            loading: 'Certificate is being downloaded...',
                            success: (data) => {
                                return data
                            },
                            error: (error) => {
                                return error.message
                            },
                        })
                    }}
                />
                <Button
                    icon="pi pi-refresh"
                    className="p-button-rounded p-button-warning mr-2"
                    onClick={() => editDegree(rowData)}
                    disabled={isDisabled}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDeleteDegree(rowData)}
                    disabled={isDisabled}
                />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Certificate</h5>
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

    const addDegreeDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddDegreeDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(addDegree, {
                        loading: 'Degree is being added...',
                        success: (data) => {
                            return data
                        },
                        error: (error) => {
                            return error.message
                        },
                    })
                }}
            />
        </>
    )

    const updateDegreeDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUpdateDegreeDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(updateDegree, {
                        loading: 'Degree is being updated...',
                        success: (data) => {
                            return data
                        },
                        error: (error) => {
                            return error.message
                        },
                    })
                }}
            />
        </>
    )
    const deleteDegreeDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteDegreeDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteDegree, {
                        loading: 'Degree is being removed...',
                        success: (data) => {
                            return data
                        },
                        error: (error) => {
                            return error.message
                        },
                    })
                }}
            />
        </>
    )
    const deleteDegreesDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeleteDegreesDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={() => {
                    toast.promise(deleteSelectedDegrees, {
                        loading: 'Selected degrees are being removed...',
                        success: (data) => {
                            return data
                        },
                        error: (error) => {
                            return error.message
                        },
                    })
                }}
            />
        </>
    )

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
                    <Toaster richColors theme={theme} />
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
                            value={degrees}
                            selection={selectedDegrees}
                            onSelectionChange={(e) =>
                                setSelectedDegrees(e.value)
                            }
                            dataKey="id"
                            defaultValue={1}
                            paginator
                            rows={pageLimit}
                            first={page * pageLimit}
                            onPage={onPageChange}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} degrees"
                            emptyMessage="No degrees found."
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
                                field="url"
                                header="Url"
                                body={urlBodyTemplate}
                                sortable
                                headerStyle={{ minWidth: '15rem' }}
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
                                body={actionBodyTemplate}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>
                        </DataTable>
                    )}

                    <Dialog
                        visible={degreeAddDialog}
                        style={{ width: '450px' }}
                        header="Degree Details"
                        modal
                        className="p-fluid"
                        footer={addDegreeDialogFooter}
                        onHide={hideAddDegreeDialog}
                    >
                        <div className="field">
                            <label htmlFor="rollno">Roll No.</label>
                            <span className="p-input-icon-right">
                                <InputText
                                    id="rollno"
                                    value={degree.rollno}
                                    onChange={(e) => onInputChange(e, 'rollno')}
                                    required
                                    autoFocus
                                    className={classNames(
                                        {
                                            'p-invalid':
                                                submitted && !degree.rollno,
                                        },
                                        {
                                            'p-invalid1':
                                                submitted && degree.rollno,
                                        }
                                    )}
                                />
                                <i className="pi pi-fw pi-id-card" />
                            </span>
                        </div>
                    </Dialog>

                    <Dialog
                        visible={degreeUpdateDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        className="p-fluid"
                        footer={updateDegreeDialogFooter}
                        onHide={hideUpdateDegreeDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {degree && (
                                <span>
                                    Are you sure you want to update{' '}
                                    <b>{degree.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteDegreeDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDegreeDialogFooter}
                        onHide={hideDeleteDegreeDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {degree && (
                                <span>
                                    Are you sure you want to delete{' '}
                                    <b>{degree.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteDegreesDialog}
                        style={{ width: '450px' }}
                        header="Confirm"
                        modal
                        footer={deleteDegreesDialogFooter}
                        onHide={hideDeleteDegreesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: '2rem' }}
                            />
                            {degree && (
                                <span>
                                    Are you sure you want to delete the selected
                                    academic certificate?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = serverSideProps
export default CertificateRecords
