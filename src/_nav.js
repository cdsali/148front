import React from 'react';
import CIcon from '@coreui/icons-react';
import {
  cilCash,
  cilGroup,
  cilVerticalAlignBottom,
  cilSettings,
  cilSpeedometer,
} from '@coreui/icons';
import { CNavItem } from '@coreui/react';

// 👇 Make this a function to always get latest localStorage values
const getNavItems = () => {
  const userRole = localStorage.getItem('userRole');

  const nav = [
    
  ];


  if (userRole !== 'cadre_commercial'){ nav.push({

    component: CNavItem,
    name: 'Tableau de bord',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: { color: 'info' },
  })}

  if (userRole === 'cadre_commercial') {
    nav.push({
      component: CNavItem,
      name: 'Souscripteurs',
      to: '/assign',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
      badge: { color: 'danger' },
    });
  }

  if (userRole === 'membre') {
    nav.push({
      component: CNavItem,
      name: 'Liste',
      to: '/liste_traite',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
      badge: { color: 'danger' },
    });
  }

  if (userRole === 'membre' || userRole === 'admin' || userRole === 'DG'  ) {
    nav.push({
      component: CNavItem,
      name: 'utilisateurs',
      to: '/session',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
      badge: { color: 'danger' },
    });
  }

  return nav;
};

export default getNavItems;
