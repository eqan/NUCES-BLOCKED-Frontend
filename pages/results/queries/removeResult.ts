import { gql } from '@apollo/client'

export const DELETE_RESULT = gql`
    mutation DeleteResult($DeleteResultInput: DeleteResultsInput!) {
        DeleteResult(DeleteResultInput: $DeleteResultInput) {
            id
            url
            year
            type
        }
    }
`
