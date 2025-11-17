import {
  Bell,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../context/TabContext";

const Sidebar = () => {
  const { user } = useUser();
  const { addTab } = useTabs();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/console/dashboard" },
    { icon: Bell, label: "Alerts", path: "/console/alerts" },
    { icon: Users, label: "Members", path: "/console/members" },
    { icon: Settings, label: "Settings", path: "/console/settings" },
  ];

  const handleSidebarLinkClick = (path: string, label: string) => {
    addTab({
      name: label,
      path: path,
    });
    navigate(path);
  };

  const handleProjectClick = (projectId: number, projectName: string) => {
    addTab({
      name: projectName || "Untitled Project",
      path: `/console/project/${projectId}`,
      isProject: true,
      projectId,
    });
    navigate(`/console/project/${projectId}`);
  };

  const handleNewTab = () => {
    addTab({
      name: "untitled survey",
      path: "/console/brand",
    });
    navigate("/console/brand");
  };

  const handleSupportClick = () => {
    addTab({
      name: "Support",
      path: "/console/support",
    });
    navigate("/console/support");
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 -mx-2 text-xs font-medium text-gray-900 dark:text-gray-100 truncate"
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-md"></div>
                <div className="flex items-center min-w-0">
                  <p className="">{user?.Name || "User"}</p>
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

      {/* Navigation Links */}
      <nav className="flex flex-col py-4 px-2 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => handleSidebarLinkClick(link.path, link.label)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center" : "justify-start"
              } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Projects Section */}
      {!isCollapsed && (
        <div className="flex-1 px-2 py-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Projects
            </span>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Search projects"
              >
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleNewTab}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Add new tab"
              >
                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {user?.Projects && user.Projects.length > 0 ? (
              user.Projects.map((project) => (
                <button
                  key={project.Id}
                  onClick={() =>
                    handleProjectClick(
                      project.Id,
                      project.Name || "Untitled Project"
                    )
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="flex-1 truncate">
                    {project.Name || "Untitled Project"}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                No projects
              </p>
            )}
          </div>
        </div>
      )}

      {/* Support Link */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        <button
          onClick={handleSupportClick}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? "justify-center" : "justify-start"
          } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
          title={isCollapsed ? "Support" : undefined}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Support</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
