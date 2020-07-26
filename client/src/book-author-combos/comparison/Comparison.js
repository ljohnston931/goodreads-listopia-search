import React, { useEffect, useState } from "react";
import axios from "axios";
import Message from "./Message";
import "./comparison.css";

const Comparison = (props) => {
  const [listsInCommon, setListsInCommon] = useState([]);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [error, setError] = useState(false);

  const listToString = (list) => {
    if (list.length === 0) {
      return "";
    }
    if (list.length === 1) {
      return list[0];
    }
    if (list.length === 2) {
      return `${list[0]} and ${list[1]}`;
    }
    const itemsExceptLast = list.slice(0, -1).join(", ");
    return `${itemsExceptLast}, and ${list[list.length - 1]}`;
  };

  const createHeader = (bookAuthorCombo) => {
    const titleAuthorStrings = bookAuthorCombo.map((queryBook) => {
      if (queryBook.bookId) {
        return queryBook.title;
      } else {
        return `a book by ${queryBook.authorName}`;
      }
    });
    const lengthString = listsInCommon.length
      ? `(${listsInCommon.length})`
      : "";
    return `Lists that contain ${listToString(
      titleAuthorStrings
    )} ${lengthString}`;
  };

  const getListsInCommon = async () => {
    const bookIds = props.bookAuthorCombo
      .map((book) => book.bookId)
      .filter((id) => id);
    const authorIds = props.bookAuthorCombo
      .map((book) => book.authorId)
      .filter((id) => id);
    const resp = await axios.post("/api/lists/in-common", {
      bookIds: bookIds,
      authorIds: authorIds,
    });
    return resp.data;
  };

  useEffect(() => {
    setLoadingStartTime(new Date());
    setError(false);
    setListsInCommon([]);

    getListsInCommon()
      .then((newListsInCommon) => {
        setListsInCommon(newListsInCommon);
      })
      .catch((error) => {
        setError(error);
      });
  }, [props.bookAuthorCombo]);

  console.log("render comparison");
  return (
    <section id="comparison">
      <div className="comparison-header">
        {createHeader(props.bookAuthorCombo)}
      </div>
      <Message
        loadingStartTime={loadingStartTime}
        error={error}
        numOfResults={listsInCommon.length}
      />
      <div className="results">
        {listsInCommon.map((list) => (
          <div key={list.href}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.goodreads.com/${list.href}`}
            >
              {list.title}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Comparison;
