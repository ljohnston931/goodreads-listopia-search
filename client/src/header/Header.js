import React from "react";
import Search from "./search/Search";
import "./header.css";

const Header = (props) => {
  return (
    <section id="header">
      <div className="title">Goodreads Analyzer</div>
      <Search {...props} />
    </section>
  );
};

export default Header;
