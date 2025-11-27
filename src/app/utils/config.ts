const devServerId = 1; // 0: localhost, 1: netranks server

const SERVER = import.meta.env.VITE_DEMO_BACKEND_API_URL;
const netranksDomain = import.meta.env.VITE_NETRANKS_DOMAIN;

const SERVER_URL = import.meta.env.VITE_PROD
  ? SERVER
  : ["/", SERVER][devServerId];

export default {
  SERVER_URL,
  netranksDomain: netranksDomain,

  netranksSessionKey: {
    words: [1313166418, 1095650131, 1600082757, 1129465172],
    sigBytes: 16,
  }, // CryptoJS.enc.Utf8.parse("NETRANKS__SECRET")

  Colors: {
    Blue: "#008AD0",
    Green: "#2ADB50",
    Red: "#ff5757",
  },
};
