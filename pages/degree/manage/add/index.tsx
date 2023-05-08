import React, { useState, useEffect, useRef, useContext } from 'react'
import { ProgressBar, ProgressBarModeType } from 'primereact/progressbar'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { requireAuthentication } from '../../../../layout/context/requireAuthetication'
import apolloClient from '../../../../apollo-client'
import jwt from 'jsonwebtoken'
import { Button } from 'primereact/button'
import { useMutation } from '@apollo/client'
import { Toaster, toast } from 'sonner'
import { DataTable } from 'primereact/datatable'
import { returnFetchStudentsHook } from '../../../../queries/students/getStudents'
import { UPDATE_STUDENT } from '../../../../queries/students/updateStudent'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { ThemeContext } from '../../../../utils/customHooks/themeContextProvider'
import { returnFetchIndexedContributionsHook } from '../../../../queries/academic/indexAllContributions'
import {
    Footer,
    Student,
    StudentHeading,
    StudentMetaDataDetails,
    StudentTopSectionInformation,
} from '../../../../utils/resumer-generator/interfaces/interfaces'
import fileUploaderToNFTStorage from '../../../../utils/fileUploaderToNFTStorage'
import { CV } from '../../../../utils/resumer-generator/CV/CV'
import { pdf } from '@react-pdf/renderer'
import useMetaMask from '../../../../utils/customHooks/useMetaMask'
import { START_CERTIFICATE_CRON_JOB } from '../../../../queries/degree/startCronJob'
import { STOP_CERTIFICATE_CRON_JOB } from '../../../../queries/degree/stopCronJob'
import { UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS } from '../../../../queries/students/autoUpdateEligibility'
import { GET_USER_DATA } from '../../../../queries/users/getUser'
import { DeployedContracts } from '../../../../contracts/deployedAddresses'
import { ethers } from 'ethers'
import ABI from '../../../../contracts/CertificateStore.json'
import { CREATE_CERTIFICATE_IN_BATCHES } from '../../../../queries/degree/addCertificatesInBatches'

interface Props {
    userType: string | null
    userimg: string | null
}

interface CertificateForDatabase {
    id: string
    url: string
}

