import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [passwords, setPasswords] = useState([]);

  const getPasswords = () => {
    fetch("/api/passwords")
      .then((res) => res.json())
      .then((passwords) => setPasswords(passwords));
  };

  useEffect(() => {
    getPasswords();
  }, []);

  return (
    <div className="App">
      {passwords.length ? (
        <div>
          {passwords.map((password) => (
            <p key={password}>{password}</p>
          ))}
          <button onClick={getPasswords}>Get More</button>
        </div>
      ) : (
        <div>
          No passwords
          <button onClick={getPasswords}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default App;
