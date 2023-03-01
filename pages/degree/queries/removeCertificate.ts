import { gql } from '@apollo/client'

export const UPDATE_CERTIFICATE = gql`
    mutation DeleteCertificate(
        $DeleteCertificateInput: DeleteCertificatesInput!
    ) {
        DeleteCertificate(DeleteCertificateInput: $DeleteCertificateInput) {
            id
            url
        }
    }
`
