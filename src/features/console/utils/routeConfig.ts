export interface RouteConfig {
  pattern: string | RegExp;
  shouldHaveTab: boolean;
  getTabName?: (path: string, params?: Record<string, string>) => string;
  getHeaderName?: (path: string, params?: Record<string, string>) => string;
}

/**
 * Configuration for console routes
 * Defines which routes should have tabs and how to generate tab names
 */
export const routeConfigs: RouteConfig[] = [
  // Routes that should NOT have tabs (non-tab routes)
  {
    pattern: "/console/members",
    shouldHaveTab: false,
  },
  {
    pattern: "/console/settings",
    shouldHaveTab: false,
  },
  {
    pattern: "/console/alerts",
    shouldHaveTab: false,
  },
  {
    pattern: "/console/support",
    shouldHaveTab: false,
  },
  {
    pattern: "/console/billing",
    shouldHaveTab: false,
  },

  // Routes that SHOULD have tabs
  {
    pattern: "/console",
    shouldHaveTab: true,
    getTabName: () => "Projects",
    getHeaderName: () => "Projects",
  },
  {
    pattern: /^\/console\/project\/(\d+)$/,
    shouldHaveTab: true,
    getTabName: (path, params) => {
      // Try to get project name from user context
      const projectId = params?.projectId;
      if (projectId) {
        // This will be resolved in Console component with access to user context
        return `Project ${projectId}`;
      }
      return "Project";
    },
    getHeaderName: (path, params) => {
      const projectId = params?.projectId;
      if (projectId) {
        return `Project ${projectId}`;
      }
      return "Project";
    },
  },
  {
    pattern: /^\/console\/new-survey\/(\d+)$/,
    shouldHaveTab: true,
    getTabName: () => "New Survey",
    getHeaderName: () => "New Survey",
  },
  {
    pattern: "/console/new-project",
    shouldHaveTab: true,
    getTabName: () => "New Project",
    getHeaderName: () => "New Project",
  },
  {
    pattern: /^\/console\/review-questions\/(\d+)$/,
    shouldHaveTab: true,
    getTabName: () => "Review Questions",
    getHeaderName: () => "Review Questions",
  },
  {
    pattern: /^\/console\/survey\/(\d+)$/,
    shouldHaveTab: true,
    getTabName: () => "Survey Details", // Will be updated by SurveyDetails component
    getHeaderName: () => "Survey Details",
  },
  {
    pattern: /^\/console\/dashboard\/(\d+)\/(.+)\/(.+)$/,
    shouldHaveTab: true,
    getTabName: () => "Dashboard",
    getHeaderName: () => "Dashboard",
  },
  {
    pattern: "/console/brand",
    shouldHaveTab: true,
    getTabName: () => "Brand",
    getHeaderName: () => "Brand",
  },
];

/**
 * Check if a path matches a pattern
 */
function matchesPattern(pattern: string | RegExp, path: string): boolean {
  if (typeof pattern === "string") {
    return pattern === path;
  }
  return pattern.test(path);
}

/**
 * Extract params from a path using a pattern
 */
function extractParams(pattern: string | RegExp, path: string): Record<string, string> | undefined {
  if (typeof pattern === "string") {
    if (pattern === path) {
      return {};
    }
    return undefined;
  }

  const match = path.match(pattern);
  if (!match) {
    return undefined;
  }

  const params: Record<string, string> = {};
  const parts = path.split("/");

  // Extract numeric IDs from path
  if (pattern.source.includes("project") && !pattern.source.includes("new-project")) {
    const projectIndex = parts.indexOf("project");
    if (projectIndex !== -1 && parts.length > projectIndex + 1) {
      params.projectId = parts[projectIndex + 1];
    }
  }

  if (pattern.source.includes("survey") && !pattern.source.includes("dashboard")) {
    const surveyIndex = parts.indexOf("survey");
    if (surveyIndex !== -1 && parts.length > surveyIndex + 1) {
      params.surveyId = parts[surveyIndex + 1];
    }
  }

  if (pattern.source.includes("dashboard")) {
    const dashboardIndex = parts.indexOf("dashboard");
    if (dashboardIndex !== -1 && parts.length > dashboardIndex + 3) {
      params.surveyRunId = parts[dashboardIndex + 1];
      params.p1 = parts[dashboardIndex + 2];
      params.p2 = parts[dashboardIndex + 3];
    }
  }

  if (pattern.source.includes("review-questions")) {
    const reviewIndex = parts.indexOf("review-questions");
    if (reviewIndex !== -1 && parts.length > reviewIndex + 1) {
      params.projectId = parts[reviewIndex + 1];
    }
  }

  if (pattern.source.includes("new-survey")) {
    const newSurveyIndex = parts.indexOf("new-survey");
    if (newSurveyIndex !== -1 && parts.length > newSurveyIndex + 1) {
      params.projectId = parts[newSurveyIndex + 1];
    }
  }

  return params;
}

/**
 * Get route configuration for a given path
 */
export function getRouteConfig(path: string): RouteConfig | null {
  for (const config of routeConfigs) {
    if (matchesPattern(config.pattern, path)) {
      return config;
    }
  }
  return null;
}

/**
 * Get tab metadata for a route
 */
export function getTabMetadata(
  path: string,
  user?: { Projects?: Array<{ Id: number; Name?: string }> }
): { name: string; headerName: string; params?: Record<string, string> } | null {
  const config = getRouteConfig(path);
  if (!config || !config.shouldHaveTab) {
    return null;
  }

  const params = extractParams(config.pattern, path);

  // Resolve project name if we have projectId
  let name = config.getTabName?.(path, params) || "Tab";
  let headerName = config.getHeaderName?.(path, params) || name;

  // Try to resolve project name from user context
  if (params?.projectId && user?.Projects) {
    const project = user.Projects.find((p) => p.Id === Number(params.projectId));
    if (project?.Name) {
      name = project.Name;
      headerName = project.Name;
    }
  }

  return { name, headerName, params };
}

