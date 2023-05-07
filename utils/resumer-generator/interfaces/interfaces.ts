export interface StudentHeading {
    id: string
    studentName: string
    degreeName: string
    degreeProvider: string
    batch: string
}

export interface StudentMetaDataDetails {
    degreeId: string
    rollNumber: string
    email: string
}

export interface SubContributions {
    contributionType: string
    contributor: string
    title: string
    contribution: string
    date: string
}

export interface Contribution {
    contributorType: string
    subContributions: SubContributions[]
}

export interface StudentTopSectionInformation {
    cgpa: string
    honors?: string | null
}

export interface Footer {
    hecTransactionId: string
    chancellorTransactionId: string
    directorTransactionId: string
}

export interface Student {
    heading: StudentHeading
    metaDataDetails: StudentMetaDataDetails
    topPriorityInformation: StudentTopSectionInformation
    contributions: Contribution[]
    footerProps: Footer
}
