import getConfig from 'next/config'
import * as React from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import apolloClient from '../apollo-client'
import jwt from 'jsonwebtoken'
import { GET_USER_DATA } from '../queries/users/getUser'
import { DocumentContext, DocumentInitialProps } from 'next/document'

interface Props {
    userType: string | null
    userEmail: string | null
    userName: string | null
    userimg: string | null
}

class MyDocument extends Document<Props> {
    static async getInitialProps(ctx: DocumentContext): Promise<any> {
        let userData: any = null
        const { req } = ctx
        try {
            if (req.headers.cookie) {
                const tokens = req.headers.cookie.split(';')
                const token = tokens.find((token) =>
                    token.includes('access_token')
                )
                if (token) {
                    const userEmail = jwt.decode(
                        token.split('=')[1]?.toString()
                    )['email']
                    await apolloClient
                        .query({
                            query: GET_USER_DATA,
                            variables: { userEmail },
                        })
                        .then((result: any) => {
                            userData = result.data.GetUserDataByUserEmail
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                }
            }
        } catch (error) {
            console.log(error)
        }
        let initialProps = {}
        try {
            initialProps = await Document.getInitialProps(ctx)
        } catch (error) {
            console.log(error)
        }
        return {
            ...initialProps,
            props: {
                userData,
                type: userData?.type,
                name: userData?.name,
                email: userData?.email,
                imgUrl: userData?.imgUrl,
            },
        }
    }

    render() {
        const contextPath = getConfig().publicRuntimeConfig.contextPath

        return (
            <Html lang="en">
                <Head>
                    <link
                        id="theme-css"
                        href={`${contextPath}/themes/saga-blue/theme.css`}
                        rel="stylesheet"
                    />
                    <link
                        href="https://fonts.googleapis.com/icon?family=Material+Icons"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
