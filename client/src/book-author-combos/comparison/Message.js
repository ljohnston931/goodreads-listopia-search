import React, { useEffect, useState } from "react";
const Message = (props) => {
  const INTERVAL_BETWEEN_LOADING_STATEMENTS = 2000;
  const [timeSpentLoading, setTimeSpentLoading] = useState(0);

  const getLoadingMessage = () => {
    console.log("recalculating");
    let message = "Scraping Goodreads for lists";
    const intervals = Math.round(
      timeSpentLoading / INTERVAL_BETWEEN_LOADING_STATEMENTS
    );
    console.log("intervals", intervals);
    for (var i = 0; i < intervals; i++) {
      message += " .";
    }
    return message;
  };

  useEffect(() => {
    if (!props.numOfResults && !props.error && props.loadingStartTime) {
      const interval = setInterval(() => {
        setTimeSpentLoading(new Date() - props.loadingStartTime);
      }, INTERVAL_BETWEEN_LOADING_STATEMENTS);
      return () => clearInterval(interval);
    }
  }, [props.numOfResults, props.error, props.loadingStartTime]);
  console.log("render message", timeSpentLoading);

  if (!props.numOfResults) {
    if (props.error) {
      return <div>Error encountered. (Please contact Lucy)</div>;
    } else if (props.loadingStartTime) {
      return <div>{getLoadingMessage()}</div>;
    } else {
      return <div>No lists found.</div>;
    }
  } else {
    return null;
  }
};

export default Message;
