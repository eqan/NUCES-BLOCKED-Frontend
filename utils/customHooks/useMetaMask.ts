import { useState, useEffect } from 'react'

export function useMetaMask() {
    const [account, setAccount] = useState('')

    useEffect(() => {
        async function connectToMetaMask() {
            // Check if MetaMask is installed
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Request access to MetaMask accounts
                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts',
                    })
                    // Set the first account as the connected account
                    setAccount(accounts[0])
                } catch (error) {
                    console.log(error)
                }
            } else {
                // MetaMask is not installed
                console.log('Please install MetaMask')
            }
        }

        // Check if MetaMask is already connected
        if (
            typeof window.ethereum !== 'undefined' &&
            window.ethereum.selectedAddress
        ) {
            setAccount(window.ethereum.selectedAddress)
        } else {
            // Prompt user to connect to MetaMask
            connectToMetaMask()
        }
    }, [])

    return account
}
