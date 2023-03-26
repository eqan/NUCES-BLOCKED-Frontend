import { gql } from '@apollo/client'

export const CREATE_STUDENT_CONTRIBUTIONS = gql`
    mutation CreateContribution($CreateStudentInput: ContributionDto!) {
        CreateContribution(CreateStudentInput: $CreateStudentInput) {
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
