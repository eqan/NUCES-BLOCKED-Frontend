import { gql } from '@apollo/client'

export const CREATE_UPDATE_STUDENT_CONTRIBUTIONS_ADMIN = gql`
    mutation CreateUpdateContribution(
        $CreateUpdateStudentInput: ContributionDto!
    ) {
        CreateUpdateContribution(
            CreateUpdateStudentInput: $CreateUpdateStudentInput
        ) {
            id
            AdminContributions {
                id
                adminContributionType
                contribution
            }
        }
    }
`
