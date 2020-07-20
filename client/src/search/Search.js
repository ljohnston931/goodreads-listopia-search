import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import "./search.css";

const Search = (props) => {
  const DROPDOWN_LENGTH = 3;
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleSelected = async (options) => {
    if (!options) return;
    try {
      const resp = await axios.post("/api/books", {
        isbns: options.map((option) => {
          return {
            title: option.title,
            author: option.author,
          };
        }),
      });
      console.log("...", resp.data);
      props.setQueryBooks(resp.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getMatchingBooks = async (query) => {
    const resp = await axios.get("/api/books", { params: { q: query } });
    return resp.data.slice(0, DROPDOWN_LENGTH).map((book) => {
      return {
        label: `${book.title} by ${book.author}`,
        value: `${book.title} ${book.author}`,
        title: book.title,
        author: book.author,
      };
    });
  };

  return (
    <section id="search">
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
    </section>
  );
};

export default Search;
