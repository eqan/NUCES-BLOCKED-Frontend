export interface CertificateForDatabase {
    id: string
    url: string
}

export interface Certificate {
    id: string
    name: string
    email: string
    url: string
    cgpa: string
    batch: string
    honors: string | null
}
export interface StudentInterface {
    id: string
    name: string
    rollno: string
    email: string
    date: string
    batch: string
    eligibilityStatus: string
    honours: string
}
export interface IndexAllContributionsForResume {
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

export interface CertificateInterface {
    id: string
    name: string
    rollno: string
    date: string
    url: string
}
