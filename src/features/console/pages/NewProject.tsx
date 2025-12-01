import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../app/providers/ToastProvider";
import { useUser } from "../../auth/context/UserContext";
import { createProject } from "../../brand-rank/services/brandService";

const NewProject = () => {
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshUser } = useUser();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddProject();
    }
  };

  const handleAddProject = async () => {
    setIsSubmitting(true);

    try {
      const projectId = await createProject(projectName);
      setIsSubmitting(false);

      toast.success({
        title: "Success",
        message: "Project created successfully",
      });
      refreshUser();
      navigate(`/console/project/${projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error({
        title: "Error",
        message: "Failed to create project. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[30vw] max-auto pl-4 pr-2 py-1 border border-gray-200 dark:border-gray-700 rounded-[20px] bg-white dark:bg-gray-800/50">
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your project name..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-white focus:border-transparent"
            disabled={isSubmitting}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleAddProject}
              disabled={!projectName.trim() || isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-full hover:bg-orange-700 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
