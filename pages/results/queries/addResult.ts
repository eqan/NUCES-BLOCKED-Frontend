import { gql } from '@apollo/client'

export const CREATE_CERTIFICATE = gql`
    mutation CreateCertificate($CreateCertificateInput: CreateCertificateDto!) {
        CreateCertificate(CreateCertificateInput: $CreateCertificateInput) {
            id
            url
            student {
                name
            }
        }
    }
`
