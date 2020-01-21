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

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("../singham-hoxcfn-b29e59d05857.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://singham-hoxcfn.firebaseio.com"
});

const { SessionsClient } = require('dialogflow');
let config = {
  credentials: {
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBvqBma2x+YU2v\n71UrG1SHYU6DSLz10HQAzQJ/rVb6gAjYfjVrg11Sw46Dx1itwoYv6vVZ+gx7lae4\ns1eeYFpM7qEQ9DfadhoYH6KRnhSk3OpfsGfgmrWlZ0Kt1dv3+8YkO9ugMRgHpHa4\nclsv8SWga95Nw+hBVkVlu0hKhSEJkZ7kRmkiK+SDRPXg0vW5AxeL+/7MQXnR5Zdm\nhly8UPM43FYPiH+crKuCVmwAcJNCnqofNClA2f/Nu6Fc424Ppe2Q0lxJlhQqZ/fm\nzyn3+5r63t8rnMSzbchx4cVzhXxUAAJ1RPPH94glULPsOViDHbfrGFP/Kl4Eg/qE\n9KAXgo1zAgMBAAECggEAN+nNPbGb3n8zXeZatHWPOADHmVDJI8HUcJS5t2Itm16O\n7vfBb/U53hRM0VAbEg51DmgnBaAJsTLX9BBh5XWWKeSmPA/W/Kef0T1z+8Vc3NVa\nmGH/II1VhdYeoq9464DQRo21zO3OKwp2LrXmBhh4jOsEfXnf0ddVcM4TR1pTVgCd\ndemaiW4NeDgx8f5ocAbkDk9YMAm1D+t4+qfbtQdzd9/HU211caGcq6wVR5kxe0Np\n7sQ4K+nOn8TEGSMiV0Qf5djmAUeEWlsTlgo06V2rmldCu1IkDzH405R3XTUq+5CU\nvPj0ZK94isVPFOfPGmIa7QsKqFrpmHeDdzllZQFhkQKBgQDmRxMRdCQq5ZJfquD9\nIIj2ISJcKCjrOLcmUTFHsWMgz2hy+bDCNRWJBAXkiKwPxBW9etMYa8Nz8uoJaK5X\nDh9OTQRSfKMECtm2mz3yrOJtoyP8Amc//uFHD0AkPdxRubN6cH4IuPxzqRjQ7EzN\nL98krD5Ku7JcK+rEsCzSXLB6MQKBgQDXYt6JqJFFrrPWJ90behst4y/nEgEIA93A\nm7hHDOcrWtMOzu8mojfBDkCZSNyEdm92Od4nMpqRtS9vhnk4Wf47PUUhc3zRF1BK\njUAIKZV1bnwW3V9Z0iSz7qL4cTqwTSPcQv1MUIb/h4CDLHFvCmGNkMEYPCikw/Lq\nmwHEWCh04wKBgQDj4LXX8czQvnoJPfqDw6yFlOiBtiQ4Edn8iyBvR/VGxLkh/kGT\nDiEPg/Go5C8RMwQoi+FWK14x4dMEGJleANWuEL0UO86981bbQ+kbu0YfJPA5NM+k\nHsAkJ81bj/P01AXuRmASla0Nb+rk5NJjwtnZWrISFog8eiFLHuRcD+l8IQKBgDx7\nK+hV6G070I4LZaBImoc5K4NkX9vDUiq6z3VMH0HiYC/hVfBwTt2sReGFPz8HDueQ\n+lvhbtwJl8dmaHW1d5lk7BunlV4VgNtebKOeIbT3EGtPQG41f07zbNn82bEWCELa\noMwkNLRedWzgNv4qWRhqlH5crkEOMRFF86oR41JnAoGANRKhHrxtc/cTCbOe9sq9\nUOIqCw0iVQziWHJSZ7o+e1ndJfqAQLriYDh9W6q3219xnZzmFkaLXEoj9P2dkxYm\nelK/Rde6rAFTWMMBgSVd+PJlSXJ01CeUVKc2vA/OONGxMorIVOcMEmlch2eh+kFc\nPki8Hn83J5wXlh09mn3EZRo=\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-pj4hf@singham-hoxcfn.iam.gserviceaccount.com"
  }
}

router.get("/abc",(req,res)=>{
  res.status(200).send("<h1>App is working Fine</h1>");
})

router.post("/", (req, res) => {
  cors(req, res, async () => {
    const { queryInput, sessionId } = req.body;

    const sessionClient = new SessionsClient({ credentials: serviceAccount  });
    const sessionPath = sessionClient.sessionPath("singham-hoxcfn", sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: queryInput,
          languageCode: 'en-US'
        }
      }
    }

    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;

    res.send(result);
  });
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
  FIR.findOne({ _id: id })
    .then(user => {
      res.send(req.user);
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

// AAAAB3NzaC1yc2EAAAADAQABAAABAQCE564UrYm36mpRWlRe/ZBv/5OOyw8OQzG59GURc/VHRORgA/Nkb/I/DNE3XU48ew7jUeASvbiF2Tcon7oFYO9pAzoM90OT3FsFMIfow/72Ols3x+uLKTrGXXYHTlxofOwZB7Q0MpsZGTo+WBzPedzIsCWASctzmyUvycCejUHlWNJ3nqg285IMih63HPs+lYrMv7crTF6cHt8dOlD1TzBunMh5Do+mFXRmfYg9QCrZPP9p3V21YfybiLqvMo/Fp/Kcvrf3IwBHxAnSD1JenmkmzYPSGPk3jSyjn1j7UOURw2Ko5gqipj8AxVqwginkQz+uJWRc7yYuGdsbIcTf7wOn


module.exports = router;
