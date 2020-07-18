import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const App = () => {
  const [display, setDisplay] = useState("");

  const getResponse = () => {
    axios
      .get("/api/lists/in-common")
      .then((resp) => setDisplay(resp.data))
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getResponse();
  }, []);

  return (
    <div className="App">
      <div>
        <p>{JSON.stringify(display)}</p>
        <button onClick={getResponse}>Get More</button>
      </div>
    </div>
  );
};

export default App;
