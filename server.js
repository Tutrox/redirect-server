require("dotenv").config();
require("pkginfo")(module, "version");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const memcache = require("memory-cache");
const db = require("./db");

app.use(bodyParser.urlencoded({extended: true}));

const cache = (req, res, next) => {
  let cachekey = memcache.get(req.params.redir);
  if (cachekey) {
    res.redirect(cachekey.type, cachekey.destination);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.send(`redirect-server ${module.exports.version} / ${process.env.RS_NAME}`);
});

app.get("/:redir", cache, (req, res) => {
  db.findOne({path: req.params.redir}, (err, redirect) => {
    if (err || !redirect) {
      res.status(404).send("No redirect found");
    } else {
      res.redirect(redirect.type, redirect.destination);
      memcache.put(redirect.path, redirect);
    }
  });
});

app.listen(process.env.RS_PORT, () => console.log(`redirect-server is running on port ${process.env.RS_PORT}`));