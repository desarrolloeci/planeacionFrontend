import { listClasses } from '@mui/material/List';



const MuiPopover = {
  
  styleOverrides: {
    paper: ({ theme }) => ({
      ...theme.mixins.paperStyles(theme, { dropdown: true }),
      [`& .${listClasses.root}`]: { paddingTop: 0, paddingBottom: 0 },
    }),
  },
};



export const popover = { MuiPopover };
