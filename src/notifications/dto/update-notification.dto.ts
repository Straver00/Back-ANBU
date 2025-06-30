export class UpdateNotificationDto {
  isRead?: boolean;
  decisionStatus?: 'accepted' | 'rejected' | null;
}
