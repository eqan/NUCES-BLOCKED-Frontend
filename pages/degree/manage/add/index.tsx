import React, { useState, useEffect, useRef } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { GetServerSideProps } from 'next';
import { requireAuthentication } from '../../../../layout/context/requireAuthetication';
import { gql } from '@apollo/client';
import apolloClient from '../../../../apollo-client';
import jwt from 'jsonwebtoken';

const GET_USER_TYPE = gql`
  query ($userEmail: String!) {
    GetUserTypeByUserEmail(userEmail: $userEmail)
  }
`;

interface Props {
  userType: String;
}

const MiscDemo: React.FC<Props> = (userType) => {
  const [value, setValue] = useState<number>(0);
  const toast = useRef<Toast | null>(null);
  const interval = useRef<any | null | undefined>(null);

  useEffect(() => {
    let val = value;
    interval.current = setInterval(() => {
      val += Math.floor(Math.random() * 50) + 1;

      if (val >= 100) {
        val = 100;
        if (toast.current)
          toast.current.show({
            severity: 'info',
            summary: 'Success',
            detail: 'Process Completed',
          });
        if (interval.current) clearInterval(interval.current);
      }
      setValue(val);
    }, 2000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [value]);

  return (
    <div>
      <Toast ref={toast}></Toast>

      <div className="card">
        <h5>Collecting Data and Self-Generating Certifcate</h5>
        <ProgressBar style={{ height: 20 }} value={value}></ProgressBar>
      </div>
    </div>
  );
};

export default MiscDemo;
export const getServerSideProps: GetServerSideProps = requireAuthentication(
  async (ctx) => {
    const { req } = ctx;
    if (req.headers.cookie) {
      const tokens = req.headers.cookie.split(';');
      const token = tokens.find((token) => token.includes('access_token'));
      let userType = '';
      if (token) {
        const userEmail = jwt
          .decode(tokens[1].split('=')[1].toString())
          .email.toString();
        await apolloClient
          .query({
            query: GET_USER_TYPE,
            variables: { userEmail },
          })
          .then((result) => {
            userType = result.data.GetUserTypeByUserEmail.toString();
          });
      }
      return {
        props: { userType },
      };
    }
  },
);
