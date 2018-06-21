require("dotenv").config();
require("pkginfo")(module, "version");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send(`redirect-server ${module.exports.version} / ${process.env.RS_NAME}`);
});

app.get("/:redir", (req, res) => {
  db.findOne({path: req.params.redir}, (err, redirect) => {
    console.log(redirect);
    if (err || !redirect) {
      res.status(404).send("No redirect found");
    } else {
      res.redirect(redirect.type, redirect.destination);
    }
  });
});

app.listen(process.env.RS_PORT, () => console.log(`redirect-server is running on port ${process.env.RS_PORT}`));