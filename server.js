require("dotenv").config();
require("pkginfo")(module, "version");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const memcache = require("memory-cache");
const db = require("./db");
const jwt = require("jsonwebtoken");
const update = require("./update");

app.use(bodyParser.urlencoded({extended: true}));

const auth = (req, res, next) => {
  jwt.verify(req.query.token, process.env.RS_SECRET, {issuer: process.env.RS_NAME}, err => {
    if (err) {
      res.status(401).send("Authentication error");
    } else {
      next();
    }
  });
};

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

const management = process.env.RS_MANAGEMENT_PATH || "rs";

app.get(`/${management}/info`, auth, (req, res) => {
  update.checkUpdates(status => {
    res.send(`redirect-server (${process.env.RS_NAME}) v${module.exports.version}
    Thanks for using redirect-server by Klooven!
    
    Update status: ${status.available ? `Version ${status.new} is available. Your version is ${status.current}` : "You're up to date!"}

    Before updating, see the changelog: https://github.com/Tutrox/redirect-server/releases
    We try to follow semver.`);
  });
});

app.delete(`/${management}/cache/:redir`, auth, (req, res) => {
  memcache.del(req.params.redir);
  res.send(`${req.params.redir} removed from cache`);
});

/*eslint-disable no-console*/
app.listen(process.env.RS_PORT, () => {
  console.log(`redirect-server (${process.env.RS_NAME}) is running on ${process.env.RS_ADRESS}`);

  update.notifyUpdates();
  
  if (!process.env.RS_NAME || !process.env.RS_PORT || !process.env.RS_DATABASE || !process.env.RS_SECRET || !process.env.RS_ADRESS) {
    console.log(`
    ----------------------------------------------------------------------
    Required configuration not completed. Server NOT READY FOR PRODUCTION!
    ----------------------------------------------------------------------`);
  }
  if (!process.env.RS_UPDATE_WEBHOOK) {
    console.log("\nAutomatic update notifications not enabled. Consider enabling them.");
  }
});
/*eslint-enable no-console*/