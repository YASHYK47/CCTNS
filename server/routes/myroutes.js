const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { ObjectID } = require("mongodb");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");

var { mongoose } = require("../db/mongoose.js");
var { User } = require("../models/user.js");
var { Admin } = require("../models/admin.js");
var { SHO } = require("../models/SHO.js");
var { FIR } = require("../models/fir.js");
var { authenticateSHO } = require("../middleware/authenticateSHO.js");
var { authenticateuser } = require("../middleware/authenticateuser.js");
var { authenticateadmin } = require("../middleware/authenticateadmin.js");

// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }

router.get("/", (req, res) => {
  res.status(200).send("<h1>App working fine</h1>");
});

router.post("/register/user", (req, res) => {
  var body = _.pick(req.body, ["name", "email", "age", "password"]);
  var user = new User(body);
  console.log(user);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/register/admin", (req, res) => {
  var body = _.pick(req.body, ["name", "email", "password"]);
  var user = new Admin(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/register/SHO", authenticateadmin, (req, res) => {
  var body = _.pick(req.body, ["name", "email","location", "password","age"]);
  var user = new SHO(body);
  user
    .save()
    .then(() => {
      res.status(200).send("SHO Registered Successfully");
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.get("/user/profile", authenticateuser, (req, res) => {
  var token = req.header("x-auth");
  Userstud.findByToken(token).then(user => {
    res.send(req.user);
  });
});

router.get("/admin/profile", authenticateadmin, (req, res) => {
  var token = req.header("x-auth");
  Admin.findByToken(token).then(user => {
    res.send(req.user);
  });
});

router.get("/SHO/profile", authenticateSHO, (req, res) => {
  var token = req.header("x-auth");
  Userstud.findByToken(token).then(user => {
    res.send(req.user);
  });
});

router.delete("/user/logout", authenticateuser, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send("Logged Out Successfully");
    },
    () => {
      res.status(400).send("Try Again");
    }
  );
});

router.delete("/admin/logout", authenticateadmin, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send("Logged Out Successfully");
    },
    () => {
      res.status(400).send("Try Again");
    }
  );
});

router.delete("/SHO/logout", authenticateuser, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send("Logged Out Successfully");
    },
    () => {
      res.status(400).send("Try Again");
    }
  );
});

router.post("/admin/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  Admin.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send("Authentication Failed");
    });
});

router.post("/userstaf/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  Userstaf.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.post("/SHO/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  Userstaf.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.route("/sendotp").post(async function(req, res, next) {
  var phone = req.body.phone;
  var phone_91 = "91" + phone; //along with country code
  request.post(
    "https://control.msg91.com/api/sendotp.php?authkey=" +
      config.SMS.AUTH_KEY +
      "&message=Welcome%20to%20Cupido.%20Discover%20the%20new%20world%20of%20products.%20Hope%20you%20have%20an%20awesome%20time%20here.%20Here%20is%20your%20OTP%20%20%23%23OTP%23%23&sender=" +
      config.SMS.SENDER_ID +
      "&mobile=" +
      phone_91,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        // console.log(body);
        const newUser = await User.findOne({
          "contact.contact": phone
        }).exec();
        res.send({ ...body, new: newUser ? false : true });
      } else {
        return next({ message: "unknown error occured", status: 400 });
      }
    }
  );
});

router.route("/resendotp").post(async function(req, res, next) {
  var phone = req.body.phone;
  var phone_91 = "91" + phone;
  request.post(
    "https://control.msg91.com/api/retryotp.php?authkey=" +
      config.SMS.AUTH_KEY +
      "&mobile=" +
      phone_91,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        // console.log(body);
        const newUser = await User.findOne({
          "contact.contact": phone
        }).exec();
        res.send({ ...body, new: newUser ? false : true });
      } else {
        return next({ message: "unknown error occured", status: 400 });
      }
    }
  );
});

router.route("/verifyotp").post(async function(req, res, next) {
  var phone = "91" + req.body.phone;
  var otp = req.body.otp;
  request.post(
    "https://control.msg91.com/api/verifyRequestOTP.php?authkey=" +
      config.SMS.AUTH_KEY +
      "&mobile=" +
      phone +
      "&otp=" +
      otp,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        if (body.type === "success") {
          res.send(body);
        } else {
          return next({
            message: "unknown error occured",
            status: 400
          });
        }
      } else {
        return next({
          message: "unknown error occured",
          status: 400,
          stack: error
        });
      }
    }
  );
});

module.exports = router;
