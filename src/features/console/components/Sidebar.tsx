import { ChevronDown, Plus, Search, Settings, Users, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import token from "../../../app/utils/token";
import { truncate } from "../../../app/utils/utils";
import { useUser } from "../../auth/context/UserContext";

const Sidebar = () => {
  const { user } = useUser();
  // const { tabs } = useTabs(); // tabs not currently used
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if we're on the dashboard route
  const isDashboardRoute = location.pathname.startsWith("/console/dashboard/");

  // Check if current location has a tab (is available in tabs)
  // const currentTab = tabs.find((tab) => tab.path === location.pathname);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const authToken = token.get();
    return !!authToken && !!user;
  };

  // Handle click to redirect to signin if not authenticated
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/signin");
    }
  };

  const sidebarLinks: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    headerName: string;
  }> = [
    // {
    //   icon: LayoutDashboard,
    //   label: "Dashboard",
    //   path: "/console",
    //   headerName: "Q3 Overview",
    // },
    // {
    //   icon: Bell,
    //   label: "Alerts",
    //   path: "/console/alerts",
    //   headerName: "Alert",
    // },
  ];

  const handleSidebarLinkClick = (path: string) => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    // addTab({
    //   name: label,
    //   path: path,
    //   headerName: headerName,
    // });
    navigate(path);
  };

  const handleProjectClick = (
    projectId: number,
    _projectName: string,
    _headerName: string
  ) => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    navigate(`/console/project/${projectId}`);
  };

  const handleNewProject = () => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    navigate("/console/new-project");
  };

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery(""); // Clear search when closing
    }
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!user?.Projects) return [];

    if (!searchQuery.trim()) {
      return [...user.Projects].sort((a, b) => b.Id - a.Id);
    }

    const query = searchQuery.toLowerCase().trim();
    return [...user.Projects]
      .filter((project) => {
        const projectName = (project.Name || "Untitled Project").toLowerCase();
        return projectName.includes(query);
      })
      .sort((a, b) => b.Id - a.Id);
  }, [user?.Projects, searchQuery]);

  // const handleSupportClick = () => {
  //   if (!isAuthenticated()) {
  //     navigate("/signin");
  //     return;
  //   }
  //   addTab({
  //     name: "Support",
  //     path: "/console/support",
  //     headerName: "Support",
  //   });
  //   navigate("/console/support");
  // };

  return (
    <div
      onClick={handleClick}
      className={`bg-gray-200 dark:bg-gray-900 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${!isAuthenticated() ? "cursor-pointer" : ""}`}
    >
      {/* User Section */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 -mx-2 text-xs font-medium text-gray-900 dark:text-gray-100 truncate"
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-md"></div>
                <div className="flex items-center min-w-0">
                  <p className="">
                    {user?.Name || truncate(user?.EMail, 10) || "User"}
                  </p>
                  <p className="ml-1">Workspace</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
              >
                <path
                  fill="currentColor"
                  d="M6 21a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3zM18 5h-8v14h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
              >
                <path
                  fill="currentColor"
                  d="M6 21a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3zM18 5h-8v14h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex flex-col px-2 py-4">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projects
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSearchClick}
                  className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors ${
                    showSearchInput ? "bg-gray-200 dark:bg-gray-700" : ""
                  }`}
                  title="Search projects"
                >
                  <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleNewProject}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Add new project"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            {showSearchInput && (
              <div className="mb-3 px-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-9 pr-8 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className={`space-y-1 ${isCollapsed ? "max-h-96" : "max-h-64"} overflow-y-auto`}>
          {/* Show "Full demo project" when on dashboard route */}
          {isDashboardRoute && (
            <button
              onClick={() => {
                if (!isAuthenticated()) {
                  navigate("/signin");
                  return;
                }
                handleProjectClick(
                  9999,
                  "Full Demo Project",
                  "Full Demo Project"
                );
              }}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${
                isCollapsed ? "justify-center" : "text-left bg-white"
              }`}
              title={isCollapsed ? "Full Demo Project" : undefined}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 bg-primary rounded-md p-[2px] text-white"
              >
                <path
                  fill="currentColor"
                  d="M12.865 2.996a1 1 0 0 0-1.73 0L8.421 7.674a1.25 1.25 0 0 1-.894.608L2.44 9.05c-.854.13-1.154 1.208-.488 1.76l3.789 3.138c.35.291.515.75.43 1.197L5.18 20.35a1 1 0 0 0 1.448 1.072l4.79-2.522a1.25 1.25 0 0 1 1.164 0l4.79 2.522a1 1 0 0 0 1.448-1.072l-.991-5.205a1.25 1.25 0 0 1 .43-1.197l3.79-3.139c.665-.55.365-1.63-.49-1.759l-5.085-.768a1.25 1.25 0 0 1-.895-.608z"
                />
              </svg>
              {!isCollapsed && <span className="flex-1 truncate">Full Demo Project</span>}
            </button>
          )}
          {filteredProjects && filteredProjects.length > 0
            ? filteredProjects.map((project) => {
                  const projectPath = `/console/project/${project.Id}`;
                  const isActiveProject = location.pathname === projectPath;
                  return (
                    <button
                      key={project.Id}
                      onClick={() =>
                        handleProjectClick(
                          project.Id,
                          project.Name || "Untitled Project",
                          project.Name || "Untitled Project"
                        )
                      }
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                        isCollapsed ? "justify-center" : "text-left"
                      } ${
                        isActiveProject
                          ? "bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      title={isCollapsed ? project.Name || "Untitled Project" : undefined}
                    >
                      <div className="h-4 w-4 flex items-center justify-center bg-gray-400 rounded-md p-[2px] text-black text-[11px]">
                        <p>{project.Name?.at(0) || "U"}</p>
                      </div>

                      {!isCollapsed && (
                        <span className="flex-1 truncate">
                          {project.Name || "Untitled Project"}
                        </span>
                      )}
                    </button>
                  );
                })
            : !isCollapsed && !isDashboardRoute && (
                <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {searchQuery.trim() ? "No projects found" : "No projects"}
                </p>
              )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col py-4 px-2 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActiveLink = location.pathname === link.path;

          // isCurrentPageInTabs &&
          return (
            <button
              key={link.path}
              onClick={() => handleSidebarLinkClick(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center" : "justify-start"
              } ${
                isActiveLink
                  ? "bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Operational Items - Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 mt-auto space-y-1">
        <button
          onClick={() => handleSidebarLinkClick("/console/members")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? "justify-center" : "justify-start"
          } ${
            location.pathname === "/console/members"
              ? "bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title={isCollapsed ? "Members" : undefined}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Members</span>}
        </button>
        <button
          onClick={() => handleSidebarLinkClick("/console/settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? "justify-center" : "justify-start"
          } ${
            location.pathname === "/console/settings"
              ? "bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
