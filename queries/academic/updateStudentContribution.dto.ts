import { gql } from '@apollo/client'

export const UPDATE_STUDENT_CONTRIBUTIONS = gql`
    mutation UpdateContribution($UpdateStudentInput: ContributionDto!) {
        UpdateContribution(UpdateStudentInput: $UpdateStudentInput) {
            id
            CareerCounsellorContributions {
                id
                studentId
                careerCounsellorContributionType
                contribution
            }
            TeachersContributions {
                id
                studentId
                teacherContributionType
                contribution
            }
            SocietyHeadsContributions {
                id
                studentId
                societyHeadContributionType
                contribution
            }
        }
    }
`
