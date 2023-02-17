import { GetServerSideProps, GetServerSidePropsContext} from 'next';
import{Cookies} from 'js-cookie';

export function requireAuthentication(gssp: GetServerSideProps){
    return async (ctx: GetServerSidePropsContext)=>{
        //console.log(Cookies.get('access_token'));
        const access_token='';
        if(!access_token){
            return{
                redirect:{
                    permanent:false,
                    destination:'/auth/login',
                },
            };
        }
        return await gssp(ctx);
    };
}