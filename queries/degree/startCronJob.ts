import { gql } from '@apollo/client'

export const START_CERTIFICATE_CRON_JOB = gql`
    mutation {
        StartCertificateCronJob
    }
`
