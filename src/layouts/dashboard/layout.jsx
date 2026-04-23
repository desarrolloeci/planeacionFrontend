import { useEffect } from 'react';
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';
import { InteractionType } from '@azure/msal-browser';
import { AuthenticatedTemplate, useMsalAuthentication } from '@azure/msal-react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { _contacts, _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const request = { scopes: ['User.Read'] };
  const { login, error } = useMsalAuthentication(InteractionType.Silent, request);

  useEffect(() => {
    if (error) login(InteractionType.Redirect, request);
  }, [error]);

  const theme = useTheme();
  const settings = useSettingsContext();
  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);
  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const renderHeader = () => {
    const headerSlots = {
      bottomArea: isNavHorizontal ? (
        <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navVars.section} />
      ) : null,
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', height: 10 }}>
          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(
          {
            container: {
              maxWidth: false,
              sx: {
                ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
                ...(isNavHorizontal && {
                  bgcolor: 'var(--layout-nav-bg)',
                  height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
                  [`& .${iconButtonClasses.root}`]: {
                    color: 'var(--layout-nav-text-secondary-color)',
                  },
                }),
              },
            },
          },
          slotProps?.header?.slotProps ?? {}
        )}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  return (
    <AuthenticatedTemplate>
      <LayoutSection
        headerSection={renderHeader()}
        sidebarSection={isNavHorizontal ? null : renderSidebar()}
        cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
        sx={[
          {
            position: 'relative',
            overflow: 'visible', 
            [`& .${layoutClasses.sidebarContainer}`]: {
              [theme.breakpoints.up(layoutQuery)]: {
                pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
                transition: theme.transitions.create(['padding-left'], {
                  easing: 'var(--layout-transition-easing)',
                  duration: 'var(--layout-transition-duration)',
                }),
              },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <MainSection>{children}</MainSection>
      </LayoutSection>
    </AuthenticatedTemplate>
  );
}
