export type AddressHistoryRow = {
  fullAddress: string
  postCode: string
  type: 'CURRENT' | 'PREVIOUS'
  durationMonths: number
}

export type ChildRow = { name: string; dob: string }
export type IncomeRow = {
  source: string
  amount: string
  frequency: 'MONTHLY' | 'WEEKLY' | ''
  dateReceived: string
}
export type DebtRow = {
  creditorName: string
  accountCount: string
  balance: string
  percentageOfTotal: string
  status: 'DEFAULT' | 'ACTIVE' | 'COLLECTION' | ''
}
export type CcjRow = {
  caseNumber: string
  courtName: string
  courtDate: string
  judgmentValue: string
  satisfied: boolean
  originalCreditorName: string
  originalCreditorReferenceNumber: string
  solicitorName: string
}
export type FamilyTransferRow = {
  name: string
  relationship: string
  amountSent: string
  amountReceived: string
  frequency: string
}

export type EmployeeIntakeForm = {
  dateOfBirth: string
  maritalStatus: 'SINGLE' | 'MARRIED' | 'PARTNER' | ''
  niNumber: string
  secondaryNumber: string
  emailAddress: string
  addressHistory: AddressHistoryRow[]
  livingSituation: 'ALONE' | 'PARTNER' | 'PARENTS' | 'SHARED' | ''
  partnerName: string
  partnerDob: string
  dependentsCount: string
  children: ChildRow[]
  employmentStatus: 'FT' | 'PT' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | ''
  employerName: string
  jobTitle: string
  payslipAvailable: boolean
  incomes: IncomeRow[]
  bankNames: string
  accountType: 'CURRENT' | 'SAVINGS' | ''
  statementsAvailable: boolean
  totalDebtAmount: string
  numberOfCreditors: string
  debts: DebtRow[]
  ccjs: CcjRow[]
  councilTaxAmount: string
  councilName: string
  rentArrears: string
  utilitiesDebt: string
  waterDebt: string
  hmrcDebt: string
  benefitOverpayments: string
  monthlyExpenses: string
  transactionIncomeNotes: string
  transactionExpenseNotes: string
  transactionFlags: string
  familyTransfers: FamilyTransferRow[]
  hasCar: boolean
  carRegistrationNumber: string
  propertyOwnership: string
  savingsInvestments: string
  idProofProvided: boolean
  payslipsProvided: boolean
  bankStatementsProvided: boolean
  benefitStatementsProvided: boolean
  councilTaxStatementProvided: boolean
  creditReportsProvided: boolean
  financialDifficultyLevel: string
  missedPayments: string
  defaults: string
  ccjRisk: string
  vulnerability: string
  internalNotes: string
  affordabilitySummary: string
}

function parseNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function parseArray<T>(value: unknown, map: (row: unknown) => T, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback
  const rows = value.map(map)
  return rows.length > 0 ? rows : fallback
}

function parseAddressRow(row: unknown): AddressHistoryRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  return {
    fullAddress: typeof o.fullAddress === 'string' ? o.fullAddress : '',
    postCode: typeof o.postCode === 'string' ? o.postCode : '',
    type: o.type === 'CURRENT' ? 'CURRENT' : 'PREVIOUS',
    durationMonths: Math.max(0, parseNumber(o.durationMonths, 0)),
  }
}

function parseIncomeRow(row: unknown): IncomeRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  const frequency = o.frequency === 'MONTHLY' || o.frequency === 'WEEKLY' ? o.frequency : ''
  return {
    source: typeof o.source === 'string' ? o.source : '',
    amount: typeof o.amount === 'string' ? o.amount : '',
    frequency,
    dateReceived: typeof o.dateReceived === 'string' ? o.dateReceived : '',
  }
}

