const MuiListItemIcon = {
  
  styleOverrides: {
    root: ({ theme }) => ({ color: 'inherit', minWidth: 'auto', marginRight: theme.spacing(2) }),
  },
};



const MuiListItemAvatar = {
  
  styleOverrides: { root: ({ theme }) => ({ minWidth: 'auto', marginRight: theme.spacing(2) }) },
};



const MuiListItemText = {
  
  defaultProps: {
    slotProps: {
      primary: { typography: 'subtitle2' },
      secondary: { component: 'span' },
    },
  },

  
  styleOverrides: { root: { margin: 0 }, multiline: { margin: 0 } },
};



export const list = { MuiListItemIcon, MuiListItemAvatar, MuiListItemText };
