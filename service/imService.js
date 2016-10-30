var jwt = require('jsonwebtoken');
var tokenSecret = require('./../config.js').tokenSecret;
var DAO = require('../dao/imDao.js');

//用户登录
exports.login = function (mobile, password, callback) {
	DAO.login(mobile, password, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var error = null;
		if (data && data.length === 0) {
			error = {
				msg: "密码或手机错误",
				code: "400"
			}
			callback && callback (error, data);
			return ;
		}

		var info = data[0];
		var token = jwt.sign({
				userId: info.id,
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
			}, tokenSecret);
		var result = {
			"token": token
		};
		callback && callback(error, result);		
	});
}

//用户注册
exports.register = function (mobile, password, verify, callback) {
	var error = null;
	if (verify !== 123456) {
		error = {
			msg: "验证码错误",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.register(mobile, password, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "注册成功";
		callback && callback(error, result);	
	});
}

//获取用户信息
exports.getUserInfo = function (token, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.getUserInfo(decoded.userId, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = data[0];
		callback && callback(error, result);
	});
}

//设置用户信息
exports.setUserInfo = function (token, head, nick, gender, brief, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.setUserInfo(decoded.userId, head, nick, gender, brief, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "修改成功";
		callback && callback(error, result);
	});
}

//获取好友列表
exports.getFriendList = function (token, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.getFriendList(decoded.userId, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = data;
		callback && callback(error, result);
	});
}

//添加好友
exports.addFriend = function (token, friendId, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.addFriend(decoded.userId, friendId, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "添加好友成功";
		callback && callback(error, result);
	});
}

//删除好友
exports.deleteFriend = function (token, friendId, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.deleteFriend(decoded.userId, friendId, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "删除好友成功";
		callback && callback(error, result);
	});
}

//设置好友备注
exports.setFriendRemark = function (token, friendId, remark, callback) {
	var decoded = jwt.verify(token, tokenSecret);
	var error = null;
	if (!decoded || !decoded.userId) {
		error = {
			msg: "token无效",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.setFriendRemark(decoded.userId, friendId, remark, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "修改备注成功";
		callback && callback(error, result);
	});
}

//根据手机号码获取用户
exports.getUserByMobile = function (mobile, callback) {
	DAO.getUserByMobile(mobile, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = data;
		callback && callback(error, result);
	});
}

//根据昵称获取用户
exports.getUserByNick = function (nick, callback) {
	DAO.getUserByMobile(nick, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = data;
		callback && callback(error, result);
	});
}