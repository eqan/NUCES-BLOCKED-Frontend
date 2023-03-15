import { gql } from '@apollo/client'

export const STOP_RESULT_CRON_JOB = gql`
    mutation {
        StopResultCronJob
    }
`
