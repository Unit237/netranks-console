export interface ProjectMembership {
  ProjectId: number;
  ProjectName: string;
  IsOwner: boolean;
  IsEditor: boolean;
  CreatedAt: string;
  MemberId: number;
}

export interface Member {
  Id: number;
  UserId?: number;
  FullName: string;
  Email: string;
  IsOwner: boolean; // True if they're an owner in ANY project
  IsEditor: boolean; // True if they're an editor in ANY project
  CreatedAt: string; // Earliest creation date across all projects
  IsProjectOwner?: boolean; // True if this is the original project owner (cannot be deleted)
  Projects: ProjectMembership[]; // All projects this member belongs to
}
