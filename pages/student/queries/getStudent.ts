import { gql, useQuery } from '@apollo/client'

export const GET_STUDENTS = gql`
    query GetAllResults($FilterResultInput: FilterResultInput) {
        GetAllResults(FilterResultInput: $FilterResultInput) {
            items {
                id
                url
                year
                type
                updatedAt
            }
            total
        }
    }
`

export function returnFetchStudentsHook(
    studentId: string,
    page: number,
    limit: number
) {
    const { data, loading, error, refetch } = useQuery(GET_STUDENTS, {
        variables: {
            FilterResultInput: {
                page: page,
                limit: limit,
                id: studentId,
            },
        },
    })
    return [data, loading, error, refetch]
}
