import { gql } from '@apollo/client'

export const GET_USER_TYPE = gql`
    query ($userEmail: String!) {
        GetUserTypeByUserEmail(userEmail: $userEmail)
    }
`
