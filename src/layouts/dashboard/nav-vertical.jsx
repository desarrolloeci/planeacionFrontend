import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import VerticalNavMenu from './VerticalNavMenu';
import { layoutClasses } from '../core/classes';
import { NavToggleButton } from '../components/nav-toggle-button';

export function NavVertical({ sx, data, slots, className, isNavMini, onToggleNav, layoutQuery = 'md', ...other }) {
  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <img alt="Full logo" src={`${CONFIG.assetsDir}/logo/logo-full.jpg`} width="100" height="100" />
        </Box>
      )}
      <Scrollbar fillContent>
        <VerticalNavMenu navData={data} />
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
          <Logo />
        </Box>
      )}
      <Box sx={{ position: 'relative', flex: 1 }}>
        <VerticalNavMenu isMini navData={data} />
      </Box>
    </>
  );

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      {...other}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        sx={[
          (theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

const NavRoot = styled('div', {
  shouldForwardProp: (prop) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})(({ isNavMini, layoutQuery = 'md', theme }) => ({
  top: 0,
  left: 0,
  height: '100%',
  display: 'none',
  position: 'fixed',
  flexDirection: 'column',
  zIndex: 1200, 
  backgroundColor: 'var(--layout-nav-bg)',
  width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
  borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
  transition: theme.transitions.create(['width'], {
    easing: 'var(--layout-transition-easing)',
    duration: 'var(--layout-transition-duration)',
  }),
  overflow: 'visible', 
  [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
}));
