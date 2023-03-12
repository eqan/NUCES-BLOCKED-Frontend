import { gql, useQuery } from '@apollo/client'

export const GET_STUDENTS = gql`
    query GetAllStudents($filterStudentDto: FilterStudentDto) {
        GetAllStudents(filterStudentDto: $filterStudentDto) {
            items {
                id
                email
                name
                cgpa
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
            filterStudentDto: {
                page: page,
                limit: limit,
                id: studentId,
            },
        },
    })
    return [data, loading, error, refetch]
}
