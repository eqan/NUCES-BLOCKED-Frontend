import { gql, useQuery } from '@apollo/client'

export const GET_CERTIFICATE_BY_ROLLNUMBER = gql`
    query GetCertificateByRollNumber($id: String!) {
        GetCertificateByRollNumber(id: $id) {
            id
            url
        }
    }
`
export function useFetchCertificateHook(studentId: string) {
    const { data, loading, error, refetch } = useQuery(
        GET_CERTIFICATE_BY_ROLLNUMBER,
        {
            variables: {
                id: studentId,
            },
        }
    )
    return [data, loading, error, refetch]
}
