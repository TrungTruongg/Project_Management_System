import { Close, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useSearch } from "./context/SearchContext";

function SearchInput() {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <TextField
      placeholder="Search"
      autoComplete="off"
      name="search"
      variant="outlined"
      size="small"
      onChange={(e) => setSearchTerm(e.target.value)}
      value={searchTerm}
      sx={{
        width: 350,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          "& fieldset": {
            borderColor: (theme) =>
              theme.palette.mode === "light" ? "#e0e0e0" : "#444",
          },

          "&:hover fieldset": {
            borderColor: (theme) =>
              theme.palette.mode === "light" ? "#f0f0f0" : "#2a2a2a",
          },

          "&.Mui-focused fieldset": {
            borderColor: (theme) =>
              theme.palette.mode === "light" ? "#f0f0f0" : "#2a2a2a",
          },
        },

      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchTerm("")}>
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default SearchInput;
