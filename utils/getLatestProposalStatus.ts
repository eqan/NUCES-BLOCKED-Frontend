import DAOContractABI from '../contracts/DAO.json'
import { ethers } from 'ethers'
import { DeployedContracts } from '../contracts/deployedAddresses'

export const checkIfEligibleToDeploy = async (): Promise<boolean> => {
    try {
        const abiArrayForDAO = DAOContractABI.abi as any[]
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const DAOContract = new ethers.Contract(
            DeployedContracts.DAO,
            abiArrayForDAO,
            signer
        )
        if (DAOContract != null) {
            const proposalStatus =
                await DAOContract.functions.getProposalStatusOfLatestProposal({
                    from: sessionStorage.getItem('walletAddress'),
                })
            const booleanValue = proposalStatus[0]
            console.log(booleanValue)
            return booleanValue
        }
    } catch (error) {
        console.log(error.message)
    }
}
