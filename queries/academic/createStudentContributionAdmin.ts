import { gql } from '@apollo/client'

export const CREATE_STUDENT_CONTRIBUTIONS = gql`
    mutation CreateContribution($CreateStudentInput: ContributionDto!) {
        CreateContribution(CreateStudentInput: $CreateStudentInput) {
            CareerCounsellorContributions {
                id
                careerCounsellorContributionType
                contribution
                title
                updatedAt
            }
            TeachersContributions {
                id
                teacherContributionType
                contribution
                title
                updatedAt
            }
            SocietyHeadsContributions {
                id
                societyHeadContributionType
                contribution
                title
                updatedAt
            }
        }
    }
`
