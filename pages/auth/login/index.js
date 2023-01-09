import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import AppConfig from '../../../layout/AppConfig';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
const GET_ACCESS_TOKEN = gql`
mutation LoginUser ($email: String!, $password: String!){
    LoginUser(LoginUserInput: {
        email: $email,
        password: $password
    })
    {
        access_token
    }
}
`;


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', {'p-input-filled': layoutConfig.inputStyle === 'filled'});
    const [createAccessToken ,{loading, error, data }] = useMutation(GET_ACCESS_TOKEN);
    useEffect(() => {
        if(data)
        {
           console.log(data) 
        }
    })

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`${contextPath}/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0"/>
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 146, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Welcome to NUCES BLOCKED</div>
                            <span className="text-600 font-medium">Login to continue</span>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            console.log(email)
                            console.log(password)
                            createAccessToken({variables: {email: email, password: password}});
                        }}>
                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText inputid="email1" type="text" placeholder="Email address" onChange={(e) => setEmail(e.target.value)}className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <InputText inputid="password1" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password"  className="w-full mb-5" inputClassName='w-full p-3 md:w-30rem'></InputText>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputid="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">
                                        Remember me
                                    </label>
                                </div>
                                <a onClick={() => router.push('/auth/request')} className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button label="Login" className="w-full p-3 text-xl"></Button>
                        </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig simple />
        </React.Fragment>
    );
};
export default LoginPage;
