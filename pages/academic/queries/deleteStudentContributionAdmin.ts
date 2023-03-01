import { gql, useMutation, useQuery } from '@apollo/client'

export const DELETE_STUDENT_CONTRIBUTION_ADMIN = gql`
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
