var express = require('express');
var router = express.Router();

var service = require('../service/imService');
var send = require('../libs/send.js');

/**
 * 用户登录
 * @param  {string} mobile 用户手机号
 * @param  {string} password 用户密码(md5加密)
 * @return {string} token 登录凭证
 */
router.post('/users/token', function (req, res) {
	var mobile = req.body.mobile;
	var password = req.body.password;

	if(!mobile || !password) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.login(mobile, password, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 用户注册
 * @param  {string} mobile 用户手机号
 * @param  {string} password 用户密码(md5加密)
 * @param  {string} nick 用户昵称
 * @param  {int} verify 验证码
 */
router.post('/users', function (req, res) {
	var mobile = req.body.mobile;
	var password = req.body.password;
	var nick = req.body.nick;
	var verify = req.body.verify;

	if (!mobile || !password || !verify || !nick) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.register(mobile, password, verify, nick, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 获取用户信息
 * @param  {string} token
 * @return {string} mobile 用户手机号
 * @return {string} head 用户头像
 * @return {string} nick 用户昵称
 * @return {string} gender 用户性别
 * @return {string} brief 简介
 */
router.get('/users/id', function (req, res) {
	var token = req.query.token;

	if (!token) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.getUserInfo(token, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 设置用户信息
 * @param  {string} token
 * @param {string} head 用户头像
 * @param {string} nick 用户昵称
 * @param {string} gender 用户性别
 * @param {string} brief 简介
 */
router.post('/users/id', function (req, res) {
	var token = req.body.token;
	var head = req.body.head || "";
	var nick = req.body.nick || "";
	var gender = req.body.gender || "";
	var brief = req.body.brief || "";

	if (!token) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.setUserInfo(token, head, nick, gender, brief, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 获取好友列表
 * @param  {string} token
 * @result {list} 好友列表
 */
router.get('/friends', function (req, res) {
	var token = req.query.token;

	if (!token) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.getFriendList(token, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 添加好友
 * @param  {string} token
 * @param  {int} userId 好友的Id
 */
router.post('/friends', function (req, res) {
	var token = req.body.token;
	var friendId = req.body.userId;

	if (!token || !friendId) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.addFriend(token, friendId, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 删除好友
 * @param  {string} token
 * @param  {int} userId 好友的Id
 */
router.delete('/friends/id', function (req, res) {
	var token = req.body.token;
	var friendId = req.body.userId;

	if (!token || !friendId) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.deleteFriend(token, friendId, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 修改好友备注
 * @param  {string} token
 * @param  {int} userId 好友的Id
 * @param  {string} remark 好友的备注
 */
router.post('/friends/id', function (req, res) {
	var token = req.body.token;
	var friendId = req.body.userId;
	var remark = req.body.remark || "";

	if (!token || !friendId) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.setFriendRemark(token, friendId, remark, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 手机号搜索用户
 * @param  {string} mobile 手机
 * @return {list} 用户列表
 */
router.get('/users/mobile', function (req, res) {
	var mobile = req.query.mobile;

	if (!mobile) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.getUserByMobile(mobile, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

/**
 * 昵称搜索用户
 * @param  {string} nick 手机
 * @return {list} 用户列表
 */
router.get('/users/nick', function (req, res) {
	var nick = req.query.nick;

	if (!nick) {
		send.cErr(res, "缺少请求参数", 400);
		return ;
	}

	service.getUserByMobile(nick, function (err, data) {
		if (err) {
			send.sErr(res, err.msg, err.code);
			return ;
		}

		send.ok(res, data, 200);
	});
});

module.exports = router;