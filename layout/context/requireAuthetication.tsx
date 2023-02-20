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
        try{
            const {req}=ctx;
            if(req.headers.cookie){
                const tokens=req.headers.cookie.split(';');
                const token=tokens.find((token)=>token.includes('access_token'));
                let userEmail = "";
                if (tokens) {
                    userEmail=((jwt.decode((tokens[1].split('='))[1].toString())).email.toString());
                    }
                apolloClient.query({
                    query:GET_USER_TYPE,
                    variables: {userEmail},
                }).then((result)=>{
                    console.log(result.data.GetUserTypeByUserEmail);
                });
                if(!token){
                    return{
                        redirect:{
                            permanent:false,
                            destination:'/auth/login',
                        },
                    };
                }
            }
            else
            {
                return {
                  redirect: {
                    permanent: false,
                    destination: '/auth/login',
                  },
               };
            }
            return await gssp(ctx);
        }
        catch(error)
        {
            console.log(error);
            return {
              redirect: {
                permanent: false,
                destination: '/auth/login',
              },
           };
        }
    };
}