import { useState, useEffect, useCallback } from 'react'

const useMetaMask = () => {
    const [account, setAccount] = useState(null)
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)

    const connectToMetaMask = useCallback(async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            setIsMetaMaskConnected(true)
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        async function getAccount() {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts',
                    })
                    if (accounts.length > 0) {
                        setAccount(accounts[0])
                        setIsMetaMaskConnected(true)
                    } else {
                        setIsMetaMaskConnected(false)
                    }
                } catch (error) {
                    console.error(error)
                    setIsMetaMaskConnected(false)
                }
            } else {
                setIsMetaMaskConnected(false)
            }
        }

        getAccount()
    }, [])

    return [account, isMetaMaskConnected, connectToMetaMask]
}

export default useMetaMask
