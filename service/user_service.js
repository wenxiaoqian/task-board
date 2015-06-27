// 依赖
var http = require('http');
var xxjia = require('../config/xxjia');
var UserModel2 = require('../model/user_model');

// UserService
var User = module.exports = {
  loginFromXxjia: function (loginInfo, callback) {
    var contents = JSON.stringify({
      client_key: loginInfo.client_key,
      platform_id: loginInfo.platform_id,
      account: loginInfo.account,
      password: loginInfo.password,
      device_id: loginInfo.device_id
    });
    var options = {
      host: xxjia.url,
      path: '/user/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contents.length
      }
    };
    var req = http.request(options, function (res) {
      var chunks = [];
      var size = 0;

      res.on('data', function (data) {
        chunks.push(data);
        size += data.length;
      });
      res.on('end', function () {
        var buf = Buffer.concat(chunks, size);
        callback('', JSON.parse(buf.toString()));
      });
    });
    req.write(contents);
    req.end();
  },
  saveWhenLoginFromXxjia: function (loginInfo, mobile, callback) {
    UserModel2
      .findOrCreate({
        where: {
          xxjia_user_id: loginInfo.uid
        },
        defaults: {
          mobile: mobile
        }
      })
      .spread(function (user) {
        callback({id: user.id});
      });
  },
  checkSession: function (req, res, next) {
    // session的用户id是否存在
    if (!req.session.user_id) {
      res.status(403);
      res.json({msg: '请登陆后访问'});
    } else {
      req.user = req.session.user;
      console.log('用户' + req.user.id + '登陆');
      next();
    }
  }
};