const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { ObjectID } = require("mongodb");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
const request = require("request");

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
  var body = _.pick(req.body, ["name", "email", "location", "password", "age"]);
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

router.post("/user/login", (req, res) => {
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

router.get("user/myFirs", authenticateuser, (req, res) => {
  var user = req.user;
  FIR.find({ "User.id": req.user._id })
    .then(firs => {
      res.status(200).send(firs);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

// router.get("SHO/newFirs", authenticateuser, (req, res) => {
//   var user = req.user;
//   FIR.find({ "User.id": req.user._id })
//     .then(firs => {
//       res.status(200).send(firs);
//     })
//     .catch(err => {
//       res.status(400).send(err);
//     });
// });

router.post("/sendotp", async function(req, res, next) {
  var phone = req.body.phone;
  var phone_91 = "91" + phone;
  console.log(phone_91);
  request.post(
    "https://control.msg91.com/api/sendotp.php?authkey=286740AaLXa68duDLY5e238441P1&message=%20Here%20is%20your%20OTP%20%20%23%23OTP%23%23&sender=CCTNSS&mobile=" +
      phone_91,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        res.send("Otp send");
        // console.log(response);
      } else {
        console.log(error);
      }
    }
  );
});

router.route("/resendotp").post(async function(req, res, next) {
  var phone = req.body.phone;
  var phone_91 = "91" + phone;
  request.post(
    "https://control.msg91.com/api/retryotp.php?authkey=286740AaLXa68duDLY5e238441P1&mobile=" +
      phone_91,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        res.status(200).send("OTP Sent Again");
      } else {
        res.status(400).send("Some Error occured");
      }
    }
  );
});

router.post("/verifyotp",async function(req, res, next) {
  var phone = "91" + req.body.phone;
  var otp = req.body.otp;
  request.post(
    "https://control.msg91.com/api/verifyRequestOTP.php?authkey=286740AaLXa68duDLY5e238441P1&mobile=" +
      phone +
      "&otp=" +
      otp,
    { json: true },
    async function(error, response, body) {
      if (!error) {
        if (body.type === "success") {
          res.status(200).send("verified");
        } else {
          res.status(400).send("Some Error Occurred 1");
          console.log(response);
        }
      } else {
        res.status(400).send("Some Error Occurred");
        console.log(error);
      }
    }
  );
});

module.exports = router;
