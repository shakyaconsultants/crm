/** Employee browser cookie max-age (seconds). Aligned with JWT lifetime. */
export const EMPLOYEE_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/** JWT `exp` for employees — must match cookie duration (jose duration string). */
export const EMPLOYEE_SESSION_JWT_EXP = '30d' as const
