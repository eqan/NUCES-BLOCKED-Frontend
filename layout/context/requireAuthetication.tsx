import { GetServerSideProps, GetServerSidePropsContext} from 'next';
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
        }
        return await gssp(ctx);
    };
}