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
            label: 'Home',
            icon: 'pi pi-home',
            onClick:'/'
        },
        {
            separator: true
        },
        {
            label: 'Log out',
            icon: 'pi pi-sign-out',
            href:'/auth/login'
          
          
        },
        
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
               

            <Link href="/">
                    <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
                <Menu ref={menu} model={overlayMenuItems} popup />
                <button type="button" className="p-link layout-topbar-button" onClick={toggleMenu}>
                    <Avatar image={`${contextPath}/demo/images/avatar/admin.png`} size="large" shape="circle"></Avatar> 
                    <span>Profile</span>
                </button>
                   

                
                
            </div>
        </div>
    );
});

export default AppTopbar;
