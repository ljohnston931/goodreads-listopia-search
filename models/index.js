const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false })

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.author_books = require('./author_book')(sequelize, DataTypes)
db.books = require('./book')(sequelize, DataTypes)
db.lists = require('./list')(sequelize, DataTypes)

db.sequelize.sync()

module.exports = db
