import { gql } from '@apollo/client'

export const GET_ACCESS_TOKEN = gql`
    mutation LoginUser($email: String!, $password: String!) {
        LoginUser(LoginUserInput: { email: $email, password: $password }) {
            access_token
        }
    }
`
