/** True when LOGIN_EMAIL OTP flow is configured (employees still skip OTP on first step). */
export function isGlobalOtpEnabled(): boolean {
  return !!process.env.ADMIN_EMAIL?.trim()
}
