import { AuthService, useIsLoggedIn } from "../auth/AuthManager";

// Backwards compatibility wrapper. All token logic lives in AuthService.
export default AuthService;
export { useIsLoggedIn };

