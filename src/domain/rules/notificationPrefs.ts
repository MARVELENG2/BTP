export interface NotificationPrefs {
  newChapters: boolean
  discussion: boolean
  streak: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newChapters: true,
  discussion: true,
  streak: true,
}