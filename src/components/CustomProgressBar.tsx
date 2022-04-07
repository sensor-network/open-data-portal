import { createTheme, ThemeProvider } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

const BLUE = "#185693";
export const theme = createTheme({
  palette: {
    primary: {
      main: BLUE,
    },
  },
});

export const CustomProgressBar = () => {
  return (
    <ThemeProvider theme={theme}>
      <LinearProgress color="primary"/>
    </ThemeProvider>
  );
};