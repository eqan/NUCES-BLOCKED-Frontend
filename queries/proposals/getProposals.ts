import { gql, useQuery } from '@apollo/client'

export const GET_PROPOSALS = gql`
    query GetAllProposals($FilterProposalInput: FilterProposalInput) {
        GetAllProposals(FilterProposalInput: $FilterProposalInput) {
            items {
                id
                description
                yesVotes
                noVotes
                status
            }
            total
        }
    }
`

export function useFetchProposalsHook(id: string, page: number, limit: number) {
    const { data, loading, error, refetch } = useQuery(GET_PROPOSALS, {
        variables: {
            FilterProposalInput: {
                page: page,
                limit: limit,
                id: id,
            },
        },
    })
    return [data, loading, error, refetch]
}
