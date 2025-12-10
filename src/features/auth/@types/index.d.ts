export interface Survey {
  Id: number;
  Name: string | null;
  DescriptionShort: string | null;
  SchedulePeriodHours: number;
  NextRunAt?: string | null; // ISO date string from backend - when survey will run next
  Status?: string; // Calculated from SchedulePeriodHours
  Schedule?: string;
  LastRun?: string; // Formatted from calculated LastRunAt
  LastRunAt?: string | null; // Calculated from NextRunAt - SchedulePeriodHours
  Cost?: string;
  HasIndicator?: boolean;
  CostDisplay?: string;
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
