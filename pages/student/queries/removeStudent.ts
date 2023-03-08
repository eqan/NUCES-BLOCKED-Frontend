import { gql } from '@apollo/client'

export const DELETE_STUDENT = gql`
    mutation DeleteStudent($DeleteStudentInput: DeleteStudentsInput!) {
        DeleteStudent(DeleteStudentInput: $DeleteStudentInput) {
            id
            email
            name
        }
    }
`
