import { gql } from '@apollo/client'

export const UPDATE_ELIGIBITY_OF_STUDENTS = gql`
    mutation UpdateEligibleStudents(
        $from: EligibilityStatusEnum!
        $to: EligibilityStatusEnum!
    ) {
        UpdateStudentsEligibility(from: $from, to: $to)
    }
`
