const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.books = require("./book")(sequelize, DataTypes);
db.lists = require("./list")(sequelize, DataTypes);

module.exports = db;
