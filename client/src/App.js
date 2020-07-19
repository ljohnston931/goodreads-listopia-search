import React, { useState } from "react";
import Header from "./header/Header";
import "./App.css";
import BookAuthorCombos from "./book-author-combos/BookAuthorCombos";

const App = () => {
  const theIdiot = {
    bookId: 30962053,
    title: "The Idiot",
    authorId: 39846,
    authorName: "Elif Batuman",
  };
  const deathlyHallows = 136251;
  const infiniteJest = {
    bookId: 6759,
    title: "Infinite Jest",
    authorId: 4339,
    authorName: "David Foster Wallace",
  };
  const [queryBooks, setQueryBooks] = useState([theIdiot, infiniteJest]);

  return (
    <div className="App">
      <Header />
      <BookAuthorCombos queryBooks={queryBooks} />
    </div>
  );
};

export default App;
