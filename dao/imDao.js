var mysql = require("mysql");
var mysqlConfig = require('./../config.js').mysql;
var mysql_connect = null;

if (mysqlConfig) {
	mysql_connect = mysql.createConnection({
		host: mysqlConfig.host,
		user: mysqlConfig.user,
		database: mysqlConfig.database,
		password: mysqlConfig.password
	});
	mysql_connect.connect();
}