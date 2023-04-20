import { gql } from '@apollo/client'

export const UPDATE_ELIGIBILITY_STATUS_FOR_ALL_STUDENTS = gql`
    mutation {
        UpdateEligibilityStatusForAllStudents
    }
`
