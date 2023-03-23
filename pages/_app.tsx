import React, { FC } from 'react'
import { LayoutProvider } from '../layout/context/layoutcontext'
import Layout from '../layout/layout'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import '../styles/layout/layout.scss'
import '../styles/demo/Demos.scss'
import { useApollo } from '../apollo-client'
import { ApolloProvider } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { requireAuthentication } from '../layout/context/requireAuthetication'
import { gql } from '@apollo/client'
import apolloClient from '../apollo-client'
import jwt from 'jsonwebtoken'
import { GET_USER_DATA } from '../queries/users/getUser'

const GET_USER_TYPE = gql`
    query ($userEmail: String!) {
        GetUserTypeByUserEmail(userEmail: $userEmail)
    }
`

interface Props {
    Component: FC & { getLayout: (content: React.ReactNode) => React.ReactNode }
    pageProps: any
    usertype: string
}

const MyApp: FC<Props> = ({ Component, pageProps, usertype }) => {
    const apolloClient = useApollo(pageProps.initialApolloState)
    if (Component.getLayout) {
        return (
            <ApolloProvider client={apolloClient}>
                <LayoutProvider>
                    {Component.getLayout(<Component {...pageProps} />)}
                </LayoutProvider>
            </ApolloProvider>
        )
    } else {
        return (
            <ApolloProvider client={apolloClient}>
                <LayoutProvider>
                    <Layout Component {...pageProps} usertype={'usertype'}>
                        <Component {...pageProps} />
                    </Layout>
                </LayoutProvider>
            </ApolloProvider>
        )
    }
}

export default MyApp

export const getServerSideProps: GetServerSideProps = requireAuthentication(
    async (ctx) => {
        const { req } = ctx
        console.log(ctx)
        if (req.headers.cookie) {
            const tokens = req.headers.cookie.split(';')
            const token = tokens.find((token) => token.includes('access_token'))
            let userData = ''
            if (token) {
                const userEmail = jwt
                    .decode(tokens[1].split('=')[1].toString())
                    .email.toString()
                await apolloClient
                    .query({
                        query: GET_USER_DATA,
                        variables: { userEmail },
                    })
                    .then((result) => {
                        userData = result.data.GetUserDataByUserEmail
                        console.log('This is user type', result.data)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
            return {
                props: { userType: userData?.type },
            }
        }
    }
)
