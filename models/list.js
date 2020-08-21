module.exports = (sequelize, DataTypes) => {
    return sequelize.define('list', {
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        list_href: {
            type: DataTypes.STRING,
        },
        list_title: {
            type: DataTypes.STRING,
        },
    })
}
