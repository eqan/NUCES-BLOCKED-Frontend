import { gql } from '@apollo/client'

export const UPDATE_STUDENT = gql`
    mutation UpdateStudent($UpdateStudentInput: UpdateStudentInput!) {
        UpdateStudent(UpdateStudentInput: $UpdateStudentInput) {
            id
            email
            name
        }
    }
`
