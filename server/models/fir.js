const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var FIRschema = new mongoose.Schema({
  User: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  SHO: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SHO"
    }
  },
  questions: [mongoose.Schema.Types.Mixed],
  location: String,
  hash: String,
  status: Number,
  verified: Boolean,
  timecreated: { type: Date, default: Date.now }
});

var FIR = mongoose.model("FIR", FIRschema);

module.exports = { FIR };
