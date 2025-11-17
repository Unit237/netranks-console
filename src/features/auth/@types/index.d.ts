interface Survey {
  // Add survey fields here as needed
}

export interface Project {
  Id: number;
  Name: string | null;
  IsActive: boolean;
  IsOwner: boolean;
  IsEditor: boolean;
  Surveys: Survey[];
}

export interface UserData {
  Id: number;
  Name: string | null;
  EMail: string;
  Projects: Project[];
}
