import { Route, Routes } from "react-router-dom";
import MagicLinkSent from "../../features/auth/pages/MagicLinkSent";
import Signin from "../../features/auth/pages/Signin";
import Layout from "../../features/brand-rank/components/Layout";
import BrandRank from "../../features/brand-rank/pages";
import BrandRankSurveyRun from "../../features/brand-rank/pages/BrandRankRunSurvey";
import Questions from "../../features/brand-rank/pages/Questions";
import Settings from "../../features/settings/pages/Settings";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<BrandRank />} />
        <Route path="questions" element={<Questions />} />
        <Route
          path="/brand-rank/survey/:surveyRunId/:p1/:p2"
          element={<BrandRankSurveyRun />}
        />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="signin" element={<Signin />} />
      <Route path="magic-link-sent" element={<MagicLinkSent />} />
    </Routes>
  );
};

export default Router;
