import { useParams } from "react-router-dom";
import { useUser } from "../../auth/context/UserContext";

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useUser();

  const project = user?.Projects?.find(
    (p) => p.Id === parseInt(projectId || "0", 10)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {project?.Name || "Project"}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Project details and surveys
      </p>
    </div>
  );
};

export default Project;

