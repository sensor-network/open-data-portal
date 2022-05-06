import { Dispatch, SetStateAction, useState } from "react";
import {
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { Stack, Pagination, Button, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./CustomProgressBar";

const GridPagination: React.FC<{
  setPage: Dispatch<SetStateAction<number>>;
}> = ({ setPage }) => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const [textFieldValue, setTextFieldValue] = useState((page + 1).toString());
  const validateInput = () => {
    const value = parseInt(textFieldValue, 10);
    if (!isNaN(value) && value > 0) {
      setPage(value - 1);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      style={{
        width: "100%",
        right: 0,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <ThemeProvider theme={theme}>
        <Pagination
          color="primary"
          count={pageCount}
          page={page + 1}
          onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
        <TextField
          size="small"
          label="Page"
          value={textFieldValue}
          onChange={(e) => setTextFieldValue(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={validateInput}>
          Go To
        </Button>
      </ThemeProvider>
    </Stack>
  );
};

export default GridPagination;
