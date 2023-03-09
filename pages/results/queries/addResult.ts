import { gql } from '@apollo/client'

export const CREATE_RESULT = gql`
    mutation CreateResult($CreateResultInput: CreateResultDto!) {
        CreateResult(CreateResultInput: $CreateResultInput) {
            id
            url
            year
            type
        }
    }
`
