exports.ok = function(res, data, code) {
	var d = {
		'code': code || 200,
		'data': data,
		'msg': "success"
	}
	return res.json(d);
}

exports.cErr = function(res, msg, code) {
	var d = {
		'code': code || 400,
		'msg': msg || '非法访问'
	}
	return res.json(d);
}

exports.sErr = function(res, msg, code) {
	var d = {
		'code': code || 500,
		'msg': msg || '老板带着小姨子跑了，程序员正在挽救中...'
	}
	return res.json(d);
}