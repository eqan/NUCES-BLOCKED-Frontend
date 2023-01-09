import React from 'react';
import { LayoutProvider } from '../layout/context/layoutcontext';
import Layout from '../layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useApollo } from '../apollo-client';
import { ApolloProvider } from '@apollo/client';

export default function MyApp({ Component, pageProps }) {
    const apolloClient = useApollo(pageProps.initialApolloState);
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
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </LayoutProvider>
            </ApolloProvider>

        );
    }
}
