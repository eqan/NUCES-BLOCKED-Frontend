import { gql } from '@apollo/client'

export const STOP_PROPOSAL_CRON_JOB = gql`
    mutation {
        StopProposalCronJob
    }
`
