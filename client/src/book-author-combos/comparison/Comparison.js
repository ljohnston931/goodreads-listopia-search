import React, { useEffect, useState } from "react";
import axios from "axios";
import "./comparison.css";

const Comparison = (props) => {
  const [listsInCommon, setListsInCommon] = useState([]);
  const [loading, setLoading] = useState(true);
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
        return `Books by ${queryBook.authorName}`;
      }
    });
    return `Lists that contain ${listToString(titleAuthorStrings)}`;
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
    console.log(listsInCommon);
  }, [listsInCommon]);

  useEffect(() => {
    setLoading(true);
    getListsInCommon()
      .then((newListsInCommon) => {
        setListsInCommon(newListsInCommon);
      })
      .catch((error) => {
        setError(true);
      })
      .then(() => {
        setLoading(false);
      });
  }, [props.bookAuthorCombo]);

  return (
    <section id="comparison">
      <div className="comparison-header">
        {createHeader(props.bookAuthorCombo)}
      </div>

      {loading && <div>Loading ... </div>}
      {error && <div>Error encountered (Contact Lucy) </div>}
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
