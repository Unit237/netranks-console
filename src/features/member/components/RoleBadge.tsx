import { Eye, Pencil, Send } from "lucide-react";
import React from "react";
import type { Member } from "../@types";

interface Props {
  member: Member;
}

const RoleBadge: React.FC<Props> = ({ member }) => {
  const currentRole = member.IsOwner
    ? "Owner"
    : member.IsEditor
    ? "Editor"
    : "Viewer";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
        member.IsOwner
          ? "bg-blue-50 text-owner-blue"
          : member.IsEditor
          ? "bg-orange-50 text-editor-orange"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {member.IsOwner ? (
        <Send className="w-3.5 h-3.5 fill-current" />
      ) : member.IsEditor ? (
        <Pencil className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      <span>{currentRole}</span>
    </div>
  );
};

export default RoleBadge;
