import { gql, useQuery } from '@apollo/client'

export const GET_USERS = gql`
    query GetAllUsers($filterUserDto: FilterUserDto) {
        GetAllUsers(filterUserDto: $filterUserDto) {
            items {
                id
                email
                name
                password
                type
                imgUrl
                subType
            }
            total
        }
    }
`

export function returnFetchUsersHook(id: string, page: number, limit: number) {
    const { data, loading, error, refetch } = useQuery(GET_USERS, {
        variables: {
            filterUserDto: {
                page: page,
                limit: limit,
                id: id,
            },
        },
    })
    return [data, loading, error, refetch]
}
