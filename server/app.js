const express = require("express");

require("./config/config.js");
var cors = require("cors");
var app = express();

app.use(cors());
const bodyParser = require("body-parser");

// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

const router = require("./routes/myroutes.js");

app.use(router);

app.listen(port, () => {
  console.log(`Started up at port:${port}`);
});

module.exports = { app };
