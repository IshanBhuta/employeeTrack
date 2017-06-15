const dbConection = require('./databaseConnection.json');
const QueryBuilder = require('node-querybuilder').QueryBuilder(dbConection, 'mysql', 'single');
module.exports = QueryBuilder;
