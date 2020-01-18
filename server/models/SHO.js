const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var SHOschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Why no name"],
    minlength: 4
  },
  email: {
    type: String,
    required: [true, "Field Necessary"],
    minlength: 8,
    trim: true,
    unique: true,
    validate: {
      validator: value => {
        return validator.isEmail(value);
      },
      message: "{VALUE} is not a valid email"
    }
  },
  location: {
    type: String,
    required: [true, "Field Necessary"]
  },
  age: {
    type: Number,
    required: [true, "Field Necessary"],
    minlength: 1
  },
  password: {
    type: String,
    required: [true, "Field Necessary"],
    minlength: 8
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

SHOschema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ["_id", "name", "email", "age"]);
};

SHOschema.methods.generateAuthToken = function() {
  var sho = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: sho._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();
  user.tokens.push({ access, token });
  return sho.save().then(() => {
    return token;
  });
};

SHOschema.methods.removeToken = function(token) {
  var sho = this;
  return sho.update({
    $pull: {
      tokens: { token }
    }
  });
};

SHOschema.statics.findByToken = function(token) {
  var sho = this;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return sho.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

SHOschema.statics.findByCredentials = function(email, password) {
  var SHOs = this;
  return SHOs.findOne({ email }).then(sho => {
    if (!sho) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, sho.password, (err, res) => {
        if (res) {
          resolve(sho);
        } else {
          reject();
        }
      });
    });
  });
};

SHOschema.pre("save", function(next) {
  var sho = this;
  if (sho.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(sho.password, salt, (err, hash) => {
        sho.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var SHO = mongoose.model("SHO", SHOschema);
module.exports = {
  SHO
};
