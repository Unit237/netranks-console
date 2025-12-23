import { Route, Routes } from "react-router-dom";
import MagicLinkHandler from "../../features/auth/components/MagicLinkHandler";
import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import CompleteProfile from "../../features/auth/pages/CompleteProfile";
import MagicLinkSent from "../../features/auth/pages/MagicLinkSent";
import Signin from "../../features/auth/pages/Signin";
import Billing from "../../features/billing/pages/Billing";
import Layout from "../../features/brand-rank/components/Layout";
import BrandRank from "../../features/brand-rank/pages";
import Brand from "../../features/brand-rank/pages/Brand";
import BrandRankSurveyRun from "../../features/brand-rank/pages/BrandRankRunSurvey";
import Questions from "../../features/brand-rank/pages/Questions";
import PricingAndQuestion from "../../features/brand-rank/pages/ReviewAndQuestion";
import Alerts from "../../features/console/pages/Alerts";
import Console from "../../features/console/pages/Console";
import Members from "../../features/console/pages/Members";
import NewProject from "../../features/console/pages/NewProject";
import NewSurvey from "../../features/console/pages/NewSurvey";
import Project from "../../features/console/pages/Project";
import Support from "../../features/console/pages/Support";
import SurveyDashboard from "../../features/dashboard/pages/SurveyDashboard";
import SurveyDetails from "../../features/project/pages/SurveyDetails";
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
        <Route
          path="/dashboard/:surveyRunId/:p1/:p2"
          element={<SurveyDashboard />}
        />
      </Route>
      <Route path="signin" element={<Signin />} />
      <Route path="complete-profile" element={<CompleteProfile />} />
      <Route path="magic-link-sent" element={<MagicLinkSent />} />
      <Route path="login/:magicLinkId/:p1/:p2" element={<MagicLinkHandler />} />
      <Route path=":magicLinkId/:p1/:p2" element={<MagicLinkHandler />} />
      <Route
        path="console"
        element={
          <ProtectedRoute>
            <Console />
          </ProtectedRoute>
        }
      >
        <Route index element={<Project />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="members" element={<Members />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<Support />} />
        <Route path="billing" element={<Billing />} />
        <Route path="brand" element={<Brand />} />
        <Route path="project/:projectId" element={<Project />} />
        <Route path="new-survey/:projectId" element={<NewSurvey />} />
        <Route path="new-project" element={<NewProject />} />
        <Route
          path="review-questions/:projectId"
          element={<PricingAndQuestion />}
        />
        <Route path="survey/:surveyId" element={<SurveyDetails />} />
        <Route
          path="dashboard/:surveyRunId/:p1/:p2"
          element={<SurveyDashboard />}
        />
      </Route>
    </Routes>
  );
};

export default Router;
