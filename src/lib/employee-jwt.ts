import type { JWTPayload } from 'jose'
import { isGlobalOtpEnabled } from '@/lib/otp-config'

export type AppJwtClaims = JWTPayload & {
  role?: string
  crm?: boolean
}

export function employeeHasCrmAccess(payload: AppJwtClaims): boolean {
  if (payload.role !== 'EMPLOYEE') return false
  if (!isGlobalOtpEnabled()) return true
  return payload.crm === true
}
