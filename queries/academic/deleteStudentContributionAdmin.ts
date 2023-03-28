import { gql } from '@apollo/client'

export const DELETE_STUDENT_CONTRIBUTION = gql`
    mutation DeleteContribution(
        $deleteContributionInputs: [DeleteContributionInput!]!
    ) {
        DeleteContribution(DeleteContributionInput: $deleteContributionInputs) {
            id
            email
            name
        }
    }
`
