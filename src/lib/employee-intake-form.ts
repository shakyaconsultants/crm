export type AddressHistoryRow = {
  fullAddress: string
  postCode: string
  type: 'CURRENT' | 'PREVIOUS'
  durationMonths: number
}

export type ChildRow = { name: string; dob: string }
export type NameAmountRow = { name: string; amount: string }
export const PRESET_EXPENSE_NAMES = [
  'Rent',
  'Council tax',
  'Water',
  'Electric',
  'Gas',
  'Fooding',
  'Broadband',
  'Public Transport',
  'Clothing & shopping',
] as const

export const DEBT_CREDITOR_TYPES = [
  'Credit Card',
  'Store Card',
  'Overdraft',
  'Personal Loan',
  'Payday Loan',
  'Catalogue',
  'Council Tax Arrears',
  'Rent Arrears',
  'Water Arrears',
  'Gas Arrears',
  'Electric Arrears',
  'HMRC / Tax Debt',
  'Benefit Overpayment',
  'Mobile / Telecom Arrears',
  'Car Finance Arrears',
  'Mortgage Arrears',
  'Secured Loan',
  'Guarantor Loan',
  'BNPL',
  'Other',
] as const

export const DEBT_CREDITOR_COMPANIES: Record<(typeof DEBT_CREDITOR_TYPES)[number], string[]> = {
  'Credit Card': ['Barclaycard', 'HSBC', 'Lloyds', 'NatWest', 'Santander', 'MBNA', 'Capital One', 'American Express', 'Virgin Money'],
  'Store Card': ['NewDay (Aqua/Marbles/Fluid)', 'Very / Shop Direct', 'Argos Card', 'John Lewis', 'Next', 'Currys', 'Amazon'],
  Overdraft: ['HSBC', 'Barclays', 'Lloyds', 'NatWest', 'Santander', 'Halifax', 'Nationwide', 'Monzo', 'Starling'],
  'Personal Loan': ['Lloyds', 'NatWest', 'Santander', 'Barclays', 'HSBC', 'Tesco Bank', 'Sainsburys Bank', 'Zopa'],
  'Payday Loan': ['Wonga', 'QuickQuid', 'Sunny', 'Lending Stream', 'Mr Lender'],
  Catalogue: ['Very', 'Littlewoods', 'Studio', 'JD Williams', 'Freemans'],
  'Council Tax Arrears': ['Local Council'],
  'Rent Arrears': ['Landlord / Letting Agent', 'Housing Association', 'Local Council'],
  'Water Arrears': ['Thames Water', 'Severn Trent', 'Anglian Water', 'United Utilities', 'Yorkshire Water', 'Southern Water'],
  'Gas Arrears': ['British Gas', 'E.ON Next', 'OVO', 'EDF', 'ScottishPower', 'Octopus Energy'],
  'Electric Arrears': ['British Gas', 'E.ON Next', 'OVO', 'EDF', 'ScottishPower', 'Octopus Energy'],
  'HMRC / Tax Debt': ['HM Revenue & Customs'],
  'Benefit Overpayment': ['DWP', 'Local Council'],
  'Mobile / Telecom Arrears': ['EE', 'O2', 'Vodafone', 'Three', 'BT', 'Sky', 'Virgin Media', 'TalkTalk'],
  'Car Finance Arrears': ['MotoNovo', 'Black Horse', 'Close Brothers', 'Moneybarn', 'Blue Motor Finance'],
  'Mortgage Arrears': ['Halifax', 'Nationwide', 'Santander', 'HSBC', 'Barclays', 'NatWest'],
  'Secured Loan': ['Together', 'Shawbrook', 'Paragon', 'Pepper Money'],
  'Guarantor Loan': ['Amigo', 'Buddy Loans'],
  BNPL: ['Klarna', 'Clearpay', 'PayPal Pay in 3', 'Laybuy'],
  Other: ['Other / Not listed'],
}

export const UK_BENEFIT_OPTIONS = [
  'Universal Credit',
  'PIP',
  'DLA',
  'ESA',
  'JSA',
  'Housing Benefit',
  'Child Benefit',
  'Pension Credit',
  'State Pension',
  "Carer's Allowance",
  'Attendance Allowance',
  'Income Support',
  'Working Tax Credit',
  'Child Tax Credit',
  'Council Tax Reduction',
  'Other',
] as const

