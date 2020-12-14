var request      = require("request")
  , express      = require("express")
  , morgan       = require("morgan")
  , path         = require("path")
  , bodyParser   = require("body-parser")
  , async        = require("async")
  , cookieParser = require("cookie-parser")
  , session      = require("express-session")
  , config       = require("./config")
  , helpers      = require("./helpers")
  , cart         = require("./api/cart")
  , catalogue    = require("./api/catalogue")
  , orders       = require("./api/orders")
  , user         = require("./api/user")
  , metrics      = require("./api/metrics")
  , app          = express()
  , awsServerlessExpress = require('aws-serverless-express')


const indexRouter = express.Router();

indexRouter.use(helpers.rewriteSlash);
indexRouter.use(metrics);
indexRouter.use(express.static("public"));
if(process.env.SESSION_REDIS) {
    console.log('Using the redis based session manager');
    indexRouter.use(session(config.session_redis));
}
else {
    console.log('Using local session manager');
    indexRouter.use(session(config.session));
}

indexRouter.use(bodyParser.json());
indexRouter.use(cookieParser());
indexRouter.use(morgan("dev", {}));

var domain = "";
process.argv.forEach(function (val, index, array) {
  var arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] == "--domain") {
      domain = arg[1];
      console.log("Setting domain to:", domain);
    }
  }
});

/* Mount API endpoints */
indexRouter.use(cart);
indexRouter.use(catalogue);
indexRouter.use(orders);
indexRouter.use(user);

indexRouter.use(helpers.errorHandler);

app.use(config.baseUrl, indexRouter);

if (!process.env.LAMBDA_TASK_ROOT) {
    var server = app.listen(process.env.PORT || 8079, function () {
        var port = server.address().port;
        console.log("App now running in %s mode on port %d", app.get("env"), port);
    });
} else {
    const server = awsServerlessExpress.createServer(app, null, ["image/jpeg", "image/png"])
    exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
}


