import { gql } from '@apollo/client'

export const CREATE_PROPOSAL = gql`
    mutation CreateProposal($CreateProposalInput: CreateProposalDto!) {
        CreateProposal(CreateProposalInput: $CreateProposalInput) {
            id
            description
            noVotes
            yesVotes
            status
        }
    }
`