export const UK_BANK_OPTIONS = [
  'HSBC',
  'Barclays',
  'Lloyds',
  'NatWest',
  'Santander',
  'Halifax',
  'Nationwide',
  'Monzo',
  'Starling',
  'Revolut',
  'TSB',
  'Metro Bank',
] as const

export type IncomeRow = {
  source: string
  amount: string
  frequency: 'MONTHLY' | 'WEEKLY' | ''
  dateReceived: string
}

export type DebtRow = {
  creditorType: (typeof DEBT_CREDITOR_TYPES)[number] | ''
  creditorName: string
  amount: string
  payment: string
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
  fullName: string
  callingNumber: string
  whatsappSameAsCalling: boolean
  whatsappNumber: string
  emailAddress: string
  dateOfBirth: string
  maritalStatus: 'SINGLE' | 'MARRIED' | 'PARTNER' | ''
  niNumber: string
  addressHistory: AddressHistoryRow[]
  livingSituation: 'ALONE' | 'PARTNER' | 'PARENTS' | 'SHARED' | ''
  children: ChildRow[]
  rentArrears: string
  incomeAmount: string
  housingStatus: 'HOMEOWNER' | 'TENANT' | ''
  employmentStatus: 'FT' | 'PT' | 'PENSIONER' | 'NOT_WORKING' | ''
  benefits: NameAmountRow[]
  expensesPreset: NameAmountRow[]
  expensesExtra: NameAmountRow[]
  bankNames: string
  debts: DebtRow[]
  totalDebtAmount: string
  numberOfCreditors: string
  partnerName: string
  partnerDob: string
  dependentsCount: string
  employerName: string
  jobTitle: string
  payslipAvailable: boolean
  incomes: IncomeRow[]
  accountType: 'CURRENT' | 'SAVINGS' | ''
  statementsAvailable: boolean
  ccjs: CcjRow[]
  councilTaxAmount: string
  councilName: string
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
  carName: string
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
  const creditorType =
    typeof o.creditorType === 'string' &&
    DEBT_CREDITOR_TYPES.includes(o.creditorType as (typeof DEBT_CREDITOR_TYPES)[number])
      ? (o.creditorType as (typeof DEBT_CREDITOR_TYPES)[number])
      : ''

  return {
    creditorType,
    creditorName: typeof o.creditorName === 'string' ? o.creditorName : '',
    amount: typeof o.amount === 'string' ? o.amount : typeof o.balance === 'string' ? o.balance : '',
    payment:
      typeof o.payment === 'string'
        ? o.payment
        : typeof o.accountCount === 'string'
          ? o.accountCount
          : '',
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

function parseNameAmountRow(row: unknown): NameAmountRow {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
  return {
    name: typeof o.name === 'string' ? o.name : '',
    amount: typeof o.amount === 'string' ? o.amount : '',
  }
}

export function emptyEmployeeIntakeForm(): EmployeeIntakeForm {
  return {
    fullName: '',
    callingNumber: '',
    whatsappSameAsCalling: true,
    whatsappNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    maritalStatus: '',
    niNumber: '',
    addressHistory: [{ fullAddress: '', postCode: '', type: 'CURRENT', durationMonths: 60 }],
    livingSituation: '',
    children: [{ name: '', dob: '' }],
    rentArrears: '',
    incomeAmount: '',
    housingStatus: '',
    employmentStatus: '',
    benefits: [{ name: '', amount: '' }],
    expensesPreset: PRESET_EXPENSE_NAMES.map((name) => ({ name, amount: '' })),
    expensesExtra: [{ name: '', amount: '' }],
    bankNames: '',
    debts: [{ creditorType: '', creditorName: '', amount: '', payment: '' }],
    totalDebtAmount: '',
    numberOfCreditors: '',
    partnerName: '',
    partnerDob: '',
    dependentsCount: '',
    employerName: '',
    jobTitle: '',
    payslipAvailable: false,
    incomes: [{ source: '', amount: '', frequency: '', dateReceived: '' }],
    accountType: '',
    statementsAvailable: false,
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
    carName: '',
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
    `Name: ${f.fullName || '—'}`,
    `Calling number: ${f.callingNumber || '—'}`,
    `WhatsApp: ${f.whatsappSameAsCalling ? 'Same as calling' : f.whatsappNumber || '—'}`,
    `Email: ${f.emailAddress || '—'}`,
    `DOB: ${f.dateOfBirth || '—'}`,
    `Address history months: ${addressHistoryTotalMonths(f)}`,
    `Income amount: ${f.incomeAmount || '—'}`,
    `Housing: ${f.housingStatus || '—'}`,
    `Employment status: ${f.employmentStatus || '—'}`,
    `Total debt amount: ${f.totalDebtAmount || '—'}`,
    `Creditors: ${f.numberOfCreditors || '—'}`,
    `Living: ${f.livingSituation || '—'}`,
    `Car: ${f.hasCar ? `Yes (${f.carName || '—'} / ${f.carRegistrationNumber || '—'})` : 'No'}`,
    `Bank(s): ${f.bankNames || '—'}`,
    `Internal notes: ${f.internalNotes || '—'}`,
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
    o.employmentStatus === 'PENSIONER' ||
    o.employmentStatus === 'NOT_WORKING'
      ? o.employmentStatus
      : ''
  const housingStatus =
    o.housingStatus === 'HOMEOWNER' || o.housingStatus === 'TENANT' ? o.housingStatus : ''
  const accountType = o.accountType === 'CURRENT' || o.accountType === 'SAVINGS' ? o.accountType : ''

  return {
    ...base,
    fullName: typeof o.fullName === 'string' ? o.fullName : '',
    callingNumber: typeof o.callingNumber === 'string' ? o.callingNumber : '',
    whatsappSameAsCalling: o.whatsappSameAsCalling !== false,
    whatsappNumber: typeof o.whatsappNumber === 'string' ? o.whatsappNumber : '',
    emailAddress: typeof o.emailAddress === 'string' ? o.emailAddress : '',
    dateOfBirth: typeof o.dateOfBirth === 'string' ? o.dateOfBirth : '',
    maritalStatus,
    niNumber: typeof o.niNumber === 'string' ? o.niNumber : '',
    addressHistory: parseArray(o.addressHistory, parseAddressRow, base.addressHistory),
    livingSituation,
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
    rentArrears: typeof o.rentArrears === 'string' ? o.rentArrears : '',
    incomeAmount: typeof o.incomeAmount === 'string' ? o.incomeAmount : '',
    housingStatus,
    employmentStatus,
    benefits: parseArray(o.benefits, parseNameAmountRow, base.benefits),
    expensesPreset: parseArray(o.expensesPreset, parseNameAmountRow, base.expensesPreset),
    expensesExtra: parseArray(o.expensesExtra, parseNameAmountRow, base.expensesExtra),
    bankNames: typeof o.bankNames === 'string' ? o.bankNames : '',
    debts: parseArray(o.debts, parseDebtRow, base.debts),
    totalDebtAmount: typeof o.totalDebtAmount === 'string' ? o.totalDebtAmount : '',
    numberOfCreditors: typeof o.numberOfCreditors === 'string' ? o.numberOfCreditors : '',
    partnerName: typeof o.partnerName === 'string' ? o.partnerName : '',
    partnerDob: typeof o.partnerDob === 'string' ? o.partnerDob : '',
    dependentsCount: typeof o.dependentsCount === 'string' ? o.dependentsCount : '',
    employerName: typeof o.employerName === 'string' ? o.employerName : '',
    jobTitle: typeof o.jobTitle === 'string' ? o.jobTitle : '',
    payslipAvailable: o.payslipAvailable === true,
    incomes: parseArray(o.incomes, parseIncomeRow, base.incomes),
    accountType,
    statementsAvailable: o.statementsAvailable === true,
    ccjs: parseArray(o.ccjs, parseCcjRow, base.ccjs),
    councilTaxAmount: typeof o.councilTaxAmount === 'string' ? o.councilTaxAmount : '',
    councilName: typeof o.councilName === 'string' ? o.councilName : '',
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
    carName: typeof o.carName === 'string' ? o.carName : '',
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
    !!f.fullName ||
    !!f.callingNumber ||
    !!f.whatsappNumber ||
    !!f.dateOfBirth ||
    !!f.emailAddress ||
    !!f.incomeAmount ||
    !!f.housingStatus ||
    !!f.totalDebtAmount ||
    !!f.bankNames ||
    !!f.internalNotes ||
    addressHistoryTotalMonths(f) > 0 ||
    f.debts.some((x) => x.creditorName || x.amount || x.payment) ||
    f.benefits.some((x) => x.name || x.amount) ||
    f.expensesPreset.some((x) => x.amount) ||
    f.expensesExtra.some((x) => x.name || x.amount) ||
    f.hasCar ||
    !!f.carName ||
    !!f.carRegistrationNumber
  )
}

