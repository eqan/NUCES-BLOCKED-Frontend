import { GetServerSideProps, GetServerSidePropsContext} from 'next';
import { gql } from '@apollo/client';
import apolloClient from '../../apollo-client';
import jwt from 'jsonwebtoken';

const GET_USER_TYPE = gql`
query   ($userEmail: String!) {
    GetUserTypeByUserEmail (userEmail: $userEmail)
}`;

export function requireAuthentication(gssp: GetServerSideProps){
    return async (ctx: GetServerSidePropsContext)=>{
        const {req}=ctx;
        if(req.headers.cookie){
            const tokens=req.headers.cookie.split(';');
            const token=tokens.find((token)=>token.includes('access_token'));
            if(!token){
                return{
                    redirect:{
                        permanent:false,
                        destination:'/auth/login',
                    },
                };
            }
            else{  
                const userEmail=((jwt.decode((token.split('='))[1].toString())).email.toString());
                apolloClient.query({
                    query:GET_USER_TYPE,
                    variables:{userEmail},
                }).then((result)=>{
                    console.log(result.data.GetUserTypeByUserEmail);
                });
            }
        }
        return await gssp(ctx);
    };
}