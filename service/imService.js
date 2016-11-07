var jwt = require('jsonwebtoken');
var tokenSecret = require('./../config.js').tokenSecret;
var DAO = require('../dao/imDao.js');

var redis = require('redis');
var redisConfig = require('./../config.js').redis;
var redisClient = redis.createClient(redisConfig.port, redisConfig.host);

function verifyToken(token, callback) {
	jwt.verify(token, tokenSecret, function (err, decoded) {
		var error = null;
		if (err) {
				error = {
				msg: "token无效",
				code: 400
			}
			callback && callback(error, null);
			return ;
		}

		if(!decoded || !decoded.userId) {
			error = {
				msg: "token无效",
				code: 400
			}
			callback && callback(error, null);
			return ;
		}

		redisClient.get(decoded.userId, function (err, reply) {
			if (!reply || token !== reply) {
				DAO.getToken(decoded.userId, function (err, data) {
					if (err) {
						callback && callback (err, data);
						return ;
					}

					if (data.length === 0 || data[0].token !== token) {
						error = {
							msg: "token无效",
							code: 400
						}
						callback && callback(error, null);
						return ;
					} else {
						redisClient.set(decoded.userId, data[0].token);
						callback && callback(error, decoded.userId);
					}
				});
			} else {
				callback && callback(error, decoded.userId);
			}
		});
	});
}

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

		DAO.setToken(info.id, token);
		redisClient.set(info.id, token);
		callback && callback(error, result);		
	});
}

//用户注册
exports.register = function (mobile, password, verify, nick, callback) {
	var error = null;
	if (parseInt(verify) !== 123456) {
		error = {
			msg: "验证码错误",
			code: 400
		}
		callback && callback(error, null);
		return ;
	}
	DAO.register(mobile, password, nick, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var result = "注册成功";
		callback && callback(error, result);	
	});
}

//刷新token
exports.refreshToken = function (token, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		var newToken = jwt.sign({
				userId: data,
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
			}, tokenSecret);
		var result = {
			"token": newToken
		};

		DAO.setToken(data, newToken);
		redisClient.set(data, newToken);
		callback && callback(null, result);
	});
}

//获取用户信息
exports.getUserInfo = function (token, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		DAO.getUserInfo(data, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}

			var result = data[0];
			callback && callback(err, result);
		});
	});
}

//设置用户信息
exports.setUserInfo = function (token, head, nick, gender, brief, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		DAO.setUserInfo(data, head, nick, gender, brief, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}

			var result = "修改成功";
			callback && callback(err, result);
		});
	});
}

//获取好友列表
exports.getFriendList = function (token, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		DAO.getFriendList(data, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}

			var result = data;
			callback && callback(err, result);
		});
	});
}

//添加好友
exports.addFriend = function (token, friendId, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}

		DAO.addFriend(data, friendId, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}

			var result = "添加好友成功";
			callback && callback(err, result);
		});
	});
}

//删除好友
exports.deleteFriend = function (token, friendId, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}
	
		DAO.deleteFriend(data, friendId, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}
	
			var result = "删除好友成功";
			callback && callback(err, result);
		});
	});
}

//设置好友备注
exports.setFriendRemark = function (token, friendId, remark, callback) {
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback (err, data);
			return ;
		}
		
		DAO.setFriendRemark(data, friendId, remark, function (err, data) {
			if (err) {
				callback && callback (err, data);
				return ;
			}

			var result = "修改备注成功";
			callback && callback(err, result);
		});
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
		callback && callback(err, result);
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
		callback && callback(err, result);
	});
}