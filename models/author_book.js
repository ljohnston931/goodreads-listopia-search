module.exports = (sequelize, DataTypes) => {
  return sequelize.define("author_book", {
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
