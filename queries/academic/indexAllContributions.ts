import { gql, useQuery } from '@apollo/client'

export const INDEX_ALL_CONTRIBUTIONS_QUERY = gql`
    query IndexAllContributions(
        $studentId: String!
        $eligibility: EligibilityStatusEnum!
    ) {
        IndexAllContributionsOnCriteria(
            IndexAllContributionsDto: {
                studentId: $studentId
                eligibility: $eligibility
            }
        ) {
            careerCounsellorContributions {
                studentId
                careerCounsellorContributionType
                contribution
                contributor
                title
                updatedAt
                student {
                    name
                    cgpa
                    honours
                    batch
                    email
                }
            }
            societyHeadsContributions {
                studentId
                societyHeadContributionType
                contribution
                contributor
                updatedAt
                title
                student {
                    name
                    cgpa
                    honours
                    batch
                    email
                }
            }
            teachersContribution {
                studentId
                teacherContributionType
                contributor
                contribution
                updatedAt
                title
                student {
                    name
                    cgpa
                    honours
                    batch
                    email
                }
            }
        }
    }
`

export function useFetchIndexedContributions(
    studentId: string,
    eligibility: string
) {
    const { data, loading, error, refetch } = useQuery(
        INDEX_ALL_CONTRIBUTIONS_QUERY,
        {
            variables: {
                studentId,
                eligibility,
            },
        }
    )
    return [data, loading, error, refetch]
}
