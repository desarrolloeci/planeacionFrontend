import 'src/global.css';

import { useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { usePathname } from 'src/routes/hooks';

import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider, LocalizationProvider } from 'src/locales';

import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { Snackbar } from './components/snackbar';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';

export function App({ pca }) {
  


  

  const router = createBrowserRouter([
    {

      errorElement: <ErrorBoundary />,
      children: routesSection,
    },
  ]);






  return (
    <MsalProvider instance={pca}>
      <HelmetProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <ThemeProvider
              noSsr
              defaultMode={themeConfig.defaultMode}
              modeStorageKey={themeConfig.modeStorageKey}
            >
              <Snackbar />
              <SettingsDrawer defaultSettings={defaultSettings} />

              <RouterProvider router={router} />

            </ThemeProvider>
          </LocalizationProvider>

        </SettingsProvider>
      </HelmetProvider>

    </MsalProvider>
  );
}
