import { gql, useQuery } from '@apollo/client'

export const GET_STUDENT_CONTRIBUTIONS = gql`
    query GetAllContributions(
        $FilterContributionsDto: FilterAllContributionDto
    ) {
        GetAllContributions(FilterContributionsDto: $FilterContributionsDto) {
            careerCounsellorContributions {
                id
                studentId
                careerCounsellorContributionType
                contribution
                updatedAt
            }
            teachersContribution {
                id
                studentId
                teacherContributionType
                contribution
                updatedAt
            }
            societyHeadsContributions {
                id
                studentId
                societyHeadContributionType
                contribution
                updatedAt
            }

            total
        }
    }
`

export function returnFetchContributionsHook(
    contributionType: string,
    page: number,
    limit: number,
    studentId: string | null
) {
    const { data, loading, error, refetch } = useQuery(
        GET_STUDENT_CONTRIBUTIONS,
        {
            variables: {
                FilterContributionsDto: {
                    contributionType,
                    page,
                    limit,
                    studentId,
                },
            },
        }
    )
    return [data, loading, error, refetch]
}
