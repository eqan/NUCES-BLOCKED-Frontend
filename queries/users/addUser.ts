import { gql } from '@apollo/client'

export const CREATE_USER = gql`
    mutation CreateUser($CreateUserInput: CreateUserInput!) {
        CreateUser(CreateUserInput: $CreateUserInput) {
            id
            email
            name
            password
            type
            imgUrl
        }
    }
`
