import { gql, useQuery } from '@apollo/client'

export const INDEX_ALL_CONTRIBUTIONS = gql`
    query IndexAllContributions($stringId: String!) {
        IndexAllContributionsForResume(stringId: $stringId) {
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
                }
            }
        }
    }
`

export function returnFetchIndexedContributionsHook(studentId: string | null) {
    const { data, loading, error, refetch } = useQuery(
        INDEX_ALL_CONTRIBUTIONS,
        {
            variables: {
                stringId: studentId,
            },
        }
    )
    return [data, loading, error, refetch]
}
