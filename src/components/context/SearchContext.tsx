import { createContext, useContext, useState } from "react";

const SearchContext = createContext<any>(null);

export const SearchProvider = ({ children }: any) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);