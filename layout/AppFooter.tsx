import getConfig from 'next/config';
import React, { useContext } from 'react';
import { LayoutContext, LayoutContextValue } from './context/layoutcontext';

const AppFooter: React.FC = () => {
  const context = useContext(LayoutContext) as LayoutContextValue;
  const contextPath = getConfig().publicRuntimeConfig.contextPath;

  return (
    <div className="layout-footer">
      <img
        src={`${contextPath}/layout/images/logo-${context.layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`}
        alt="Logo"
        height={20}
        className="mr-2"
      />

      <span className="font-medium ml-2">NUCES BLOCKED ©️ BLOCKED Devs</span>
    </div>
  );
};

export default AppFooter;
