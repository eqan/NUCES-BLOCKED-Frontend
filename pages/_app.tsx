import React, { FC, useCallback, useEffect, useState } from 'react'
import { LayoutProvider } from '../layout/context/layoutcontext'
import Layout from '../layout/layout'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import '../styles/layout/layout.scss'
import { useApollo } from '../apollo-client'
import { ApolloProvider } from '@apollo/client'
import {
    ThemeContext,
    ThemeType,
} from '../utils/customHooks/themeContextProvider'
import { registerFonts } from '../utils/resumer-generator/utils/registerFonts'

registerFonts()

interface Props {
    Component: FC & { getLayout: (content: React.ReactNode) => React.ReactNode }
    pageProps: any
}

const MyApp: FC<Props> = ({ Component, pageProps }) => {
    const [theme, setTheme] = useState<ThemeType>()

    useEffect(() => {
        let storedTheme = localStorage.getItem('theme')
        setTheme(storedTheme === 'dark' ? 'dark' : 'light')
    }, [])

    const apolloClient = useApollo(pageProps.initialApolloState)
    if (Component.getLayout) {
        return (
            <ApolloProvider client={apolloClient}>
                <LayoutProvider>
                    <ThemeContext.Provider value={{ theme, setTheme }}>
                        {Component.getLayout(<Component {...pageProps} />)}
                    </ThemeContext.Provider>
                </LayoutProvider>
            </ApolloProvider>
        )
    } else {
        return (
            <ApolloProvider client={apolloClient}>
                <LayoutProvider>
                    <ThemeContext.Provider value={{ theme, setTheme }}>
                        <Layout Component {...pageProps}>
                            <Component {...pageProps} />
                        </Layout>
                    </ThemeContext.Provider>
                </LayoutProvider>
            </ApolloProvider>
        )
    }
}

export default MyApp
