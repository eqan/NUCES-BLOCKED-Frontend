import getConfig from 'next/config';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { SpeedDial } from 'primereact/speeddial';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import Phone from 'mdi-material-ui/Phone'

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const menu = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const overlayMenuItems = [
        {
            label: 'Profile',
            icon: 'pi pi-user',
            onclick: '/users' 

        },
        {
            label: 'Log out',
            icon: () => (<Phone/>)
          
          
        },
        {
            separator: true
        },
        {
            label: 'Home',
            icon: 'pi pi-home'
        }
    ];
     
    const toggleMenu = (event) => {
        menu.current.toggle(event);
    };

    return (
        <div className="layout-topbar">
            <Link href="/">
                <a className="layout-topbar-logo">
                    <>
                        <img src={`${contextPath}/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} widt={'true'} alt="logo" />
                        <span>NUCES BLOCKED</span>
                    </>
                </a>
            </Link>


            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

    

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
               
                <Menu ref={menu} model={overlayMenuItems} popup />
                <button type="button" className="p-link layout-topbar-button" onClick={toggleMenu}>
                    <Avatar image={`${contextPath}/demo/images/avatar/asiyajavayant.png`} size="large" shape="circle"></Avatar> 
                    <span>Profile</span>
                </button>
                   

                
                <Link href="/documentation">
                    <button type="button" className="p-link layout-topbar-button">
                        <Phone/>
                        <span>Settings</span>
                    </button>
                </Link>
            </div>
        </div>
    );
});

export default AppTopbar;
