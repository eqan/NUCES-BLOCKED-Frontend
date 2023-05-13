import { useQuery, gql } from '@apollo/client'

const INDEX_BY_ELIGIBILITY_STATUS_QUERY = gql`
    query IndexByEligibilityStatus($eligibility: String!) {
        IndexByEligibilityStatus(eligibility: $eligibility) {
            id
        }
    }
`

export function useIndexRecordsByEligibilityHook(eligibility: string) {
    const { data, loading, error, refetch } = useQuery(
        INDEX_BY_ELIGIBILITY_STATUS_QUERY,
        {
            variables: { eligibility },
        }
    )
    return [data, loading, error, refetch]
}
