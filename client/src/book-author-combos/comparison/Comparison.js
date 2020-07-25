import React, { useEffect, useState } from "react";
import axios from "axios";
import Message from "./Message";
import "./comparison.css";

const Comparison = (props) => {
  const [listsInCommon, setListsInCommon] = useState([]);
  const [loading, setLoading] = useState(true);
  let message = "";

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
    setLoading(true);
    setListsInCommon([]);

    getListsInCommon()
      .then((newListsInCommon) => {
        if (newListsInCommon.length === 0) {
          message = "No lists found";
        } else {
          message = "";
        }
        setListsInCommon(newListsInCommon);
      })
      .catch((error) => {
        message = "Error encountered (Contact Lucy)";
      })
      .then(() => {
        setLoading(false);
      });
  }, [props.bookAuthorCombo]);

  useEffect(() => {
    if (loading) {
      message = "Scraping from Goodreads ... ";

      const interval = setInterval(() => {
        //console.log(message, message + "\nStill scraping ...");
        message += "\nStill scraping ...";
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <section id="comparison">
      <div className="comparison-header">
        {createHeader(props.bookAuthorCombo)}
      </div>
      <Message message={message} />
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
