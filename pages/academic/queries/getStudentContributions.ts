import { gql, useQuery } from '@apollo/client'

export const GET_STUDENT_CONTRIBUTIONS = gql`
    query GetAllContributions(
        $FilterContributionsDto: FilterAllContributionDto
    ) {
        GetAllContributions(FilterContributionsDto: $FilterContributionsDto) {
            adminContributions {
                id
                adminContributionType
                contribution
                updatedAt
                student {
                    name
                }
            }
            careerCounsellorContributions {
                id
                studentId
                careerCounsellorContributionType
                contribution
                updatedAt
                student {
                    name
                }
            }
            teachersContribution {
                id
                studentId
                teacherContributionType
                contribution
                updatedAt
                student {
                    name
                }
            }
            societyHeadsContributions {
                id
                studentId
                societyHeadContributionType
                contribution
                updatedAt
                student {
                    name
                }
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
