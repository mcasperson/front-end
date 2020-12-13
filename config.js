(function (){
  'use strict';

  var session      = require("express-session"),
      RedisStore   = require('connect-redis')(session)

  module.exports = {
    baseUrl: process.env.BASE_URL || '/',
    session: {
      name: 'md.sid',
      secret: 'sooper secret',
      resave: false,
      saveUninitialized: true
    },

    session_redis: {
      store: new RedisStore({host: "session-db"}),
      name: 'md.sid',
      secret: 'sooper secret',
      resave: false,
      saveUninitialized: true
    }
  };
}());
