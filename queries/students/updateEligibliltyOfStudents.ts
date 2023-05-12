import { gql } from '@apollo/client'

export const UPDATE_ELIGIBITY_OF_STUDENTS = gql`
    mutation UpdateEligibleStudents(
        $UpdateEligibilityInput: UpdateStudentEligibilityInput!
    ) {
        UpdateStudentsEligibility(
            UpdateEligibilityInput: $UpdateEligibilityInput
        )
    }
`
