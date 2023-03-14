import { gql } from '@apollo/client'

export const STOP_CERTIFICATE_CRON_JOB = gql`
    mutation {
        StopCertificateCronJob
    }
`
