import { useNavigate } from "react-router-dom";
import ToggleTheme from "../../../app/shared/components/ToggleTheme";
import AppLogo from "../../../app/shared/ui/AppLogo";

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-transparent">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Right section */}
        <div className="hidden md:flex items-center gap-3">
          <ToggleTheme />

          {/* Settings */}
          <button
            className={`px-3 py-1 text-sm rounded-md border transition-colors hover:bg-gray-100 dark:hover:bg-white/10`}
            onClick={() => navigate("/settings")}
          >
            Settings
          </button>

          {/* Sign in */}
          <button
            className={`px-3 py-1 text-sm rounded-md border transition-colors hover:bg-gray-100 dark:hover:bg-white/10`}
            onClick={() => navigate("/signin")}
          >
            Sign in
          </button>

          {/* Sign up */}
          <button
            className={`px-3 py-1 text-sm rounded-md border transition-colors hover:bg-gray-100 dark:hover:bg-white/10`}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
