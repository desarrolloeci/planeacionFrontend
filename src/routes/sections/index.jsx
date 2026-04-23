import { lazy } from 'react';
import { Navigate } from 'react-router';

import { Sesion } from 'src/pages/Sesion';
import { CONFIG } from 'src/global-config';
import { AuthSplitLayout } from 'src/layouts/auth-split';

import { dashboardRoutes } from './dashboard';




const Page404 = lazy(() => import('src/pages/error/404'));

export const routesSection = [
  {
    path: '/',
    element: <AuthSplitLayout slotProps={{
      section: { title: '' },
    }}><Sesion /></AuthSplitLayout>,
  },

  ...dashboardRoutes,


  
  { path: '*', element: <Page404 /> },
];
