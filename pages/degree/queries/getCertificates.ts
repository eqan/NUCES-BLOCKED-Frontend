import { gql, useQuery } from '@apollo/client'

export const GET_CERTIFICATES = gql`
    query GetAllCertificates($FilterCertificateInput: FilterCertificateInput) {
        GetAllCertificates(FilterCertificateInput: $FilterCertificateInput) {
            items {
                id
                url
            }
            total
        }
    }
`

export function returnFetchCertificatesHook(
    studentId: string,
    page: number,
    limit: number
) {
    const { data, loading, error, refetch } = useQuery(GET_CERTIFICATES, {
        variables: {
            FilterContributionsDto: {
                contributionType,
                page,
                limit,
                studentId,
            },
        },
    })
    return [data, loading, error, refetch]
}
