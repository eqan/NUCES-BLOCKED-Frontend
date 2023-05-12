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
                contributor
                updatedAt
                title
                student {
                    name
                    email
                    batch
                }
            }
            teachersContribution {
                id
                studentId
                teacherContributionType
                contribution
                updatedAt
                title
                student {
                    name
                    email
                    batch
                }
            }
            societyHeadsContributions {
                id
                studentId
                societyHeadContributionType
                contribution
                updatedAt
                title
                student {
                    name
                    email
                    batch
                }
            }

            total
        }
    }
`

export function useFetchContributionsHook(
    contributor: string,
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
                    contributor,
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
