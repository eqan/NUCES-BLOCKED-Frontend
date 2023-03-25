import { gql } from '@apollo/client'

export const DELETE_STUDENT_CONTRIBUTION = gql`
    mutation DeleteContribution(
        $DeleteContributionInput: DeleteContributionInput!
    ) {
        DeleteContribution(DeleteContributionInput: $DeleteContributionInput) {
            id
            email
            name
        }
    }
`
