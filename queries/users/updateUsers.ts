import { gql } from '@apollo/client'

export const UPDATE_USER = gql`
    mutation UpdateUser($UpdateUserInput: UpdateUsersInput!) {
        UpdateUser(UpdateUserInput: $UpdateUserInput) {
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