interface Certificate {
    id: string
    name: string
    email: string
    url: string
    cgpa: string
    batch: string
}
interface StudentInterface {
    id: string
    name: string
    rollno: string
    email: string
    date: string
    batch: string
    eligibilityStatus: string
    honours: string
}
interface IndexAllContributionsForResume {
    careerCounsellorContributions: {
        student: {
            name: string
            cgpa: string
            honours: string
        }
        studentId: string
        careerCounsellorContributionType: string
        contribution: string
        contributor: string
        title: string
        updatedAt: string
    }[]
    societyHeadsContributions: {
        student: {
            name: string
            cgpa: string
            honours: string
        }
        societyHeadContributionType: string
        contribution: string
        contributor: string
        title: string
        updatedAt: string
    }[]
    teacherContributions: {
        student: {
            name: string
            cgpa: string
            honours: string
        }
        teacherContributionType: string
        contribution: string
        contributor: string
        title: string
        updatedAt: string
    }[]
}

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

    const router = useRouter()
    const { theme } = useContext(ThemeContext)
    const [account, isMetaMaskConnected, connectToMetaMask] = useMetaMask()
    const [value, setValue] = useState<number>(0)
    const [students, setStudents] = useState<StudentInterface[]>([])
    const [textContent, setTextContent] = useState<string>('')
    const [studentDataToFetch, setStudentDataToFetch] = useState<string>('')
    const [contributions, setContributions] = useState<Student[]>([])
    const interval = useRef<any | null | undefined>(null)
    const [isIntermediate, setIsIntermidate] = useState<boolean>(false)
    const [startCronJobFunction] = useMutation(START_CERTIFICATE_CRON_JOB)
    const [stopCronJobFunction] = useMutation(STOP_CERTIFICATE_CRON_JOB)
    const [contract, setContract] = useState(null)
    const [provider, setProvider] = useState(null)
    const mode: ProgressBarModeType = isIntermediate
        ? 'indeterminate'
        : 'determinate'
    const [updateEligibilityStatusesForAllStudents] = useMutation(
        UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS
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
    ]
    const [
        studentsData,
        studentsLoading,
        studentsFetchingError,
        studentsRefetchHook,
    ] = returnFetchStudentsHook(globalFilter, page + 1, pageLimit)

    const [
        contributionsData,
        contributionsLoading,
        contributionsFetchingError,
        contributionsRefetchHook,
    ] = returnFetchIndexedContributionsHook(studentDataToFetch)

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
                    contributionsData?.IndexAllContributionsForResume
                const contributionRecords =
                    mapContributionToStudentRecord(contributions) || []
                setContributions(contributionRecords)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (window.ethereum !== 'undefined') {
            const abiArray = ABI.abi as any[]
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contractInstance = new ethers.Contract(
                DeployedContracts.CertificateStore,
                abiArray,
                signer
            )
            setContract(contractInstance)
            setProvider(provider)
        } else {
            console.error('Metamask not found')
        }
    }, [])

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

    const updateSelectedStudent = async (data, newValue) => {
        try {
            let _students = [...students]
            let _student: StudentInterface = data?.rowData
            _student.eligibilityStatus = newValue
            const index = data?.rowIndex
            _students[index] = _student
            if (_student != null) {
                const data = await updateStudentFunction({
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

    const generatePDFBlob = async (student) => {
        // Create a new Document
        const doc = <CV student={student} />

        // Render the document to a blob
        const blob = await pdf(doc).toBlob()
        return blob
    }

    const cvGeneratorAndUploader = async () => {
        const dataForBlockchain: Certificate[] = []
        const dataForDatabase: CertificateForDatabase[] = []

        for (const student of contributions) {
            try {
                const pdfBlob = await generatePDFBlob(student)
                const url = await fileUploaderToNFTStorage(
                    pdfBlob,
                    student.heading.id,
                    '.pdf',
                    'application/pdf',
                    `Academic portfolio of ${student.heading.id}`
                )
                dataForBlockchain.push({
                    id: student.metaDataDetails.rollNumber,
                    name: student.heading.studentName,
                    email: student.metaDataDetails.email,
                    url,
                    cgpa: student.topPriorityInformation.cgpa,
                    batch: student.heading.batch,
                })
                dataForDatabase.push({
                    id: student.metaDataDetails.rollNumber,
                    url,
                })
            } catch (error) {
                console.error(error)
                toast.error(error.message)
            }
        }

        return { dataForBlockchain, dataForDatabase }
    }

    const generateDegrees = async () => {
        await connectToMetaMask()
        stopCronJobFunction()
        try {
            if (isMetaMaskConnected) {
                setTextContent('Collecting Data')
                setTextContent('Self-Generating Certificates')
                setIsIntermidate(false)
                await fetchContributionsData()
                const { dataForBlockchain, dataForDatabase } =
                    await cvGeneratorAndUploader()
                let isDataUploadedSuccessfully =
                    await createCertificateFunction({
                        variables: {
                            certificates: dataForDatabase,
                        },
                    })
                if (isDataUploadedSuccessfully) {
                    await contract.functions.addCertificates(
                        dataForBlockchain,
                        {
                            from: sessionStorage.getItem('walletAddress'),
                        }
                    )
                }
                toast.success('Certificates have been deployed!')
                setTextContent('')
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
        startCronJobFunction()
    }

    const locallyUpdateThePaginatedResults = () => {
        // Locally Updated the eligibility for the paginated results
        const currentYear = new Date().getFullYear()
        for (const student of students) {
            const batchYear = parseInt(student.batch)
            if (batchYear + 4 <= currentYear) {
                student.eligibilityStatus = 'ELIGIBLE'
            }
        }
        setStudents(students)
    }

    const updateEligibilityStatuses = async () => {
        try {
            setTextContent('Updating Students Eligibility Criteria')
            setIsIntermidate(true)
            await updateEligibilityStatusesForAllStudents()
            locallyUpdateThePaginatedResults()
            toast.success('Eligibility Criteras Updated Successfully!')
            setIsIntermidate(false)
            setTextContent('')
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const onPageChange = (event) => {
        setPage(event.first / event.rows)
        setPageLimit(event.rows)
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
                options={eligibilityStatusEnums}
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

    // useEffect(() => {
    //     let val = value
    //     interval.current = setInterval(() => {
    //         val += Math.floor(Math.random() * 50) + 1

    //         if (val >= 100) {
    //             val = 100
    //             if (interval.current) clearInterval(interval.current)
    //         }
    //         setValue(val)
    //     }, 2000)

    //     return () => {
    //         if (interval.current) {
    //             clearInterval(interval.current)
    //             interval.current = null
    //         }
    //     }
    // }, [value])

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
                                        label="Auto Update Eligibility"
                                        style={{ marginRight: '10px' }}
                                        className="p-button-warning"
                                        onClick={updateEligibilityStatuses}
                                    />
                                    <Button
                                        label="Generate & Deploy Certificates"
                                        className="p-button-success"
                                        onClick={generateDegrees}
                                    />
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
                    </div>
                </div>
            </div>
        </>
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
            }
            return {
                props: {
                    userType: userData?.type || null,
                    userimg: userData?.imgUrl || null,
                },
            }
        }
    }
)

export default AutomaticeCertificateGenerator
