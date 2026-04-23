import { useBoolean } from 'minimal-shared/hooks';
import { useRef, useEffect, useCallback } from 'react';
import { isActiveLink, isExternalLink } from 'minimal-shared/utils';

import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';

import { Scrollbar } from 'src/components/scrollbar';

import { Nav, NavUl, NavLi, NavItem, NavSubList, NavDrawerHeader } from '../components';



export function NavList({ data, render, cssVars, slotProps, onCloseDrawerRoot }) {
  const pathname = usePathname();
  const navItemRef = useRef(null);

  const isActive = isActiveLink(pathname, data.path, !!data.children);
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  useEffect(() => {
    
    if (open) {
      onClose();
    }
    
  }, [pathname]);

  useEffect(() => {
    
    if (!!data.children && isActive) {
      onOpen();
    }
    
  }, []);

  const handleOpenSubDrawer = useCallback(() => {
    if (data.children) {
      onOpen();
    }
  }, [data.children, onOpen]);

  const handleCloseSubDrawer = useCallback(() => {
    onClose();
    onCloseDrawerRoot();
  }, [onClose, onCloseDrawerRoot]);

  const handleBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      
      open={open}
      active={isActive}
      disabled={data.disabled}
      
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      
      slotProps={slotProps?.rootItem}
      
      onClick={handleOpenSubDrawer}
    />
  );

  const renderDrawer = () =>
    !!data.children && (
      <Drawer
        open={open}
        onClose={handleCloseSubDrawer}
        slotProps={{ backdrop: { invisible: true } }}
        sx={{
          ...cssVars,
          [`& .${drawerClasses.paper}`]: {
            display: 'flex',
            flexDirection: 'column',
            width: 'calc(var(--nav-width) - 8px)',
          },
        }}
      >
        <NavDrawerHeader title={data.title} onBack={handleBack} />

        <Divider />

        <Scrollbar fillContent sx={{ p: 2 }}>
          <Nav>
            <NavUl sx={{ gap: 3 }}>
              <NavSubList data={data.children} slotProps={slotProps} />
            </NavUl>
          </Nav>
        </Scrollbar>
      </Drawer>
    );

  return (
    <NavLi disabled={data.disabled}>
      {renderNavItem()}
      {renderDrawer()}
    </NavLi>
  );
}
