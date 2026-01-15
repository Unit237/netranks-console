import AuthManager, { useIsLoggedIn } from "../auth/AuthManager";

// Backwards compatibility wrapper. All token logic lives in AuthManager.
export default AuthManager;
export { useIsLoggedIn };

