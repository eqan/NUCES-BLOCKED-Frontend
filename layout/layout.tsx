import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEventListener, useUnmountEffect } from 'primereact/hooks';
import { classNames, DomHandler } from 'primereact/utils';
import React, { useContext, useEffect, useRef } from 'react';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { LayoutContext, LayoutContextValue } from './context/layoutcontext';
import PrimeReact from 'primereact/api';

interface Props {
  children: React.ReactNode;
  userType: string | null;
}
interface ButtonMenu {
  menubutton: HTMLButtonElement;
  topbarmenu: HTMLDivElement;
  topbarmenubutton: HTMLButtonElement;
}

const Layout: React.FC<Props> = (props) => {
  const { layoutConfig, layoutState, setLayoutState } = useContext(
    LayoutContext,
  ) as LayoutContextValue;
  const contextPath = getConfig().publicRuntimeConfig.contextPath;
  const router = useRouter();
  const topbarRef = useRef<ButtonMenu>();
  const topbarmenubuttonRef1 = useRef<HTMLButtonElement>(null);
  const topbarmenubuttonRef2 = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLInputElement>(null);
  const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] =
    useEventListener({
      type: 'click',
      listener: (event) => {
        if (topbarRef.current && sidebarRef.current) {
          const isOutsideClicked = !(
            sidebarRef.current.isSameNode(event.target as HTMLInputElement) ||
            sidebarRef.current.contains(event.target as HTMLInputElement) ||
            topbarRef.current.menubutton.isSameNode(
              event.target as HTMLButtonElement,
            ) ||
            topbarRef.current.menubutton.contains(
              event.target as HTMLButtonElement,
            )
          );

          if (isOutsideClicked) {
            hideMenu();
          }
        }
      },
    });

  const [
    bindProfileMenuOutsideClickListener,
    unbindProfileMenuOutsideClickListener,
  ] = useEventListener({
    type: 'click',
    listener: (event) => {
      if (topbarRef.current) {
        const isOutsideClicked = !(
          topbarRef.current.topbarmenu.isSameNode(
            event.target as HTMLDivElement,
          ) ||
          topbarRef.current.topbarmenu.contains(
            event.target as HTMLDivElement,
          ) ||
          topbarRef.current.topbarmenubutton.isSameNode(
            event.target as HTMLButtonElement,
          ) ||
          topbarRef.current.topbarmenubutton.contains(
            event.target as HTMLButtonElement,
          )
        );

        if (isOutsideClicked) {
          hideProfileMenu();
        }
      }
    },
  });

  const hideMenu = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    unbindMenuOutsideClickListener();
    unblockBodyScroll();
  };

  const hideProfileMenu = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      profileSidebarVisible: false,
    }));
    unbindProfileMenuOutsideClickListener();
  };

  const blockBodyScroll = (element = document.body) => {
    DomHandler.addClass(element, 'blocked-scroll');
  };

  const unblockBodyScroll = (element = document.body) => {
    DomHandler.removeClass(element, 'blocked-scroll');
  };

  useEffect(() => {
    if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
      bindMenuOutsideClickListener();
    }

    layoutState.staticMenuMobileActive && blockBodyScroll();
  }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

  useEffect(() => {
    if (layoutState.profileSidebarVisible) {
      bindProfileMenuOutsideClickListener();
    }
  }, [layoutState.profileSidebarVisible]);

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      hideMenu();
      hideProfileMenu();
    });
  }, []);

  PrimeReact.ripple = false;

  useUnmountEffect(() => {
    unbindMenuOutsideClickListener();
    unbindProfileMenuOutsideClickListener();
  });

  const containerClass = classNames('layout-wrapper', {
    'layout-theme-light': layoutConfig.colorScheme === 'light',
    'layout-theme-dark': layoutConfig.colorScheme === 'dark',
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive':
      layoutState.staticMenuDesktopInactive &&
      layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
    'p-input-filled': layoutConfig.inputStyle === 'filled',
    'p-ripple-disabled': !layoutConfig.ripple,
  });

  return (
    <React.Fragment>
      <Head>
        <title>NUCES BLOCKED</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta property="og:type" content="website"></meta>
        <meta property="og:title" content="NUCES BLOCKED"></meta>
        <meta property="og:description" content="" />
        <meta
          property="og:image"
          content="https://live.staticflickr.com/65535/52701824785_51bdbe03fd_h.jpg"
        ></meta>
        <meta property="og:ttl" content="604800"></meta>
        <link
          rel="icon"
          href={`${contextPath}/logo.png`}
          type="image/x-icon"
        ></link>
      </Head>

      <div className={containerClass}>
        <AppTopbar
          ref={topbarRef}
          menubuttonRef={topbarmenubuttonRef1}
          topbarmenuRef={topbarmenubuttonRef2}
          topbarmenubuttonRef={topbarmenubuttonRef1}
          selectedTheme={layoutConfig.theme}
          onThemeChange={null}
          toggleMenu={null}
          changeTheme={null}
          menu={null}
          replaceLink={null}
          applyScale={null}
        />
        <div ref={sidebarRef} className="layout-sidebar">
          <AppSidebar userType={props.userType} />
        </div>
        <div className="layout-main-container">
          <div className="layout-main">{props.children}</div>
          <AppFooter />
        </div>
        <div className="layout-mask"></div>
      </div>
    </React.Fragment>
  );
};

export default Layout;
