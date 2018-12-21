const request = require("request");

/**
 * Checks for updates and returns status to the callback
 * @param {callbackFunction} callback The callback for results
 */
function checkUpdates(callback) {
  require("pkginfo")(module, "version");
  
  request.get("https://api.github.com/repos/Tutrox/redirect-server/releases/latest", {
    qs: {access_token: process.env.RS_UPDATE_GITHUB},
    json: true,
    headers: {"User-Agent": "redirect-server"}
  }, (err, res, body) => {
    if (err) {
      callback({available: false});
    } else {
      const newestVersion = body.tag_name.slice(1);
      callback({available: newestVersion !== module.exports.version || false, current: module.exports.version, new: newestVersion});
    }
  });
}

/**
 * Checks for updates and sends a notification to the webhook specified in RS_UPDATE_WEBHOOK
 */
function notifyUpdates() {
  //Check and notify
}

module.exports = {
  checkUpdates,
  notifyUpdates
};