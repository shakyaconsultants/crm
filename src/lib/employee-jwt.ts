import type { JWTPayload } from 'jose'
import { isGlobalOtpEnabled } from '@/lib/otp-config'
import { CRM_SESSION_JWT_PURPOSE } from '@/lib/employee-crm-session'

export type AppJwtClaims = JWTPayload & {
  role?: string
  crm?: boolean
  purpose?: string
}

export function employeeHasCrmAccess(payload: AppJwtClaims): boolean {
  if (payload.role !== 'EMPLOYEE') return false
  if (!isGlobalOtpEnabled()) return true
  if (payload.purpose === CRM_SESSION_JWT_PURPOSE && payload.crm === true) return true
  return payload.crm === true
}
