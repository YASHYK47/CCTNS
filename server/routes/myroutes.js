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

router.post("/register/SHO", (req, res) => {
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

router.get("/user/profile", (req, res) => {
  var id = req.body.userId;
  User.find({ _id: id }).then(user => {
    res.send(user);
  });
});

router.get("/admin/profile", (req, res) => {
  var id = req.body.adminId;
  Admin.find({ _id: id }).then(user => {
    res.send(user);
  });
});

router.get("/SHO/profile", (req, res) => {
  var id = req.body.userId;
  SHO.find({ _id: id }).then(user => {
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

router.delete("/SHO/logout", authenticateSHO, (req, res) => {
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
  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send("Wrong Credentials");
    });
});

router.post("/SHO/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  SHO.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.get("user/myFirs", (req, res) => {
  var userId = req.body.userId;
  FIR.find({ " User.id": userId })
    .then(firs => {
      res.status(200).send(firs);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.get("SHO/Firs", (req, res) => {
  var id = req.body.SHOId;
  FIR.find({ "SHO.id": id })
    .then(firs => {
      res.status(200).send(firs);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post("/Fir", (req, res) => {
  SHO.findOne({ location: req.body.location })
    .then(Sho => {
      if (!Sho) {
        res.status(400).send("Enter valid Location");
      }
      var Fir = new FIR({
        questions: req.body.questions,
        location: req.body.location,
        // hash: ,
        status: 0,
        verified: false,
        "User.id": req.body.userId,
        "SHO.id": Sho._id
      });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post("/FirbyId", (req, res) => {
  var id = req.body.FirId;
  FIR.findOne({ _id: id }).then(user => {
    res.send(req.user);
  }).catch(err => {
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

router.post("/verifyotp", async function(req, res, next) {
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
