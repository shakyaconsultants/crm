/**
 * Assign or transfer a lead to an employee.
 * Only ownership + date change — disposition, intake, callback, advisor fields stay as-is.
 */
export function employeeAssignUpdate(assignedToId: string) {
  return {
    assignedToId,
    assignedDate: new Date(),
  }
}

/** Totally unassigned (no employee) — used by AUTO SELECT for first-time assignment. */
export function isTotallyUnassignedLead(lead: {
  assignedToId?: string | null
}): boolean {
  return !lead.assignedToId || lead.assignedToId === ''
}
