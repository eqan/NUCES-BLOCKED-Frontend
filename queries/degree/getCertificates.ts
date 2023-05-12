import { gql, useQuery } from '@apollo/client'

export const GET_CERTIFICATES = gql`
    query GetAllCertificates($FilterCertificateInput: FilterCertificateInput) {
        GetAllCertificates(FilterCertificateInput: $FilterCertificateInput) {
            items {
                id
                url
                student {
                    name
                }
                updatedAt
            }
            total
        }
    }
`

export function useFetchCertificatesHook(
    studentId: string,
    page: number,
    limit: number
) {
    const { data, loading, error, refetch } = useQuery(GET_CERTIFICATES, {
        variables: {
            FilterCertificateInput: {
                page: page,
                limit: limit,
                id: studentId,
            },
        },
    })
    return [data, loading, error, refetch]
}
