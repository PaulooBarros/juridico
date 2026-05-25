import type { ID } from './common'

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'info'
export type NotificationType =
  | 'deadline_due' | 'deadline_overdue' | 'case_updated'
  | 'document_added' | 'payment_received' | 'payment_overdue'
  | 'new_member' | 'system'

export interface Notification {
  id: ID
  officeId: ID
  userId: ID
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}
