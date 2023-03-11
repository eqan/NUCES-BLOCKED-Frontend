import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import jwt from 'jsonwebtoken'

export function requireAuthentication(gssp: GetServerSideProps) {
    return async (ctx: GetServerSidePropsContext) => {
        const { req } = ctx
        if (req.headers.cookie) {
            const tokens = req.headers.cookie.split(';')
            const token = tokens.find((token) => token.includes('access_token'))
            //console.log(token)
            const expiryDate = jwt.decode(
                tokens[1]?.split('=')[1].toString()
            )?.exp
            const validateToken = Date.now() <= expiryDate * 1000
            if (!token || !validateToken) {
                return {
                    redirect: {
                        permanent: false,
                        destination: '/auth/login',
                    },
                }
            }
        }
        return await gssp(ctx)
    }
}
