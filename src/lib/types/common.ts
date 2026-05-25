export type ID = string
export type UserRole = 'owner' | 'admin' | 'lawyer' | 'assistant'
export type PlanType = 'starter' | 'pro' | 'enterprise'

export interface User {
  id: ID
  name: string
  email: string
  avatar?: string
  oab?: string
  bio?: string
  specialties?: string[]
  role: UserRole
  officeId: ID
  createdAt: string
}

export interface Office {
  id: ID
  name: string
  slug: string
  slogan?: string
  logo?: string
  cnpj?: string
  address?: string
  phone?: string
  email?: string
  plan: PlanType
  createdAt: string
}

export interface TeamMember {
  id: ID
  userId: ID
  officeId: ID
  role: UserRole
  name: string
  email: string
  avatar?: string
  oab?: string
  active: boolean
  joinedAt: string
}
