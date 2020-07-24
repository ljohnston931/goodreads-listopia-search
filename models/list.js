module.exports = (sequelize, DataTypes) => {
  return sequelize.define("list", {
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listHref: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    listTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
