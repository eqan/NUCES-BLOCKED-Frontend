import { gql } from '@apollo/client'

export const GET_USER_DATA = gql`
    query GetUserDataByUserEmail($userEmail: String!) {
        GetUserDataByUserEmail(userEmail: $userEmail) {
            id
            email
            name
            password
            type
            imgUrl
            subType
        }
    }
`
