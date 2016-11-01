var mysql = require("mysql");
var mysqlConfig = require('./../config.js').mysql;
var mysql_connect = null;

var tableName = "im_db";

if (mysqlConfig) {
	mysql_connect = mysql.createConnection({
		host: mysqlConfig.host,
		user: mysqlConfig.user,
		database: mysqlConfig.database,
		password: mysqlConfig.password
	});
	mysql_connect.connect();
}

//用户登录
exports.login = function (mobile, password, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT * \
		FROM user_info \
		WHERE mobile="' + mobile + '" AND password="' + password + '"',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('login Error:' + err);
				error = {
					msg: "登录失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//设置token
exports.setToken = function (userId, token, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'INSERT INTO user_token (uid,token) \
		VALUES (' + userId + ',"' + token + '") \
		ON DUPLICATE KEY UPDATE token="' + token + '"',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('setToken Error:' + err);
				error = {
					msg: "设置token失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//获取token
exports.getToken = function (userId, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT * \
		FROM user_token \
		WHERE uid=' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getToken Error:' + err);
				error = {
					msg: "获取token失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//用户注册
exports.register = function (mobile, password, nick, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'INSERT INTO user_info (mobile, password, nick) \
			SELECT "' + mobile + '","' + password + '","' + nick + '" \
			FROM DUAL \
			WHERE NOT EXISTS \
				(SELECT * FROM user_info WHERE mobile="' + mobile + '")',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('login Error:' + err);
				error = {
					msg: "注册失败",
					code: "500"
				}
			} else if (results.insertId === 0) {
				error = {
					msg: "手机号已被注册",
					code: "400"
				}
			}

			callback && callback(error, results);
		}
	);
}

//获取用户信息
exports.getUserInfo = function (userId, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT id,mobile,headimg AS head,nick,gender,brief \
		FROM user_info \
		WHERE id=' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getUserInfo Error:' + err);
				error = {
					msg: "获取用户信息失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//根据手机号获取用户
exports.getUserByMobile = function (mobile, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT id,mobile,headimg AS head,nick,gender,brief \
		FROM user_info \
		WHERE mobile LIKE "%' + mobile + '%"',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getUserByMobile Error:' + err);
				error = {
					msg: "获取用户失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//根据昵称获取用户
exports.getUserByNick = function (nick, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT id,mobile,headimg AS head,nick,gender,brief \
		FROM user_info \
		WHERE mobile LIKE "%' + nick + '%"',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getUserByNick Error:' + err);
				error = {
					msg: "获取用户失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//设置用户信息
exports.setUserInfo = function (userId, head, nick, gender, brief, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'UPDATE user_info \
		SET headimg="' + head + '",nick="' + nick + '",gender="' + gender + '",brief="' + brief + '" \
		WHERE id=' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('setUserInfo Error:' + err);
				error = {
					msg: "设置用户信息失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//获取好友列表
exports.getFriendList = function (userId, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'SELECT info.id, info.mobile, info.headimg, info.nick, info.gender, info.brief, friend.friend_remarks AS remark \
		FROM user_friend AS friend \
			LEFT JOIN user_info AS info ON info.id=friend.friend_id AND friend_type=1 AND friend.uid=' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getFriendList Error:' + err);
				error = {
					msg: "获取好友列表失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//添加好友
exports.addFriend = function (userId, friendId, callback) {
	console.log(userId);
	console.log(friendId);
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'INSERT INTO user_friend \
		(uid,friend_id,friend_type) \
		VALUES (' + userId + ',' + friendId + ',1)',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('addFriend Error:' + err);
				error = {
					msg: "添加好友失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//删除好友
exports.deleteFriend = function (userId, friendId, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'DELETE FROM user_friend \
		WHERE friend_type=1 AND uid=' + userId + ' AND friend_id=' + friendId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('deleteFriend Error:' + err);
				error = {
					msg: "删除好友失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//设置好友备注
exports.setFriendRemark = function (userId, friendId, remark, callback) {
	mysql_connect.query('USE ' + tableName);
	mysql_connect.query(
		'UPDATE user_friend \
		SET friend_remarks="' + remark + '" \
		WHERE uid=' + userId + ' AND friend_id=' + friendId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('setFriendRemark Error:' + err);
				error = {
					msg: "设置好友备注失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}