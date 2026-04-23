import { createPortal } from 'react-dom';
import { getStorage } from 'minimal-shared/utils';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';

import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Typography,
    Divider,
    Tooltip,
    Paper,
} from '@mui/material';

const VerticalNavMenu = ({ navData, isMini = false }) => {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const itemRefs = useRef({});
    const rolesRaw = getStorage('rolesMaterial');
    const allowedTitles = useMemo(() => {
        try {
            return typeof rolesRaw === 'string' ? JSON.parse(rolesRaw) : (rolesRaw || []);
        } catch {
            return [];
        }
    }, [rolesRaw]);
    

    const filteredNavData = useMemo(() => {
        
        const normalize = (str) => str?.trim();

        function filterData(data, allowed) {
            const allowedNormalized = allowed.map(normalize);

            return data
                .map((section) => {
                    const filteredItems = section.items
                        .map((item) => {
                            const itemTitleNorm = normalize(item.title);

                            
                            if (item.children) {
                                const filteredChildren = item.children.filter((child) =>
                                    allowedNormalized.includes(normalize(child.title))
                                );

                                
                                if (filteredChildren.length > 0) {
                                    return { ...item, children: filteredChildren };
                                }

                                
                                
                                return null;
                            }

                            
                            return allowedNormalized.includes(itemTitleNorm) ? item : null;
                        })
                        .filter(Boolean); 

                    return { ...section, items: filteredItems };
                })
                .filter((section) => section.items.length > 0); 
        }

        return filterData(navData, allowedTitles);
    }, [navData, allowedTitles]);
    const isActive = (path) => location.pathname.startsWith(path);

    useEffect(() => {
        filteredNavData.forEach((section) =>
            section.items.forEach((item) => {
                if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
                    setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
                }
            })
        );
    }, [location.pathname, filteredNavData]);

    return (
        <List disablePadding sx={{ width: isMini ? 80 : 280, transition: 'width 0.3s ease', overflowX: 'hidden' }}>
            {filteredNavData.map((section, index) => (
                <div key={section.subheader || index}>
                    {!isMini && section.subheader && (
                        <Typography variant="subtitle2" sx={{ px: 2, py: 1, mt: 1, color: 'text.secondary' }}>
                            {section.subheader}
                        </Typography>
                    )}

                    {section.items.map((item) => {
                        const hasChildren = Boolean(item.children);
                        const isOpen = openMenus[item.title] || false;

                        const handleMouseEnter = () => {
                            if (isMini && hasChildren) setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
                        };
                        const handleMouseLeave = () => {
                            if (isMini && hasChildren) setOpenMenus((prev) => ({ ...prev, [item.title]: false }));
                        };

                        const ListContent = (
                            <ListItemButton
                                ref={(el) => (itemRefs.current[item.title] = el)}
                                component={!hasChildren ? RouterLink : 'div'}
                                to={!hasChildren ? item.path : undefined}
                                onClick={() => {
                                    if (!isMini && hasChildren) {
                                        setOpenMenus((prev) => {
                                            const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {});
                                            return { ...newState, [item.title]: !prev[item.title] };
                                        });
                                    }
                                }}
                                onMouseEnter={handleMouseEnter}
                                sx={{
                                    pl: isMini ? 1 : 2,
                                    justifyContent: isMini ? 'center' : 'flex-start',
                                    bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: isMini ? 'auto' : 40, justifyContent: 'center' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isMini && <ListItemText primary={item.title} />}
                                {!isMini && hasChildren &&
                                    (isOpen ? <ArrowUp2 size="20" color="#999" /> : <ArrowDown2 size="20" color="#999" />)}
                            </ListItemButton>
                        );

                        return (
                            <div key={item.title} style={{ position: 'relative' }} onMouseLeave={handleMouseLeave}>
                                {isMini ? <Tooltip title={item.title}>{ListContent}</Tooltip> : ListContent}

                                { }
                                {hasChildren && !isMini && (
                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                        <List disablePadding>
                                            {item.children.map((child) => (
                                                <ListItemButton
                                                    key={child.title}
                                                    component={RouterLink}
                                                    to={child.path}
                                                    sx={{
                                                        pl: 4,
                                                        bgcolor: isActive(child.path) ? 'action.selected' : 'transparent',
                                                    }}
                                                >
                                                    <ListItemText primary={child.title} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}

                                { }
                                {hasChildren && isMini && isOpen &&
                                    createPortal(
                                        <Paper
                                            elevation={4}
                                            sx={{
                                                position: 'fixed',
                                                top: itemRefs.current[item.title]?.getBoundingClientRect().top || 0,
                                                left: 80,
                                                minWidth: 200,
                                                zIndex: 3000,
                                                py: 1,
                                            }}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <List>
                                                {item.children.map((child) => (
                                                    <ListItemButton
                                                        key={child.title}
                                                        component={RouterLink}
                                                        to={child.path}
                                                        sx={{
                                                            pl: 2,
                                                            bgcolor: isActive(child.path) ? 'action.selected' : 'transparent',
                                                        }}
                                                    >
                                                        <ListItemText primary={child.title} />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Paper>,
                                        document.body
                                    )}
                            </div>
                        );
                    })}
                    {index !== filteredNavData.length - 1 && <Divider sx={{ my: 1 }} />}
                </div>
            ))}
        </List>
    );
};

export default VerticalNavMenu;
