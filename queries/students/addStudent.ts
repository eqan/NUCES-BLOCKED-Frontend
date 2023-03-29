import { gql } from '@apollo/client'

export const CREATE_STUDENT = gql`
    mutation CreateStudent($CreateStudentInput: CreateStudentInput!) {
        CreateStudent(CreateStudentInput: $CreateStudentInput) {
            id
            email
            name
            cgpa
            batch
        }
    }
`
