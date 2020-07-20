import React, { Component, useState } from "react";

import AsyncSelect from "react-select/async";
import axios from "axios";

const Search = (props) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleSelected = (option) => {
    console.log(option);
  };

  const getMatchingBooks = async (query) => {
    const resp = await axios.get("/api/books", { params: { q: query } });
    return resp.data;
  };

  return (
    <AsyncSelect
      isMulti
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loadOptions={getMatchingBooks}
      noOptionsMessage={() => null}
      placeholder={"Search for book/author/ISBN ..."}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      onChange={handleSelected}
    />
  );
};

export default Search;
