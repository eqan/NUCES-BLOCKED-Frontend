import getConfig from 'next/config';
import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import Phone from 'mdi-material-ui/Phone'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const model = [
        {
            
            items: [
                {
                    
                    label: 'Home Page',
                    icon: 'pi pi-fw pi-home',
                    to: '/'
                },
                {
                    label: 'User Profiles',
                    icon: 'pi pi-fw pi-users',
                    to: '/users'  
                },
                {
                    label: 'Students',
                    icon: 'pi pi-fw pi-users',
                    to: '/student'
                },
                {
                    label: 'Academic Profile',
                    icon: () => (<Phone/>),
                    to: '/academic'
                },
                {
                    label: 'Academic Certificates',
                    icon: 'pi pi-fw pi-users',
                    items: [
                        {
                            label: 'Add Academic Certificate',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/degree/manage/add'
                        },
                        {
                            label: 'Manage Academic Certificates',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/degree/manage'
                        },
                    ]
                },
                {
                    label: 'Semester Results',
                    icon: 'pi pi-fw pi-users',
                    to: '/results'
                },
                
            ]
        },
      
       
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
