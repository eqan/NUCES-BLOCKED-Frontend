export const checkEligibleForTransaction = async ({
    provider,
    contractFunction,
    args,
}): Promise<boolean> => {
    try {
        // Call the contract function and estimate the gas cost
        const signer = provider.getSigner()
        const gasLimit = await contractFunction.estimateGas(...args)
        const gasPrice = await provider.getGasPrice()

        // Get the wallet balance
        const balance = await provider.getBalance(signer.getAddress())

        // Calculate the expected gas fee
        const gasFee = gasLimit.mul(gasPrice)

        // Check if the wallet balance is sufficient to cover the gas fee
        if (balance.gte(gasFee)) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}
