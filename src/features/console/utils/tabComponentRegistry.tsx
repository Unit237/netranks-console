import { ComponentType } from "react";
import Alerts from "../pages/Alerts";
import Members from "../pages/Members";
import NewProject from "../pages/NewProject";
import NewSurvey from "../pages/NewSurvey";
import Project from "../pages/Project";
import Settings from "../pages/Settings";
import Support from "../pages/Support";
import Billing from "../../billing/pages/Billing";
import Brand from "../../brand-rank/pages/Brand";
import PricingAndQuestion from "../../brand-rank/pages/PricingAndQuestion";
import SurveyDetails from "../../project/pages/SurveyDetails";
import SurveyDashboard from "../../dashboard/pages/SurveyDashboard";

export interface TabComponentProps {
  path: string;
  params?: Record<string, string>;
}

// Path pattern to component mapping
// Supports exact paths and patterns with params (e.g., /console/project/:projectId)
export const tabComponentRegistry: Array<{
  pattern: string | RegExp;
  component: ComponentType<TabComponentProps>;
  isExact?: boolean;
}> = [
  { pattern: "/console", component: Project, isExact: true },
  { pattern: /^\/console\/project\/(\d+)$/, component: Project },
  { pattern: "/console/alerts", component: Alerts, isExact: true },
  { pattern: "/console/members", component: Members, isExact: true },
  { pattern: "/console/settings", component: Settings, isExact: true },
  { pattern: "/console/support", component: Support, isExact: true },
  { pattern: "/console/billing", component: Billing, isExact: true },
  { pattern: "/console/brand", component: Brand, isExact: true },
  { pattern: /^\/console\/new-survey\/(\d+)$/, component: NewSurvey },
  { pattern: "/console/new-project", component: NewProject, isExact: true },
  { pattern: /^\/console\/review-questions\/(\d+)$/, component: PricingAndQuestion },
  { pattern: /^\/console\/survey\/(\d+)$/, component: SurveyDetails },
  { pattern: /^\/console\/dashboard\/(\d+)\/(.+)\/(.+)$/, component: SurveyDashboard },
];

/**
 * Extract params from a path using a pattern
 */
function extractParams(pattern: string | RegExp, path: string): Record<string, string> | undefined {
  if (typeof pattern === "string") {
    // Simple exact match - no params
    if (pattern === path) {
      return {};
    }
    return undefined;
  }

  // Regex pattern match
  const match = path.match(pattern);
  if (!match) {
    return undefined;
  }

  // Extract named groups or positional params
  const params: Record<string, string> = {};

  // Extract numeric IDs from path
  const parts = path.split("/");

  // For /console/project/:projectId
  if (pattern.source.includes("project") && !pattern.source.includes("new-project")) {
    const projectIndex = parts.indexOf("project");
    if (projectIndex !== -1 && parts.length > projectIndex + 1) {
      params.projectId = parts[projectIndex + 1];
    }
  }

  // For /console/survey/:surveyId
  if (pattern.source.includes("survey") && !pattern.source.includes("dashboard")) {
    const surveyIndex = parts.indexOf("survey");
    if (surveyIndex !== -1 && parts.length > surveyIndex + 1) {
      params.surveyId = parts[surveyIndex + 1];
    }
  }

  // For /console/dashboard/:surveyRunId/:p1/:p2
  if (pattern.source.includes("dashboard")) {
    const dashboardIndex = parts.indexOf("dashboard");
    if (dashboardIndex !== -1 && parts.length > dashboardIndex + 3) {
      params.surveyRunId = parts[dashboardIndex + 1];
      params.p1 = parts[dashboardIndex + 2];
      params.p2 = parts[dashboardIndex + 3];
    }
  }

  // For /console/review-questions/:projectId
  if (pattern.source.includes("review-questions")) {
    const reviewIndex = parts.indexOf("review-questions");
    if (reviewIndex !== -1 && parts.length > reviewIndex + 1) {
      params.projectId = parts[reviewIndex + 1];
    }
  }

  // For /console/new-survey/:projectId
  if (pattern.source.includes("new-survey")) {
    const newSurveyIndex = parts.indexOf("new-survey");
    if (newSurveyIndex !== -1 && parts.length > newSurveyIndex + 1) {
      params.projectId = parts[newSurveyIndex + 1];
    }
  }

  return params;
}

/**
 * Find component for a given path
 */
export function getComponentForPath(path: string): {
  component: ComponentType<TabComponentProps>;
  params?: Record<string, string>;
} | null {
  for (const { pattern, component, isExact } of tabComponentRegistry) {
    if (typeof pattern === "string") {
      if (isExact && pattern === path) {
        return { component, params: {} };
      }
      if (!isExact && path.startsWith(pattern)) {
        return { component, params: {} };
      }
    } else {
      // Regex pattern
      if (pattern.test(path)) {
        const params = extractParams(pattern, path);
        return { component, params };
      }
    }
  }
  return null;
}

