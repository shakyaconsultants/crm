import type { EmployeeIntakeForm } from '@/lib/employee-intake-form'

type IntakeSection = {
  title: string
  fields: (keyof EmployeeIntakeForm)[]
}

export const INTAKE_DISPLAY_SECTIONS: IntakeSection[] = [
  {
    title: 'Contact',
    fields: ['fullName', 'callingNumber', 'whatsappSameAsCalling', 'whatsappNumber', 'emailAddress', 'dateOfBirth'],
  },
  {
    title: 'Address & Family',
    fields: ['addressHistory', 'livingSituation', 'housingStatus', 'children', 'dependentsCount'],
  },
  {
    title: 'Employment & Income',
    fields: ['employmentStatus', 'employerName', 'jobTitle', 'incomeAmount', 'incomes', 'benefits'],
  },
  {
    title: 'Expenses & Banking',
    fields: ['rentArrears', 'expensesPreset', 'expensesExtra', 'monthlyExpenses', 'bankNames', 'accountType'],
  },
  {
    title: 'Debts & Legal',
    fields: ['debts', 'totalDebtAmount', 'numberOfCreditors', 'ccjs', 'councilTaxAmount', 'councilName'],
  },
  {
    title: 'Assets & Risk',
    fields: ['hasCar', 'carName', 'carRegistrationNumber', 'propertyOwnership', 'savingsInvestments', 'financialDifficultyLevel'],
  },
  {
    title: 'Notes',
    fields: ['internalNotes', 'affordabilitySummary', 'transactionFlags', 'transactionIncomeNotes', 'transactionExpenseNotes'],
  },
]

export function intakeFieldLabel(key: string): string {
  const explicit: Record<string, string> = {
    fullName: 'Full name',
    callingNumber: 'Calling number',
    whatsappSameAsCalling: 'WhatsApp same as calling',
    whatsappNumber: 'WhatsApp number',
    emailAddress: 'Email',
    dateOfBirth: 'DOB',
    niNumber: 'NI number',
    preSipAt: 'Pre-SIP',
    ccjs: 'CCJs',
  }
  if (explicit[key]) return explicit[key]
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
}

export function intakeValueToText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return value
      .map((row, idx) => {
        if (row === null || row === undefined) return `${idx + 1}. —`
        if (typeof row !== 'object') return `${idx + 1}. ${String(row)}`
        const entries = Object.entries(row as Record<string, unknown>)
          .map(([k, v]) => `${intakeFieldLabel(k)}: ${intakeValueToText(v)}`)
          .join(', ')
        return `${idx + 1}. ${entries || '—'}`
      })
      .join('\n')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${intakeFieldLabel(k)}: ${intakeValueToText(v)}`)
      .join(', ')
    return entries || '—'
  }
  return String(value)
}
