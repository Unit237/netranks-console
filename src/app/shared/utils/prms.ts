const devServerId = 1; // 0: localhost, 1: netranks server

const SERVER = import.meta.env.VITE_DEMO_BACKEND_API_URL;
const netranksDomain = import.meta.env.VITE_NETRANKS_DOMAIN;

const SERVER_URL = import.meta.env.VITE_PROD
  ? SERVER
  : ["/", SERVER][devServerId];

const API_BASE_URL = "https://qmnga6hmp3.eu-central-1.awsapprunner.com";

export default {
  SERVER_URL,
  netranksDomain: netranksDomain,
  API_BASE_URL,

  stripePublishableKey:
    "pk_live_51RpphHPDJ4afO8q12iGI2kehYxtGaa2FV4nAghat1ZQ7rvlXcBw9TMq92K2g3nEkLjrXFWozrxUdfCyW3qUEz9xM00uYusWOZl",

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
