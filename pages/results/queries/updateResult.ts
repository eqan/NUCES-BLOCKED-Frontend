import { gql } from '@apollo/client'

export const UPDATE_RESULT = gql`
    mutation UpdateResult($UpdateResultInput: UpdateResultsInput!) {
        UpdateResult(UpdateResultInput: $UpdateResultInput) {
            id
            url
            year
            type
        }
    }
`
