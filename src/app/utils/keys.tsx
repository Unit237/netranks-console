export default {
  localStorage: {
    SELECTED_LANGUAGE_LOCALE: "SELECTED_LANGUAGE_LOCALE",
    ACTIVE_PROJECT_ID: "ACTIVE_PROJECT_ID",
    NEW_SURVEY: "NEW_SURVEY",
  },

  routes: {
    Root: "/",

    SignIn: "/sign-in",
    SignUp: "/sign-up",
    MagicLinkSent: "/magic-link-sent",

    Profile: (pid: string) => `/p/${pid}/profile`,
    Members: (pid: string) => `/p/${pid}/members`,
    Billing: (pid: string) => `/p/${pid}/billing`,

    ProjectOverview: (pid: string) => `/p/${pid}`,
    Survey: (pid: string, sid: string) => `/p/${pid}/s/${sid}`,
    NewSurvey: (pid: string) => `/p/${pid}/new-survey`,
  },
};
