import { Link } from "react-router-dom";
import Logo from "../../../assets/logo.svg";

export default function AppLogo() {
  return (
    <Link
      to="/"
      className="flex items-center w-[125px] no-underline cursor-pointer"
    >
      <img src={Logo} alt="Netranks Logo" className="h-[22px] w-[22px] mr-2" />
      <span className={`text-lg font-semibold`}>netranks</span>
    </Link>
  );
}
