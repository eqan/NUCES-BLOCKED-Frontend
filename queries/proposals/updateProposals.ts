
import { gql } from '@apollo/client'

export const UPDATE_PROPOSALS = gql`
    mutation {
        UpdateAllStatusFromBlockchainAndDatabase
    }
`