function parseDebtRow(row: unknown): DebtRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  const status =
    o.status === 'DEFAULT' || o.status === 'ACTIVE' || o.status === 'COLLECTION' ? o.status : ''
  return {
    creditorName: typeof o.creditorName === 'string' ? o.creditorName : '',
    accountCount: typeof o.accountCount === 'string' ? o.accountCount : '',
    balance: typeof o.balance === 'string' ? o.balance : '',
    percentageOfTotal: typeof o.percentageOfTotal === 'string' ? o.percentageOfTotal : '',
    status,
  }
}

function parseCcjRow(row: unknown): CcjRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  return {
    caseNumber: typeof o.caseNumber === 'string' ? o.caseNumber : '',
    courtName: typeof o.courtName === 'string' ? o.courtName : '',
    courtDate: typeof o.courtDate === 'string' ? o.courtDate : '',
    judgmentValue: typeof o.judgmentValue === 'string' ? o.judgmentValue : '',
    satisfied: o.satisfied === true,
    originalCreditorName: typeof o.originalCreditorName === 'string' ? o.originalCreditorName : '',
    originalCreditorReferenceNumber:
      typeof o.originalCreditorReferenceNumber === 'string' ? o.originalCreditorReferenceNumber : '',
    solicitorName: typeof o.solicitorName === 'string' ? o.solicitorName : '',
  }
}

function parseFamilyTransferRow(row: unknown): FamilyTransferRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  return {
    name: typeof o.name === 'string' ? o.name : '',
    relationship: typeof o.relationship === 'string' ? o.relationship : '',
    amountSent: typeof o.amountSent === 'string' ? o.amountSent : '',
    amountReceived: typeof o.amountReceived === 'string' ? o.amountReceived : '',
    frequency: typeof o.frequency === 'string' ? o.frequency : '',
  }
}

export function emptyEmployeeIntakeForm(): EmployeeIntakeForm {
  return {
    dateOfBirth: '',
    maritalStatus: '',
    niNumber: '',
    secondaryNumber: '',
    emailAddress: '',
    addressHistory: [{ fullAddress: '', postCode: '', type: 'CURRENT', durationMonths: 60 }],
    livingSituation: '',
    partnerName: '',
    partnerDob: '',
    dependentsCount: '',
    children: [{ name: '', dob: '' }],
    employmentStatus: '',
    employerName: '',
    jobTitle: '',
    payslipAvailable: false,
    incomes: [{ source: '', amount: '', frequency: '', dateReceived: '' }],
    bankNames: '',
    accountType: '',
    statementsAvailable: false,
    totalDebtAmount: '',
    numberOfCreditors: '',
    debts: [{ creditorName: '', accountCount: '', balance: '', percentageOfTotal: '', status: '' }],
    ccjs: [
      {
        caseNumber: '',
        courtName: '',
        courtDate: '',
        judgmentValue: '',
        satisfied: false,
        originalCreditorName: '',
        originalCreditorReferenceNumber: '',
        solicitorName: '',
      },
    ],
    councilTaxAmount: '',
    councilName: '',
    rentArrears: '',
    utilitiesDebt: '',
    waterDebt: '',
    hmrcDebt: '',
    benefitOverpayments: '',
    monthlyExpenses: '',
    transactionIncomeNotes: '',
    transactionExpenseNotes: '',
    transactionFlags: '',
    familyTransfers: [{ name: '', relationship: '', amountSent: '', amountReceived: '', frequency: '' }],
    hasCar: false,
    carRegistrationNumber: '',
    propertyOwnership: '',
    savingsInvestments: '',
    idProofProvided: false,
    payslipsProvided: false,
    bankStatementsProvided: false,
    benefitStatementsProvided: false,
    councilTaxStatementProvided: false,
    creditReportsProvided: false,
    financialDifficultyLevel: '',
    missedPayments: '',
    defaults: '',
    ccjRisk: '',
    vulnerability: '',
    internalNotes: '',
    affordabilitySummary: '',
  }
}

export function addressHistoryTotalMonths(f: EmployeeIntakeForm): number {
  return f.addressHistory.reduce((sum, row) => sum + Math.max(0, row.durationMonths || 0), 0)
}

