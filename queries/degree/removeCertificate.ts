import { gql } from '@apollo/client'

export const DELETE_CERTIFICATE = gql`
    mutation DeleteCertificate(
        $DeleteCertificateInput: DeleteCertificatesInput!
    ) {
        DeleteCertificate(DeleteCertificateInput: $DeleteCertificateInput) {
            id
            url
        }
    }
`
