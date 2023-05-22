import React, { useState, useEffect, useRef, useContext } from 'react'
import { ProgressBar, ProgressBarModeType } from 'primereact/progressbar'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { Button } from 'primereact/button'
import { useMutation } from '@apollo/client'
import { Toaster, toast } from 'sonner'
import { DataTable } from 'primereact/datatable'
import { useFetchStudentsHook } from '../../../../queries/students/getStudents'
import { UPDATE_STUDENT } from '../../../../queries/students/updateStudent'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { ThemeContext } from '../../../../utils/customHooks/themeContextProvider'
import { useFetchUsersHook } from '../../../../queries/users/getUsers'
import {
    Footer,
    Student,
    StudentHeading,
    StudentMetaDataDetails,
    StudentTopSectionInformation,
} from '../../../../utils/resumer-generator/interfaces/interfaces'
import useMetaMask from '../../../../utils/customHooks/useMetaMask'
import { START_CERTIFICATE_CRON_JOB } from '../../../../queries/degree/startCronJob'
import { STOP_CERTIFICATE_CRON_JOB } from '../../../../queries/degree/stopCronJob'
import { UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS } from '../../../../queries/students/autoUpdateEligibility'
import { DeployedContracts } from '../../../../contracts/deployedAddresses'
import { ethers } from 'ethers'
import CertificateContractABI from '../../../../contracts/CertificateStore.json'
import DAOContractABI from '../../../../contracts/DAO.json'
import { CREATE_CERTIFICATE_IN_BATCHES } from '../../../../queries/degree/addCertificatesInBatches'
import { cvGeneratorAndUploader } from '../../../../utils/CVGeneratorUtils'
import { UPDATE_ELIGIBITY_OF_STUDENTS } from '../../../../queries/students/updateEligibliltyOfStudents'
import {
    IndexAllContributionsForResume,
    StudentInterface,
} from '../../../../interfaces/CVGenerator'
import { Props } from '../../../../interfaces/UserPropsForAuthentication'
import { serverSideProps } from '../../../../utils/requireAuthentication'
import { Dialog } from 'primereact/dialog'
import { useIndexRecordsByEligibilityHook } from '../../../../queries/students/getStudentsByEligibility'
import { useFetchIndexedContributions } from '../../../../queries/academic/indexAllContributions'
import { ProgressSpinner } from 'primereact/progressspinner'
import { UserInterface } from '../../../users'
import { sendMail } from '../../../../utils/mailService'
import { checkIfEligibleToDeploy } from '../../../../utils/getLatestProposalStatus'

