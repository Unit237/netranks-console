import { Trash2 } from "lucide-react";
import React from "react";
import type { Member } from "../@types";
import { formatDate, formatFullDate } from "../utils/utils";
import RoleBadge from "./RoleBadge";

interface MemberCardProps {
  member: Member;
  setDeleteConfirmId: React.Dispatch<
    React.SetStateAction<{ memberId: number; projectId: number } | null>
  >;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  setDeleteConfirmId,
}) => {
  return (
    <div key={member.Email} className="p-4 hover:bg-hover-bg transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-900 mb-1">
            {member.FullName}
          </div>
          <div className="text-sm text-muted-text mb-2">{member.Email}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {member.Projects && member.Projects.length > 0 ? (
              member.Projects.map((project, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {project.ProjectName}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-text">No projects</span>
            )}
          </div>
        </div>
        {member.Projects &&
          member.Projects.length > 0 &&
          member.Projects.some(() => !member.IsProjectOwner) && (
            <button
              onClick={() => {
                // Use the first project's member ID for deletion
                const firstProject = member.Projects[0];
                setDeleteConfirmId({
                  memberId: firstProject.MemberId,
                  projectId: firstProject.ProjectId,
                });
              }}
              className="text-trash-red hover:text-red-700 transition-colors ml-2"
              aria-label={`Remove ${member.FullName}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-text">
          Added:{" "}
          {member.CreatedAt ? (
            <span
              title={formatFullDate(member.CreatedAt)}
              className="cursor-help"
            >
              {formatDate(member.CreatedAt)}
            </span>
          ) : (
            "—"
          )}
        </div>
        <div>
          <RoleBadge member={member} />
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
