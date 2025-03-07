const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var Admin = new mongoose.Schema({
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
      message: "not a valid email"
    }
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

Admin.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ["_id", "name", "email"]);
};

Admin.methods.generateAuthToken = function() {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();
  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
};

Admin.methods.removeToken = function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

Admin.statics.findByToken = function(token) {
  var user = this;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return user.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

Admin.statics.findByCredentials = function(email, password) {
  var Users = this;
  return Users.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

Admin.pre("save", function(next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var Admin = mongoose.model("Admin", Admin);

module.exports = { Admin };
