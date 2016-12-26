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
						callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		var error = null;
		if (data && data.length === 0) {
			error = {
				msg: "密码或手机错误",
				code: "400"
			}
			callback && callback(error, data);
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
			callback && callback(err, data);
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
			callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		DAO.getUserInfo(data, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		DAO.setUserInfo(data, head, nick, gender, brief, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		DAO.getFriendList(data, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		DAO.addFriend(data, friendId, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}
	
		DAO.deleteFriend(data, friendId, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}
		
		DAO.setFriendRemark(data, friendId, remark, function (err, data) {
			if (err) {
				callback && callback(err, data);
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
			callback && callback(err, data);
			return ;
		}

		var result = data;
		callback && callback(err, result);
	});
}

//根据昵称获取用户
exports.getUserByNick = function (nick, callback) {
	DAO.getUserByNick(nick, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}

		var result = data;
		callback && callback(err, result);
	});
}

//新增群组
exports.addGroup = function (token, groupName, groupUsers, callback) {
	verifyToken(token, function (err, data) {
		var error = null;
		var masterId = data;
		if (err) {
			callback && callback(err, data);
			return ;
		}

		if (groupUsers.length < 2) {
			error = {
				msg: "成员列表数量不符合",
				code: "400"
			}
			callback && callback(error, data);
			return ;
		}

		if (groupUsers.indexOf(masterId) === -1) {
			error = {
				msg: "组长必须在成员列表里",
				code: "400"
			}
			callback && callback(error, data);
			return ;
		}

		DAO.getUserByList(groupUsers, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length !== groupUsers.length) {
				error = {
					msg: "有组员不存在",
					code: "400"
				}
				callback && callback(error, data);
				return ;
			}

			if (!groupName) {
				for (var i = 0, l = data.length; i < l && i < 3; i++) {
					groupName += data[i].nick;
					if (i < l-1 && i < 2) {
						groupName += ",";
					}
				}
				if (data.length > 3) {
					groupName += "...";
				}
			}

			DAO.addGroup(groupName, masterId, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}

				var groupId = data;
				DAO.addGroupUserByList(groupId, groupUsers, function (err, data) {
					if (err) {
						callback && callback(err, data);
						return ;
					}

					var result = {
						groupId: groupId
					}

					callback && callback(error, result);
				});
			});
		});
	});
}

//获取群组信息
exports.getGroupInfoById = function (groupId, callback) {
	var error = null;
	DAO.getGroupInfo(groupId, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}

		if (data.length < 1) {
			error = {
				msg: "群组不存在",
				code: "400"
			};
			callback && callback(error, data);
			return ;
		}

		var groupInfo = data[0];
		DAO.getGroupUsers(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			groupInfo.member = data || [];
			callback && callback(error, groupInfo);
			return ;
		});
	});
}

//群组添加群员
exports.addGroupUser = function (token, groupId, userId, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		
		DAO.getUserInfo(userId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "用户不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			DAO.getGroupInfo(groupId, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}

				if (data.length < 1) {
					error = {
						msg: "群组不存在",
						code: "400"
					};
					callback && callback(error, data);
					return ;
				}

				DAO.addGroupUserById(groupId, userId, function (err, data) {
					if (err) {
						callback && callback(err, data);
						return ;
					}
	
					var result = "添加组员成功";
					callback && callback(err, result);
				});
			});
		});
	});
}

//设置群组名
exports.setGroupName = function (token, groupId, groupName, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}

		DAO.getGroupInfo(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "群组不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			DAO.setGroupName(groupId, groupName, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}
	
				var result = "修改群名成功";
				callback && callback(err, result);
			});
		});
	});
}

//群主删除组员
exports.deleteGroupUser = function (token, groupId, userId, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.getGroupInfo(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "群组不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			if (data[0].masterId !== myId) {
				error = {
					msg: "没有删除权限",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			if (data[0].masterId === userId) {
				error = {
					msg: "不能删除群主",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			DAO.deleteGroupUser(groupId, userId, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}
	
				var result = "删除群成员成功";
				callback && callback(err, result);
			});
		});
	});
}

//指定群主
exports.setGroupMaster = function (token, groupId, userId, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.getGroupInfo(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "群组不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			if (data[0].masterId !== myId) {
				error = {
					msg: "没有权限",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			DAO.getGroupUserById(groupId, userId, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}

				if (data.length < 1) {
					error = {
						msg: "新群主必须在群内",
						code: "400"
					};
					callback && callback(error, data);
					return ;
				}

				DAO.setGroupMaster(groupId, userId, function (err, data) {
					if (err) {
						callback && callback(err, data);
						return ;
					}

					var result = "转移群主成功";
					callback && callback(error, result);
				});
			});
		});
	});
}

//退出群组
exports.exitGroup = function (token, groupId, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.getGroupInfo(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "群组不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			if (data[0].masterId === myId) {
				DAO.getGroupUsers(groupId, function (err, data) {
					if (err) {
						callback && callback(err, data);
						return ;
					}

					var length = data.length;
					if (length <= 1) {
						DAO.dissolveGroup(groupId, function (err, data) {
							if (err) {
								callback && callback(err, data);
								return ;
							}

							callback && callback(err, data);
						});
					} else if (length > 1) {
						var newMasterId;
						for (i = 0; i < length; i++) {
							if (data[i].id !== myId) {
								newMasterId = data[i].id;
								break;
							}
						}
						DAO.setGroupMaster(groupId, newMasterId, function (err, data) {
							if (err) {
								callback && callback(err, data);
								return ;
							}

							callback && callback(err, data);
						});
					}
				});
			} else {
				DAO.deleteGroupUser(groupId, myId, function (err, data) {
					if (err) {
						callback && callback(err, data);
						return ;
					}
	
					var result = "退群成功";
					callback && callback(err, result);
				});
			}
		});
	});
}

//解散群组
exports.dissloveGroup = function (token, groupId, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.getGroupInfo(groupId, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			if (data.length < 1) {
				error = {
					msg: "群组不存在",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			if (data[0].masterId !== myId) {
				error = {
					msg: "没有解散权限",
					code: "400"
				};
				callback && callback(error, data);
				return ;
			}

			DAO.dissolveGroup(groupId, function (err, data) {
				if (err) {
					callback && callback(err, data);
					return ;
				}

				var result = "解散成功";
				callback && callback(err, data);
			});
		});
	});
}

//发送群组信息
exports.sendGroupMessage = function (token, groupId, content, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.sendGroupMessage(myId, groupId, content, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			callback && callback(error, data);
		});
	});
}

//发送个人信息
exports.sendUserMessage = function (token, toId, content, callback) {
	var error = null;
	verifyToken(token, function (err, data) {
		if (err) {
			callback && callback(err, data);
			return ;
		}
		var myId = data;

		DAO.sendUserMessage(myId, toId, content, function (err, data) {
			if (err) {
				callback && callback(err, data);
				return ;
			}

			callback && callback(error, data);
		});
	});
}