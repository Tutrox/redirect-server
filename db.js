const mongoose = require("mongoose");
mongoose.connect(process.env.RS_DATABASE);

const Redirect = mongoose.model("redirect", {
  path: {type: String, required: true},
  destination: {type: String, required: true},
  type: {type: Number, required: true},
  info: String,
  expires: Date
});

module.exports = Redirect;