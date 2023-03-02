import React from 'react';
import AppMenu from './AppMenu';

interface Props {
    userType:string|null;
}

const AppSidebar: React.FC<Props> = ({userType}) => {
    return (
    <AppMenu userType={userType}/>
    );
};

export default AppSidebar;

