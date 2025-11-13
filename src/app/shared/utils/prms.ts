const devServerId = 1; // 0: localhost, 1: netranks server

const SERVER = "https://netranks.azurewebsites.net/";

const SERVER_URL = import.meta.env.PROD ? SERVER : ["/", SERVER][devServerId];

export default {
  SERVER_URL,
  netranksDomain: "https://www.netranks.ai",

  netranksSessionKey: {
    words: [1313166418, 1095650131, 1600082757, 1129465172],
    sigBytes: 16,
  },

  Colors: {
    Blue: "#008AD0",
    Green: "#2ADB50",
    Red: "#ff5757",
  },
};
