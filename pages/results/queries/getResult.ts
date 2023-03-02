import { gql, useQuery } from '@apollo/client'

export const GET_RESULTS = gql`
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

export function returnFetchResultsHook(
    id: string,
    page: number,
    limit: number
) {
    const { data, loading, error, refetch } = useQuery(GET_RESULTS, {
        variables: {
            FilterResultInput: {
                page: page,
                limit: limit,
                id: id,
            },
        },
    })
    return [data, loading, error, refetch]
}
