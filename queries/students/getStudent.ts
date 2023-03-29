import { gql, useQuery } from '@apollo/client'

export const GET_STUDENT = gql`
    query GetStudentDataByUserId($studentId: String!) {
        GetStudentDataByUserId(studentId: $studentId) {
            id
            email
            name
        }
    }
`
export function returnFetchStudentHook(studentId: string) {
    const { data, loading, error, refetch } = useQuery(GET_STUDENT, {
        variables: {
            studentId: studentId,
        },
    })
    return [data, loading, error, refetch]
}
