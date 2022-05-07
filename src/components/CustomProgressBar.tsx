import { createTheme, ThemeProvider } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import { PRIMARY_BLUE_COLOR } from "~/lib/constants";

export const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_BLUE_COLOR,
    },
  },
});

export const CustomProgressBar = () => {
  return (
    <ThemeProvider theme={theme}>
      <LinearProgress color="primary" />
    </ThemeProvider>
  );
};
