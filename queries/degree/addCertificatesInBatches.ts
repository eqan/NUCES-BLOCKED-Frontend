import { gql } from '@apollo/client'

export const CREATE_CERTIFICATE_IN_BATCHES = gql`
    mutation CreateCertificatesInBatches(
        $certificates: [CreateCertificateDto!]!
    ) {
        CreateCertificateInBatches(CreateCertificateInput: $certificates)
    }
`
