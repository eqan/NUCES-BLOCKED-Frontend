import { gql } from '@apollo/client'

export const DELETE_USER = gql`
    mutation DeleteUser($DeleteUserInput: DeleteUsersInput!) {
        DeleteUser(DeleteUserInput: $DeleteUserInput) {
            id
            email
            name
            password
            type
        }
    }
`
