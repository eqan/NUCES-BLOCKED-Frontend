import { BigNumber } from 'ethers'

export const validateTransactionBalance = async (
    provider
): Promise<boolean> => {
    try {
        const signer = provider?.getSigner()
        const balance = BigNumber.from(
            await provider.getBalance(signer.getAddress())
        )
        const minValue = BigNumber.from('100000000000000') // 0.0001 ETH
        if (balance.gt(minValue)) return true
        return false
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}
