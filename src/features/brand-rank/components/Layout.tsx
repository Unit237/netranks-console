import { Outlet } from "react-router-dom";
import OnboardingSessionInitializer from "../../../app/components/OnboardingSessionInitializer";
import Header from "./Header";

const Layout = () => {
  return (
    <>
      <OnboardingSessionInitializer />
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
