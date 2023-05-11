import { gql } from '@apollo/client'

export const UPDATE_CERTIFICATE = gql`
    mutation UpdateCertificate(
        $UpdateCertificateInput: UpdateCertificatesInput!
    ) {
        UpdateCertificate(UpdateCertificateInput: $UpdateCertificateInput) {
            id
            url
            student {
                name
                email
                batch
            }
        }
    }
`
