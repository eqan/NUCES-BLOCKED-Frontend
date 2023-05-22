import { gql } from '@apollo/client'

export const START_PROPOSAL_CRON_JOB = gql`
    mutation {
        StartProposalCronJob
    }
`
