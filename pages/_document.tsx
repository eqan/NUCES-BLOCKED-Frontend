import getConfig from 'next/config'
import * as React from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx: any) {
        const initialProps = await Document.getInitialProps(ctx).catch(
            (error) => {
                console.log(error)
            }
        )
        return { ...initialProps }
    }

    render() {
        const contextPath = getConfig().publicRuntimeConfig.contextPath

        return (
            <Html lang="en">
                <Head>
                    <link
                        id="theme-css"
                        href={`${contextPath}/themes/arya-blue/theme.css`}
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
