module.exports = {
	server: {
		port: 3000
	},
	
	//@Mysql
	//params: host, user, database, password
	mysql: {
		host: "im.cxyehqjrmkan.ap-northeast-1.rds.amazonaws.com",
		user: "root",
		database: "im_db",
		password: "rootroot"
	},

	//@redis
	//params: host, port
	redis: {
		host: "127.0.0.1",
		port: 6379
	},

	tokenSecret: "bskjdhkzj"
}
