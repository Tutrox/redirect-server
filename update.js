const request = require("request");
const jwt = require("jsonwebtoken");

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

let notified = false;

/**
 * Checks for updates and sends a notification to the webhook specified in RS_UPDATE_WEBHOOK
 */
function notifyUpdates() {
  if (process.env.RS_UPDATE_WEBHOOK && !notified) {
    checkUpdates(status => {
      if (status.available) {
        jwt.sign({}, process.env.RS_SECRET, {expiresIn: "1m", issuer: process.env.RS_NAME}, (err, token) => {
          if (!err) {
            const info = `${process.env.RS_ADRESS}/${process.env.RS_MANAGEMENT_PATH || "rs"}/info?token=${token}`;
            
            request.post(process.env.RS_UPDATE_WEBHOOK, {
              json: {
                text: `redirect-server \`${process.env.RS_NAME}\` has a new version (*${status.new}*) available. _The current version is ${status.current}_.`,
                attachments: [{
                  fallback: `You can read more at ${info}`,
                  actions: [{
                    type: "button",
                    text: "Read more",
                    url: info
                  }]
                }]
              }
            }, err => {
              if (err) {
                // eslint-disable-next-line no-console
                console.log(`redirect-server has a new version (${status.new}) but notifying to webhook failed (request error)`);
              } else {
                // eslint-disable-next-line no-console
                console.log(`redirect-server has a new version (${status.new}). Notification sent to webhook`);
              }
              notified = true;
            });
          } else {
            // eslint-disable-next-line no-console
            console.log(`redirect-server has a new version (${status.new}) but notifying to webhook failed (jwt sign failed)`);
          }
        });
      }
    });
  }
}

module.exports = {
  checkUpdates,
  notifyUpdates
};