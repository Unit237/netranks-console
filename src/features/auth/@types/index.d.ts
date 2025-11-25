export interface Survey {
  Id: number;
  Name: string | null;
  DescriptionShort: string | null;
  SchedulePeriodHours: number;
  Status: string;
  Schedule: string;
  LastRun: string;
  Cost: string;
  HasIndicator: boolean;
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
