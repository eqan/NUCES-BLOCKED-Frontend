import { gql } from '@apollo/client'

export const DELETE_PROPOSAL = gql`
mutation DeleteProposal($DeleteProposalInput: DeleteProposalsInput!) {
        DeleteProposal(DeleteProposalInput: $DeleteProposalInput) {
            id
        }
    }

`
