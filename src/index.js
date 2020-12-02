const https = require("https");

const synthesize = (() => {
  const options = {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    hostname: "translate.google.com",
    method: "POST",
    path: "/_/TranslateWebserverUi/data/batchexecute",
  };

  const body = ({ text, voice }) => {
    const values = JSON.stringify([text, voice, null, "null"]);
    const data = JSON.stringify([[["jQ1olc", values, null, "generic"]]]);
    const params = new URLSearchParams({ "f.req": data });
    return params.toString();
  };

  const request = ({ text, voice }) =>
    new Promise((resolve, reject) => {
      const request = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data = data + chunk));
        res.on("end", () => resolve(data));
      });
      request.write(body({ text, voice }));
      request.on("error", reject);
      request.end();
    });

  /* Response looks like:
   *
   *   )]}'
   *
   *   [["wrb.fr","jQ1olc","[\"<base 64 data>\"]"]]
   *   ,["di",52]
   *   ,["af.httprm",51,"8692744518077823928",2]
   *   ]
   */
  const toBuffer = (response) => {
    const slice = response.split("\n").slice(1).join("");
    const json = JSON.parse(slice);
    const dataString = json[0][2];
    const dataArray = JSON.parse(dataString);
    return Buffer.from(dataArray[0], "base64");
  };

  return ({ text, voice }) => request({ text, voice }).then(toBuffer);
})();

const tts = { synthesize };

module.exports = tts;