const AutomaticeCertificateGenerator: React.FC<Props> = (props) => {
    const mapStudentToStudentRecord = (student: StudentInterface) => {
        return {
            id: student.id,
            name: student.name,
            rollno: student.id,
            email: student.email,
            eligibilityStatus: student.eligibilityStatus,
            batch: student.batch,
            date: student.updatedAt,
            honours: student.honours,
        }
    }

    const mapContributionToStudentRecord = (
        data: IndexAllContributionsForResume
    ): Student[] => {
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
            return Object.values(contributionsByStudentId)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const mapUserToUserRecord = (user: UserInterface) => {
        return {
            id: user.id,
            name: user.name,
            password: user.password,
            role: user.type,
            email: user.email,
            imgUrl: user.imgUrl,
            subType: user.subType,
        }
    }
    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [account, isMetaMaskConnected, connectToMetaMask] = useMetaMask()
    const [value, setValue] = useState<number>(0)
    const [students, setStudents] = useState<StudentInterface[]>([])
    const [users, setUsers] = useState<UserInterface[]>([])
    const [textContent, setTextContent] = useState<string>('')
    const [studentDataToFetch, setStudentDataToFetch] = useState<string>('')
    const [typeOfDataToFetch, setTypeOfDataToFetch] =
        useState<string>('ELIGIBLE')
    const [contributions, setContributions] = useState<Student[]>([])
    const [isIntermediate, setIsIntermidate] = useState<boolean>(false)
    const [isNotEligbleToGenerate, setIsNotEligbleToGenerate] =
        useState<boolean>(true)
    const [submitted, setSubmitted] = useState<boolean>(true)
    const [continueInProgressDialog, setContinueInProgressDialog] =
        useState<boolean>(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false)
    const [startCronJobFunction] = useMutation(START_CERTIFICATE_CRON_JOB)
    const [stopCronJobFunction] = useMutation(STOP_CERTIFICATE_CRON_JOB)
    const [degreeContract, setDegreeContract] = useState(null)
    const mode: ProgressBarModeType = isIntermediate
        ? 'indeterminate'
        : 'determinate'
    const [updateEligibilityStatusesForAllStudents] = useMutation(
        UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS
    )
    const [updateEligiblilityOfStudents] = useMutation(
        UPDATE_ELIGIBITY_OF_STUDENTS
    )
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalRecords, setTotalRecords] = useState(1)
    const dt = useRef<DataTable | null>(null)
    const eligibilityStatusEnums = [
        'ELIGIBLE',
        'ALREADY_PUBLISHED',
        'NOT_ELIGIBLE',
        'NOT_ALLOWED',
        'IN_PROGRESS',
    ]
    // Create a new options array without the IN_PROGRESS option
    const optionsWithoutInProgress = eligibilityStatusEnums.filter(
        (option) => option !== 'IN_PROGRESS'
    )

    const [usersData, usersLoading, usersFetchingError, usersRefetchHook] =
        useFetchUsersHook('VALIDATOR', 0, 0)

    const [
        studentsData,
        studentsLoading,
        studentsFetchingError,
        studentsRefetchHook,
    ] = useFetchStudentsHook(globalFilter, page + 1, pageLimit)

    const [
        eligibilityBoundStudentsData,
        eligibilityBoundStudentsLoading,
        eligibilityBoundStudentsError,
        eligibilityBoundStudentsRefetchHook,
    ] = useIndexRecordsByEligibilityHook('ELIGIBLE')

    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = useFetchIndexedContributions(studentDataToFetch, typeOfDataToFetch)

    const [
        updateStudentFunction,
        {
            data: studentUpdateData,
            loading: studentUpdateDataLoading,
            error: studentUpdateDataError,
            reset: studentUpdateDataReset,
        },
    ] = useMutation(UPDATE_STUDENT)

    const [
        createCertificateFunction,
        {
            data: createCertificateData,
            loading: createCertificateLoading,
            error: createCertificateError,
            reset: createCertificateReset,
        },
    ] = useMutation(CREATE_CERTIFICATE_IN_BATCHES)

    const fetchStudentData = async () => {
        setIsLoading(true)
        if (!studentsLoading) {
            try {
                let _students = studentsData?.GetAllStudents.items.filter(
                    (val) => val.id != ''
                )
                const studentsRecords =
                    _students.map(mapStudentToStudentRecord) || []
                const total = _students?.GetAllStudents?.total
                setStudents(studentsRecords)
                setTotalRecords(total)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const fetchContributionsData = async () => {
        setIsLoading(true)
        if (!contributionsLoading) {
            try {
                let contributions =
                    contributionsData?.IndexAllContributionsOnCriteria
                const contributionRecords =
                    mapContributionToStudentRecord(contributions) || []
                console.log(contributionsData)
                setContributions(contributionRecords)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
        setIsLoading(false)
    }

    const initalPromptForInProgressDegress = () => {
        if (!eligibilityBoundStudentsLoading) {
            try {
                let studentsData =
                    eligibilityBoundStudentsData?.IndexByEligibilityStatus
                if (studentsData.length > 0) {
                    openContinueInProgress()
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        if (window.ethereum !== 'undefined') {
            const abiArrayForCertificate = CertificateContractABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const certificateContractInstance = new ethers.Contract(
                DeployedContracts.CertificateStore,
                abiArrayForCertificate,
                signer
            )
            setDegreeContract(certificateContractInstance)
        } else {
            console.error('Metamask not found')
        }

        checkIfEligibleToDeploy()
            .then((status) => {
                setIsNotEligbleToGenerate(!status)
            })
            .catch((error) => {
                console.log(error.message)
            })

        // initalPromptForInProgressDegress()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        if (!usersLoading) {
            try {
                let _users = usersData?.GetAllUsers.items.filter(
                    (val) => val.id != ''
                )
                const usersRecord = _users.map(mapUserToUserRecord) || []
                setUsers(usersRecord)
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
            props.userType == 'TEACHER' ||
            props.userType == 'CAREER_COUNSELLOR' ||
            props.userType == 'SOCIETY_HEAD'
        ) {
            router.push('/pages/notfound')
        } else if (props.userType !== 'ADMIN') {
            router.push('/auth/login')
        }
    }, [props.userType])

    useEffect(() => {
        if (!studentsLoading && studentsData) {
            fetchStudentData()
        }
    }, [studentsData, studentsLoading])

    useEffect(() => {
        if (!contributionsData && contributionsData) {
            fetchContributionsData()
        }
    }, [contributionsData, contributionsLoading])

    useEffect(() => {
        const handleRouteChange = () => {
            studentsRefetchHook()
        }

        router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [studentsRefetchHook, router.events])

    useEffect(() => {}, [globalFilter])

    const updateSelectedStudent = async (data: any, newValue: any) => {
        try {
            let _students = [...students]
            let _student: StudentInterface = data?.rowData
            _student.eligibilityStatus = newValue
            const index = data?.rowIndex
            _students[index] = _student
            if (_student != null) {
                await updateStudentFunction({
                    variables: {
                        UpdateStudentInput: {
                            id: _student.id,
                            email: _student.email,
                            name: _student.name,
                            batch: _student.batch,
                            eligibilityStatus: _student.eligibilityStatus,
                            honours: _student.honours,
                        },
                    },
                })
                setStudents(_students)
                toast.success('Eligibilty status of student updated!')
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const compileInProgressDegreesInBackGround = async () => {
        toast.message('Continuing from where you left...')
        setTypeOfDataToFetch('ELIGIBLE')
        if (contributions && contributions?.length > 0) {
            setSubmitted(true)
            setContinueInProgressDialog(false)
            await generateDegrees()
            setTypeOfDataToFetch('ELIGIBLE')
            toast.success('Degree Generation in background complete!')
        } else {
            toast.message('Currently data is being fetched in the background!')
        }
    }

    const generateDegrees = async () => {
        if (contributions && contributions?.length > 0) {
            await connectToMetaMask()
            stopCronJobFunction()
            try {
                if (isMetaMaskConnected) {
                    setIsButtonDisabled(true)
                    setTextContent('Collecting Data')
                    setTextContent('Self-Generating Certificates')
                    setIsIntermidate(false)

                    await updateEligiblilityOfStudents({
                        variables: {
                            UpdateEligibilityInput: {
                                from: 'ELIGIBLE',
                                to: 'IN_PROGRESS',
                            },
                        },
                    })
                    locallyUpdateStudentsEligbilityToDesired(
                        'ELIGIBLE',
                        'IN_PROGRESS'
                    )
                    // Calculate progress percentage for cvGeneratorAndUploader
                    const contributionCount = contributions?.length || 0

                    const cvGeneratorPercentage = Math.round(
                        (50 / contributionCount) * 100
                    )

                    const { dataForBlockchain, dataForDatabase } =
                        await cvGeneratorAndUploader(
                            contributions,
                            setValue,
                            cvGeneratorPercentage
                        )
                    if (dataForBlockchain && dataForBlockchain?.length > 0) {
                        // Calculate progress percentage for uploading to database
                        const databaseUploadPercentage = 25
                        setValue(
                            (prevProgress) =>
                                prevProgress + databaseUploadPercentage
                        )
                        let isDataUploadedSuccessfully =
                            await createCertificateFunction({
                                variables: {
                                    certificates: dataForDatabase,
                                },
                            })

                        // Calculate progress percentage for uploading to blockchain
                        const blockchainUploadPercentage = 25
                        setValue(
                            (prevProgress) =>
                                prevProgress + blockchainUploadPercentage
                        )
                        if (isDataUploadedSuccessfully) {
                            await degreeContract.functions.addCertificates(
                                dataForBlockchain,
                                {
                                    from: sessionStorage.getItem(
                                        'walletAddress'
                                    ),
                                }
                            )
                        }
                        locallyUpdateStudentsEligbilityToDesired(
                            'IN_PROGRESS',
                            'ALREADY_PUBLISHED'
                        )
                        setValue(100)
                        toast.success('Certificates have been deployed!')
                    } else {
                        toast.error('No contributions found!')
                    }
                }
            } catch (error) {
                toast.error(error.message)
                console.log(error)
            }
            setValue(0)
            setTextContent('')
            startCronJobFunction()
        } else {
            await fetchContributionsData()
            toast.message('Currently data is being fetched in the background!')
        }
        setIsButtonDisabled(false)
    }

    const locallyUpdateEligibilityOfStudents = () => {
        // Locally Updated the eligibility for the paginated results
        const currentYear = new Date().getFullYear()
        for (const student of students) {
            const batchYear = parseInt(student.batch)
            if (
                batchYear + 4 <= currentYear &&
                student.eligibilityStatus == 'NOT_ELIGIBLE'
            ) {
                student.eligibilityStatus = 'ELIGIBLE'
            }
        }
        setStudents(students)
    }

    const locallyUpdateStudentsEligbilityToDesired = (
        from: string,
        to: string
    ) => {
        // Locally Updated the eligibility for the paginated results
        for (const student of students) {
            if (student.eligibilityStatus == from) {
                student.eligibilityStatus = to
            }
        }
        setStudents(students)
    }

    const updateEligibilityStatuses = async () => {
        try {
            setTextContent('Updating Students Eligibility Criteria')
            setIsIntermidate(true)
            await updateEligibilityStatusesForAllStudents()
            locallyUpdateEligibilityOfStudents()
            toast.success('Eligibility Criteras Updated Successfully!')
            setIsIntermidate(false)
            setTextContent('')
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const sendMailsToRelevantPeople = () => {
        if (!usersLoading) {
            users.map((user) => {
                sendMail(
                    'Admin',
                    user.email,
                    user.name,
                    'http://localhost:3000/confirmVote'
                )
            })
            toast.success('Emails have been sent to validators!')
        } else {
            toast.message('Users are being fetched!')
        }
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
    }

    const openContinueInProgress = () => {
        setSubmitted(false)
        setContinueInProgressDialog(true)
    }

    const hideAddDegreeDialog = async () => {
        setSubmitted(false)
        setContinueInProgressDialog(false)
        await updateEligiblilityOfStudents({
            variables: {
                UpdateEligibilityInput: {
                    from: 'IN_PROGRESS',
                    to: 'ELIGIBLE',
                },
            },
        })
    }

    const continueInProgressDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideAddDegreeDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-text"
                onClick={compileInProgressDegreesInBackGround}
            />
        </>
    )

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

    const getSeverity = (status) => {
        switch (status) {
            case 'NOT_ELIGIBLE':
                return 'warning'
            case 'ELIGIBLE':
                return 'success'
            case 'ALREADY_PUBLISHED':
                return 'info'
            case 'NOT_ALLOWED':
                return 'danger'
            case 'IN_PROGRESS':
                return 'Primary'
            default:
                return null
        }
    }

    const eligibilityStatusBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.eligibilityStatus}
                severity={getSeverity(rowData.eligibilityStatus)}
            ></Tag>
        )
    }

    const batchBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Batch</span>
                {rowData.batch}
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

    const eligibilityEnumEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={optionsWithoutInProgress}
                onChange={(e) => {
                    updateSelectedStudent(options, e.value),
                        options.editorCallback(e.value)
                }}
                placeholder="Select a Type"
                itemTemplate={(option) => {
                    return option
                }}
            />
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Certificates Eligibility</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left md:flex-grow">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </span>
        </div>
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
        <>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toaster richColors theme={theme} />
                        <div className="card">
                            <h5>{textContent}</h5>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <ProgressBar
                                    style={{
                                        height: 30,
                                        width: '70%',
                                        marginRight: '10px',
                                    }}
                                    mode={mode}
                                    value={value}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Button
                                        label="Send mails for Voting"
                                        style={{ marginRight: '10px' }}
                                        className="p-button-info"
                                        onClick={sendMailsToRelevantPeople}
                                        disabled={isButtonDisabled}
                                    />
                                    <Button
                                        label="Auto Update Eligibility"
                                        style={{ marginRight: '10px' }}
                                        className="p-button-warning"
                                        onClick={updateEligibilityStatuses}
                                        disabled={isButtonDisabled}
                                    />
                                    {isLoading ? (
                                        <ProgressSpinner
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                            }}
                                            strokeWidth="8"
                                            fill="var(--surface-ground)"
                                            animationDuration=".5s"
                                        />
                                    ) : (
                                        <Button
                                            label="Generate & Deploy Certificates"
                                            className={`p-button ${
                                                isNotEligbleToGenerate
                                                    ? 'p-button-danger'
                                                    : 'p-button-success'
                                            }`}
                                            onClick={generateDegrees}
                                            disabled={
                                                isLoading ||
                                                isButtonDisabled ||
                                                isNotEligbleToGenerate
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {isLoading ? (
                            <>
                                {[1, 2, 3, 4, 5].map((v) => (
                                    <SkeletonTable />
                                ))}
                            </>
                        ) : (
                            <DataTable
                                ref={dt}
                                value={students}
                                dataKey="id"
                                defaultValue={1}
                                paginator
                                rows={pageLimit}
                                first={page * pageLimit}
                                onPage={onPageChange}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                                emptyMessage="No students found."
                                header={header}
                                responsiveLayout="scroll"
                                totalRecords={totalRecords}
                                loading={isLoading}
                            >
                                <Column
                                    field="rollno"
                                    header="Roll No."
                                    sortable
                                    body={rollnoBodyTemplate}
                                    headerStyle={{ minWidth: '10rem' }}
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
                                    field="batch"
                                    header="Batch"
                                    body={batchBodyTemplate}
                                    sortable
                                ></Column>
                                <Column
                                    field="eligibilityStatus"
                                    header="Eligibility Status"
                                    body={eligibilityStatusBodyTemplate}
                                    editor={eligibilityEnumEditor}
                                    sortable
                                ></Column>
                            </DataTable>
                        )}
                        <Dialog
                            visible={continueInProgressDialog}
                            style={{ width: '450px' }}
                            header="Confirm"
                            modal
                            className="p-fluid"
                            footer={continueInProgressDialogFooter}
                            onHide={hideAddDegreeDialog}
                        >
                            <div className="flex align-items-center justify-content-center">
                                <i
                                    className="pi pi-exclamation-triangle mr-3"
                                    style={{ fontSize: '2rem' }}
                                />
                                {
                                    <span>
                                        It seems like there are some degrees
                                        which are inprogress of being published,
                                        Do you want to continue the progress?
                                    </span>
                                }
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = serverSideProps
export default AutomaticeCertificateGenerator
