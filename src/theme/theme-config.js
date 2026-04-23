export const themeConfig = {
  
  direction: 'ltr',
  defaultMode: 'light',
  modeStorageKey: 'theme-mode',
  classesPrefix: 'minimal',
  
  fontFamily: {
    primary: 'Monserrat',
    secondary: 'Barlow',
  },
  
  palette: {
    primary: {
      lighter: '#FFEBEB',
      light: '#FFC6C6',
      main: '#990000',
      dark: '#AD0000',
      darker: '#AD0000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#0083A9',
      light: '#0083A9',
      main: '#0083A9',
      dark: '#0083A9',
      darker: '#0083A9',
      contrastText: '#FFFFFF',
    },
    notify: {
      lighter: '#FF4469',
      light: '#FF4469',
      main: '#FF4469',
      dark: '#FF4469',
      darker: '#FF4469',
      contrastText: '#FF4469',
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#6FD556',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#ECA43B',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FCFDFD',
      100: '#F9FAFB',
      200: '#F4F6F8',
      300: '#DFE3E8',
      400: '#C4CDD5',
      500: '#919EAB',
      600: '#637381',
      700: '#454F5B',
      800: '#1C252E',
      900: '#141A21',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