export function addressHistoryMeetsFiveYears(f: EmployeeIntakeForm): boolean {
  return addressHistoryTotalMonths(f) >= 60
}

export function employeeIntakeFormToRemarks(f: EmployeeIntakeForm): string {
  const lines = [
    '[Employee intake]',
    `DOB: ${f.dateOfBirth || '—'}`,
    `Marital status: ${f.maritalStatus || '—'}`,
    `Secondary number: ${f.secondaryNumber || '—'}`,
    `Email: ${f.emailAddress || '—'}`,
    `Address history months: ${addressHistoryTotalMonths(f)}`,
    `Employment status: ${f.employmentStatus || '—'}`,
    `Total debt amount: ${f.totalDebtAmount || '—'}`,
    `Creditors: ${f.numberOfCreditors || '—'}`,
    `Council debt: ${f.councilTaxAmount || '—'} (${f.councilName || '—'})`,
    `Car: ${f.hasCar ? `Yes (${f.carRegistrationNumber || 'reg missing'})` : 'No'}`,
    `Docs (ID/Payslip/Bank/Benefit/Council/Credit): ${[
      f.idProofProvided,
      f.payslipsProvided,
      f.bankStatementsProvided,
      f.benefitStatementsProvided,
      f.councilTaxStatementProvided,
      f.creditReportsProvided,
    ]
      .map((x) => (x ? 'Y' : 'N'))
      .join('/')}`,
    `Internal notes: ${f.internalNotes || '—'}`,
    `Affordability summary: ${f.affordabilitySummary || '—'}`,
  ]
  return lines.join('\n')
}

