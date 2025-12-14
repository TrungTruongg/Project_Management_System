import { Search } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";

function SearchInput() {
  return (
    <TextField
      placeholder="Search"
      autoComplete="off"
      name="search"
      variant="outlined"
      size="small"
      sx={{
        width: 400,
        bgcolor: "white",
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default SearchInput;
