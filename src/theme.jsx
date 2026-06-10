import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // коричневый, ресторанный
    },
    secondary: {
      main: '#C49A6C', // золотистый
    },
    background: {
      default: '#FFF8F0', // тёплый фон
    },
  },
  typography: {
    fontFamily: '"Playfair Display", serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
});

export default theme;
