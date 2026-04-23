import { useEffect, useCallback } from 'react';
import { usePopoverHover } from 'minimal-shared/hooks';
import { isActiveLink, isExternalLink } from 'minimal-shared/utils';

import { useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../styles';
import { NavUl, NavLi, NavDropdown, NavDropdownPaper } from '../components';



export function NavList({
  data,
  depth,
  render,
  cssVars,
  slotProps,
  currentRole,
  enabledRootRedirect,
}) {
  const theme = useTheme();

  const pathname = usePathname();

  const isActive = isActiveLink(pathname, data.path, !!data.children);

  const { open, onOpen, onClose, anchorEl, elementRef: navItemRef } = usePopoverHover();

  const isRtl = theme.direction === 'rtl';
  const id = open ? `${data.title}-popover` : undefined;

  useEffect(() => {
    
    if (open) {
      onClose();
    }
    
  }, [pathname]);

  const handleOpenMenu = useCallback(() => {
    if (data.children) {
      onOpen();
    }
  }, [data.children, onOpen]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      aria-describedby={id}
      
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      
      active={isActive}
      open={open}
      disabled={data.disabled}
      
      depth={depth}
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      
      onMouseEnter={handleOpenMenu}
      onMouseLeave={onClose}
    />
  );

  const renderDropdown = () =>
    !!data.children && (
      <NavDropdown
        disableScrollLock
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'center', horizontal: isRtl ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: isRtl ? 'right' : 'left' }}
        slotProps={{
          paper: {
            onMouseEnter: handleOpenMenu,
            onMouseLeave: onClose,
            className: navSectionClasses.dropdown.root,
          },
        }}
        sx={{ ...cssVars }}
      >
        <NavDropdownPaper
          className={navSectionClasses.dropdown.paper}
          sx={slotProps?.dropdown?.paper}
        >
          <NavSubList
            data={data.children}
            depth={depth}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            currentRole={currentRole}
            enabledRootRedirect={enabledRootRedirect}
          />
        </NavDropdownPaper>
      </NavDropdown>
    );

  
  if (data.roles && currentRole && !data.roles.includes(currentRole)) {
    return null;
  }

  return (
    <NavLi disabled={data.disabled}>
      {renderNavItem()}
      {}
      {open && renderDropdown()}
    </NavLi>
  );
}



function NavSubList({
  data,
  render,
  cssVars,
  depth = 0,
  slotProps,
  currentRole,
  enabledRootRedirect,
}) {
  return (
    <NavUl sx={{ gap: 0.5 }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          cssVars={cssVars}
          slotProps={slotProps}
          currentRole={currentRole}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
