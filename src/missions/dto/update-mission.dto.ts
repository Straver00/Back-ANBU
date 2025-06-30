export class UpdateMissionDto {
  captain?: string;
  objective?: string;
  deadline?: Date;
  level?: string;
  status?: string;
  isOwner?: boolean;
  assignedAgents?: string[];
}
