import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { gql } from '@apollo/client';
import apolloClient from '../../apollo-client';
import jwt from 'jsonwebtoken';

const GET_USER_TYPE = gql`
  query GetUserTypeByUserEmail($userEmail: String!) {
    GetUserTypeByUserEmail(userEmail: $userEmail)
  }
`;

export const requireAuthentication = (gssp: GetServerSideProps) => async (
  ctx: GetServerSidePropsContext
) => {
  try {
    const { req } = ctx;
    const token = req.headers.cookie?.split(';').find((cookie) => cookie.includes('access_token'));

    if (!token) {
      return {
        redirect: {
          permanent: false,
          destination: '/auth/login',
        },
      };
    }

    const userEmail = jwt.decode(token.split('=')[1])?.email?.toString();

    if (!userEmail) {
      return {
        redirect: {
          permanent: false,
          destination: '/auth/login',
        },
      };
    }

    const { data } = await apolloClient.query({
      query: GET_USER_TYPE,
      variables: { userEmail },
    });

    console.log(data.GetUserTypeByUserEmail);

    return gssp(ctx);
  } catch (error) {
    console.log(error);

    return {
      redirect: {
        permanent: false,
        destination: '/auth/login',
      },
    };
  }
};