export function parseEmployeeIntakeForm(input: unknown): EmployeeIntakeForm {
  const base = emptyEmployeeIntakeForm()
  if (!input || typeof input !== 'object') return base
  const o = input as Record<string, unknown>

  const maritalStatus =
    o.maritalStatus === 'SINGLE' || o.maritalStatus === 'MARRIED' || o.maritalStatus === 'PARTNER'
      ? o.maritalStatus
      : ''
  const livingSituation =
    o.livingSituation === 'ALONE' ||
    o.livingSituation === 'PARTNER' ||
    o.livingSituation === 'PARENTS' ||
    o.livingSituation === 'SHARED'
      ? o.livingSituation
      : ''
  const employmentStatus =
    o.employmentStatus === 'FT' ||
    o.employmentStatus === 'PT' ||
    o.employmentStatus === 'SELF_EMPLOYED' ||
    o.employmentStatus === 'UNEMPLOYED'
      ? o.employmentStatus
      : ''
  const accountType = o.accountType === 'CURRENT' || o.accountType === 'SAVINGS' ? o.accountType : ''

  return {
    ...base,
    dateOfBirth: typeof o.dateOfBirth === 'string' ? o.dateOfBirth : '',
    maritalStatus,
    niNumber: typeof o.niNumber === 'string' ? o.niNumber : '',
    secondaryNumber: typeof o.secondaryNumber === 'string' ? o.secondaryNumber : '',
    emailAddress: typeof o.emailAddress === 'string' ? o.emailAddress : '',
    addressHistory: parseArray(o.addressHistory, parseAddressRow, base.addressHistory),
    livingSituation,
    partnerName: typeof o.partnerName === 'string' ? o.partnerName : '',
    partnerDob: typeof o.partnerDob === 'string' ? o.partnerDob : '',
    dependentsCount: typeof o.dependentsCount === 'string' ? o.dependentsCount : '',
    children: parseArray(
      o.children,
      (row) => {
        const r = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
        return {
          name: typeof r.name === 'string' ? r.name : '',
          dob: typeof r.dob === 'string' ? r.dob : '',
        }
      },
      base.children
    ),
    employmentStatus,
    employerName: typeof o.employerName === 'string' ? o.employerName : '',
    jobTitle: typeof o.jobTitle === 'string' ? o.jobTitle : '',
    payslipAvailable: o.payslipAvailable === true,
    incomes: parseArray(o.incomes, parseIncomeRow, base.incomes),
    bankNames: typeof o.bankNames === 'string' ? o.bankNames : '',
    accountType,
    statementsAvailable: o.statementsAvailable === true,
    totalDebtAmount: typeof o.totalDebtAmount === 'string' ? o.totalDebtAmount : '',
    numberOfCreditors: typeof o.numberOfCreditors === 'string' ? o.numberOfCreditors : '',
    debts: parseArray(o.debts, parseDebtRow, base.debts),
    ccjs: parseArray(o.ccjs, parseCcjRow, base.ccjs),
    councilTaxAmount: typeof o.councilTaxAmount === 'string' ? o.councilTaxAmount : '',
    councilName: typeof o.councilName === 'string' ? o.councilName : '',
    rentArrears: typeof o.rentArrears === 'string' ? o.rentArrears : '',
    utilitiesDebt: typeof o.utilitiesDebt === 'string' ? o.utilitiesDebt : '',
    waterDebt: typeof o.waterDebt === 'string' ? o.waterDebt : '',
    hmrcDebt: typeof o.hmrcDebt === 'string' ? o.hmrcDebt : '',
    benefitOverpayments: typeof o.benefitOverpayments === 'string' ? o.benefitOverpayments : '',
    monthlyExpenses: typeof o.monthlyExpenses === 'string' ? o.monthlyExpenses : '',
    transactionIncomeNotes: typeof o.transactionIncomeNotes === 'string' ? o.transactionIncomeNotes : '',
    transactionExpenseNotes: typeof o.transactionExpenseNotes === 'string' ? o.transactionExpenseNotes : '',
    transactionFlags: typeof o.transactionFlags === 'string' ? o.transactionFlags : '',
    familyTransfers: parseArray(o.familyTransfers, parseFamilyTransferRow, base.familyTransfers),
    hasCar: o.hasCar === true,
    carRegistrationNumber: typeof o.carRegistrationNumber === 'string' ? o.carRegistrationNumber : '',
    propertyOwnership: typeof o.propertyOwnership === 'string' ? o.propertyOwnership : '',
    savingsInvestments: typeof o.savingsInvestments === 'string' ? o.savingsInvestments : '',
    idProofProvided: o.idProofProvided === true,
    payslipsProvided: o.payslipsProvided === true,
    bankStatementsProvided: o.bankStatementsProvided === true,
    benefitStatementsProvided: o.benefitStatementsProvided === true,
    councilTaxStatementProvided: o.councilTaxStatementProvided === true,
    creditReportsProvided: o.creditReportsProvided === true,
    financialDifficultyLevel: typeof o.financialDifficultyLevel === 'string' ? o.financialDifficultyLevel : '',
    missedPayments: typeof o.missedPayments === 'string' ? o.missedPayments : '',
    defaults: typeof o.defaults === 'string' ? o.defaults : '',
    ccjRisk: typeof o.ccjRisk === 'string' ? o.ccjRisk : '',
    vulnerability: typeof o.vulnerability === 'string' ? o.vulnerability : '',
    internalNotes: typeof o.internalNotes === 'string' ? o.internalNotes : '',
    affordabilitySummary: typeof o.affordabilitySummary === 'string' ? o.affordabilitySummary : '',
  }
}

export function hasEmployeeIntakeData(f: EmployeeIntakeForm): boolean {
  return (
    !!f.dateOfBirth ||
    !!f.niNumber ||
    !!f.secondaryNumber ||
    !!f.emailAddress ||
    !!f.employerName ||
    !!f.totalDebtAmount ||
    !!f.monthlyExpenses ||
    !!f.internalNotes ||
    addressHistoryTotalMonths(f) > 0 ||
    f.incomes.some((x) => x.source || x.amount) ||
    f.debts.some((x) => x.creditorName || x.balance)
  )
}
