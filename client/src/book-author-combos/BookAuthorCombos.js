import React, { useEffect, useState } from "react";
import Comparison from "./comparison/Comparison";
import "./book-author-combos.css";

const BookAuthorCombos = (props) => {
  const getBookAuthorCombos = (queryBooks) =>
    queryBooks.reduce((combos, book) => {
      const bookInfo = { bookId: book.bookId, title: book.title };
      const authorInfo = {
        authorId: book.author.id,
        authorName: book.author.name,
      };

      let previousCombos = combos.map((combo) => combo);
      if (previousCombos.length) {
        const combosWithNewBookInfo = previousCombos.map((combo) =>
          combo.concat(bookInfo)
        );
        const combosWithNewAuthorInfo = previousCombos.map((combo) =>
          combo.concat(authorInfo)
        );

        combos = combosWithNewBookInfo.concat(combosWithNewAuthorInfo);
      } else {
        combos = [[bookInfo], [authorInfo]];
      }
      return combos;
    }, []);

  return (
    <section id="book-author-combos">
      {getBookAuthorCombos(props.queryBooks).map((bookAuthorCombo) => (
        <Comparison
          key={JSON.stringify(bookAuthorCombo)}
          bookAuthorCombo={bookAuthorCombo}
        />
      ))}
    </section>
  );
};

export default BookAuthorCombos;
