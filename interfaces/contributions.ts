// Header Row: studentid, name, email,
// SubRow: id, Contribution, contributor, title

// First expand this to header then the subrow

export interface HeadRowInterface {
    studentId: string
    name: string
    email: string
    subRows: SubRowInterface[]
}

export interface SubRowInterface {
    _id: string
    id: string
    title: string
    type: string
    contribution: string
    date: string
    studentId: string
}

export interface AddContributionDialogInterface {
    _id: string
    id: string
    studentId: string
    title: string
    type: string
    contribution: string
    date: string
}
