var mysql = require("mysql");
var mysqlConfig = require('./../config.js').mysql;
var mysql_connect = null;

var tableName = "im_db";

if (mysqlConfig) {
	mysql_connect = mysql.createPool({
		host: mysqlConfig.host,
		user: mysqlConfig.user,
		database: mysqlConfig.database,
		password: mysqlConfig.password
	});
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
			LEFT JOIN user_info AS info ON info.id=friend.friend_id \
		WHERE friend.friend_type=1 AND friend.uid=' + userId,
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

//根据用户ID列表获取用户信息
exports.getUserByList = function (groupUsers, callback) {
	var userIds = '"' + groupUsers.join('","') + '"';
	mysql_connect.query(
		'SELECT * \
		FROM user_info \
		WHERE id IN (' + userIds + ')',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getUserByList Error:' + err);
				error = {
					msg: "获取用户列表失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//添加群组
exports.addGroup = function (groupName, masterId, callback) {
	mysql_connect.query(
		'INSERT INTO group_info \
		(name, masterId) \
		VALUES ("' + groupName + '","' + masterId + '")',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('addGroup Error:' + err);
				error = {
					msg: "添加群组失败",
					code: "500"
				}
				callback && callback(error, results);
				return ;
			}

			var groupId = results.insertId;
			callback && callback(error, groupId);
		}
	);
}

//根据ID获取群组信息
exports.getGroupInfo = function (groupId, callback) {
	mysql_connect.query(
		'SELECT * \
		FROM group_info \
		WHERE id = ' + groupId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getGroupInfo Error:' + err);
				error = {
					msg: "获取群组信息失败",
					code: "500"
				}
				callback && callback(error, results);
				return ;
			}

			callback && callback(error, results);
		}
	);
}

//获取群员列表
exports.getGroupUsers = function (groupId, callback) {
	mysql_connect.query(
		'SELECT B.id,B.mobile,B.headimg,B.nick \
		FROM (SELECT * \
			FROM group_user \
			WHERE gid = ' + groupId + ') AS A \
		LEFT JOIN user_info AS B \
		ON A.uid = B.id',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getGroupUsers Error:' + err);
				error = {
					msg: "获取组员信息失败",
					code: "500"
				}
				callback && callback(error, results);
				return ;
			}

			callback && callback(error, results);
		}
	);
}

//通过userId获取群组成员(仅为判断用户是否存在于表中)
exports.getGroupUserById = function (groupId, userId, callback) {
	mysql_connect.query(
		'SELECT * \
		FROM group_user \
		WHERE gid = ' + groupId + ' AND uid = ' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('getGroupUserById Error:' + err);
				error = {
					msg: "获取组员失败",
					code: "500"
				}
				callback && callback(error, results);
				return ;
			}

			callback && callback(error, results);
		}
	);
}

//通过列表添加群组成员
exports.addGroupUserByList = function (groupId, groupUsers, callback) {
	var datas = "";
	groupUsers.forEach(function (currentValue, index, array) {
		datas += '("' + groupId + '","' + currentValue + '")';
		if (index < array.length - 1) {
			datas += ',';
		}
	});
	mysql_connect.query(
		'INSERT INTO group_user \
		(gid, uid) \
		VALUES ' + datas,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('addGroupUserByList Error:' + err);
				error = {
					msg: "添加群组成员失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//通过ID添加群组成员
exports.addGroupUserById = function (groupId, userId, callback) {
	mysql_connect.query(
		'INSERT INTO group_user \
		(gid, uid) \
		VALUES ("' + groupId + '",' + userId + ')',
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('addGroupUserById Error:' + err);
				error = {
					msg: "添加群组成员失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//修改群名
exports.setGroupName = function (groupId, groupName, callback) {
	mysql_connect.query(
		'UPDATE group_info \
		SET name="' + groupName + '" \
		WHERE id=' + groupId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('setGroupName Error:' + err);
				error = {
					msg: "设置群名失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//删除群组成员
exports.deleteGroupUser = function (groupId, userId, callback) {
	mysql_connect.query(
		'DELETE FROM group_user \
		WHERE gid = ' + groupId + ' AND uid = ' + userId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('deleteGroupUser Error:' + err);
				error = {
					msg: "删除群成员失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//设置群主
exports.setGroupMaster = function (groupId, userId, callback) {
	mysql_connect.query(
		'UPDATE group_info \
		SET masterId = ' + userId +
		' WHERE id = ' + groupId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('setGroupMaster Error:' + err);
				error = {
					msg: "设置群主失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}

//解散群组
exports.dissolveGroup = function (groupId, callback) {
	mysql_connect.query(
		'DELETE FROM group_info \
		WHERE id = ' + groupId,
		function (err, results, fields) {
			var error = null;
			if (err) {
				console.log('dissolveGroup Error:' + err);
				error = {
					msg: "解散群组失败",
					code: "500"
				}
			}

			callback && callback(error, results);
		}
	);
}
