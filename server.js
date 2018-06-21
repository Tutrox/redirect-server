require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db");

app.set("view engine", "pug");
app.locals.title = `${process.env.RS_NAME} – redirect-server`;
app.locals.name = process.env.RS_NAME;
app.use("/rs/assets", express.static("assets"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("redirect-server");
});

app.get("/rs", (req, res) => {
  db.find({}, (err, redirects) => {
    res.render("index", {redirects});
  });
});

app.get("/rs/manage", (req, res) => {
  res.render("manage", {domain: `${req.hostname}/`, method: "POST"});
});

app.get("/rs/manage/:redir", (req, res) => {
  db.find({path: req.params.redir}, (err, redirect) => {
    res.render("manage", {domain: `${req.hostname}/`, method: "PATCH", err, redirect: redirect[0]});
  });
});

app.post("/rs/manage", (req, res) => {
  db.create(req.body, (err, redirect) => {
    res.render("manage", {domain: `${req.hostname}/`, method: "POST", err, created: redirect});
  });
});

app.patch("/rs/manage", (req, res) => {
  db.findOneAndUpdate({path: req.body.path}, req.body, {runValidators: true}, (err, redirect) => {
    res.render("manage", {domain: `${req.hostname}/`, method: "POST", err, created: redirect});
  });
});

app.get("/:redir", (req, res) => {
  res.send(req.params.redir);
});

app.listen(process.env.RS_PORT, () => console.log(`redirect-server is running on port ${process.env.RS_PORT}`));