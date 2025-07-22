export enum NotificationType {
  // Relacionadas con misiones
  MISSION_DELAYED = 'mission_delayed',
  MISSION_FAILED = 'mission_failed',
  MISSION_BOUNTY = 'mission_bounty',

  // Acciones del usuario
  MISSION_JOIN_REQUEST = 'mission_join_request', // requiere decisión

  // Comunicación
  MESSAGE = 'message',

  // Informativas genéricas (opcional mantener)
  INFO = 'info',
}
