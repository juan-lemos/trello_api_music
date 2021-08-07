const https = require("https");

/**
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {Object} data
 * @return {Promise} a promise of request
 */
function doRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
        ...options,
      },
      (res) => {
        res.setEncoding("utf8");
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(responseBody));
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

module.exports = { doRequest };
