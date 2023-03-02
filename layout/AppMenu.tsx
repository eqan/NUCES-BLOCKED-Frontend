import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

interface Item {
  label: string;
  icon: string;
  to?: string;
  items?: Item[];
}

interface Props {
  userType: string;
}

const AppMenu: React.FC<Props> = (userType) => {
  const model: Item[] = [
    {
      label: '',
      icon: '',
      items: [
        {
          label: 'Home Page',
          icon: 'pi pi-fw pi-home',
          to: '/',
        },
        {
          label: 'User Profiles',
          icon: 'pi pi-fw pi-user',
          to: '/users',
        },
        {
          label: 'Students',
          icon: 'pi pi-fw pi-users',
          to: '/student',
        },
        {
          label: 'Academic Profile',
          icon: 'pi pi-fw pi-book',
          to: '/academic',
        },
        {
          label: 'Academic Certificates',
          icon: 'pi pi-fw pi-bookmark',
          items: [
            {
              label: 'Add Academic Certificate',
              icon: 'pi pi-fw pi-plus',
              to: '/degree/manage/add',
            },
            {
              label: 'Manage Academic Certificates',
              icon: 'pi pi-fw pi-pencil',
              to: '/degree/manage',
            },
          ],
        },
        {
          label: 'Semester Results',
          icon: 'pi pi-fw pi-chart-line',
          to: '/results',
        },
      ],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return (
            <AppMenuitem
              item={item}
              root={true}
              index={i}
              key={item.label}
              userType={userType['userType']}
            />
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
