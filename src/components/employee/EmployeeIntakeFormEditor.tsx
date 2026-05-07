'use client'

import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import {
  addressHistoryMeetsFiveYears,
  addressHistoryTotalMonths,
  DEBT_CREDITOR_TYPES,
  UK_BANK_OPTIONS,
  type EmployeeIntakeForm,
} from '@/lib/employee-intake-form'

type Props = {
  form: EmployeeIntakeForm
  setForm: (next: EmployeeIntakeForm) => void
}

export default function EmployeeIntakeFormEditor({ form, setForm }: Props) {
  return (
    <div className="space-y-5 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Name (from lead)</label>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Calling number</label>
          <input value={form.callingNumber} onChange={(e) => setForm({ ...form, callingNumber: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" checked={form.whatsappSameAsCalling} onChange={(e) => setForm({ ...form, whatsappSameAsCalling: e.target.checked, whatsappNumber: e.target.checked ? form.callingNumber : form.whatsappNumber })} />
          <span className="text-xs text-neutral-400">WhatsApp same as calling number</span>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">WhatsApp number</label>
          <input value={form.whatsappNumber} disabled={form.whatsappSameAsCalling} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white disabled:opacity-50" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Email</label>
          <input value={form.emailAddress} onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> DOB</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Address history + pincode (min 5 years)</span>
          <button type="button" onClick={() => setForm({ ...form, addressHistory: [...form.addressHistory, { fullAddress: '', postCode: '', type: 'PREVIOUS', durationMonths: 12 }] })} className="text-xs text-blue-400 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        <p className={`text-xs ${addressHistoryMeetsFiveYears(form) ? 'text-emerald-400' : 'text-amber-400'}`}>
          Total coverage: {addressHistoryTotalMonths(form)} months
        </p>
        {form.addressHistory.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <input value={row.fullAddress} onChange={(e) => setForm({ ...form, addressHistory: form.addressHistory.map((r, i) => i === idx ? { ...r, fullAddress: e.target.value } : r) })} placeholder="Address" className="sm:col-span-6 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input value={row.postCode} onChange={(e) => setForm({ ...form, addressHistory: form.addressHistory.map((r, i) => i === idx ? { ...r, postCode: e.target.value } : r) })} placeholder="Pincode" className="sm:col-span-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input type="number" min={0} value={row.durationMonths} onChange={(e) => setForm({ ...form, addressHistory: form.addressHistory.map((r, i) => i === idx ? { ...r, durationMonths: Number(e.target.value) || 0 } : r) })} className="sm:col-span-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <button type="button" onClick={() => setForm({ ...form, addressHistory: form.addressHistory.filter((_, i) => i !== idx) })} className="sm:col-span-2 text-xs text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Debts</span>
          <button type="button" onClick={() => setForm({ ...form, debts: [...form.debts, { creditorType: '', creditorName: '', amount: '', payment: '' }] })} className="text-xs text-blue-400 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
        </div>
        {form.debts.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <select value={row.creditorType} onChange={(e) => setForm({ ...form, debts: form.debts.map((d, i) => i === idx ? { ...d, creditorType: e.target.value as typeof row.creditorType } : d) })} className="sm:col-span-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white">
              <option value="">Creditor type</option>
              {DEBT_CREDITOR_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <input value={row.creditorName} onChange={(e) => setForm({ ...form, debts: form.debts.map((d, i) => i === idx ? { ...d, creditorName: e.target.value } : d) })} placeholder="Creditor name" className="sm:col-span-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input type="number" min={0} value={row.amount} onChange={(e) => setForm({ ...form, debts: form.debts.map((d, i) => i === idx ? { ...d, amount: e.target.value } : d) })} placeholder="Amount" className="sm:col-span-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input value={row.payment} onChange={(e) => setForm({ ...form, debts: form.debts.map((d, i) => i === idx ? { ...d, payment: e.target.value } : d) })} placeholder="Payment" className="sm:col-span-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <button type="button" onClick={() => setForm({ ...form, debts: form.debts.filter((_, i) => i !== idx) })} className="sm:col-span-2 text-xs text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
        <p className="text-xs text-emerald-400">
          Auto total debt: {form.debts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Living status</label>
          <select value={form.livingSituation} onChange={(e) => setForm({ ...form, livingSituation: e.target.value as EmployeeIntakeForm['livingSituation'] })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white">
            <option value="">—</option><option value="PARTNER">Partner</option><option value="ALONE">Single</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Homeowner or tenant</label>
          <select value={form.housingStatus} onChange={(e) => {
            const housingStatus = e.target.value as EmployeeIntakeForm['housingStatus']
            setForm({
              ...form,
              housingStatus,
              rentArrears: housingStatus === 'TENANT' ? form.rentArrears : '',
            })
          }} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white">
            <option value="">—</option>
            <option value="HOMEOWNER">Homeowner</option>
            <option value="TENANT">Tenant</option>
          </select>
        </div>
        {form.housingStatus === 'TENANT' ? (
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Rent</label>
            <input value={form.rentArrears} onChange={(e) => setForm({ ...form, rentArrears: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
          </div>
        ) : null}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Working status</label>
          <select value={form.employmentStatus} onChange={(e) => {
            const employmentStatus = e.target.value as EmployeeIntakeForm['employmentStatus']
            const shouldAskEmploymentDetails =
              employmentStatus === 'FT' || employmentStatus === 'PT' || employmentStatus === 'PENSIONER'
            setForm({
              ...form,
              employmentStatus,
              employerName: shouldAskEmploymentDetails ? form.employerName : '',
              incomeAmount: shouldAskEmploymentDetails ? form.incomeAmount : '',
            })
          }} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white">
            <option value="">—</option><option value="FT">Full time</option><option value="PT">Part time</option><option value="PENSIONER">Pensioner</option><option value="NOT_WORKING">Not working</option>
          </select>
        </div>
        {form.employmentStatus === 'FT' ||
        form.employmentStatus === 'PT' ||
        form.employmentStatus === 'PENSIONER' ? (
          <>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Employer name</label>
              <input value={form.employerName} onChange={(e) => setForm({ ...form, employerName: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Income</label>
              <input value={form.incomeAmount} onChange={(e) => setForm({ ...form, incomeAmount: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            </div>
          </>
        ) : null}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={form.hasCar}
            onChange={(e) => setForm({ ...form, hasCar: e.target.checked })}
          />
          Owns car?
        </label>
        {form.hasCar ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={form.carName}
              onChange={(e) => setForm({ ...form, carName: e.target.value })}
              placeholder="Car name"
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white"
            />
            <input
              value={form.carRegistrationNumber}
              onChange={(e) =>
                setForm({ ...form, carRegistrationNumber: e.target.value })
              }
              placeholder="Reg no"
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white"
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Benefits (if any)</span>
          <button type="button" onClick={() => setForm({ ...form, benefits: [...form.benefits, { name: '', amount: '' }] })} className="text-xs text-blue-400 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
        </div>
        {form.benefits.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <input value={row.name} onChange={(e) => setForm({ ...form, benefits: form.benefits.map((b, i) => i === idx ? { ...b, name: e.target.value } : b) })} placeholder="Benefit name" className="sm:col-span-5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input type="number" min={0} value={row.amount} onChange={(e) => setForm({ ...form, benefits: form.benefits.map((b, i) => i === idx ? { ...b, amount: e.target.value } : b) })} placeholder="Amount" className="sm:col-span-5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <button type="button" onClick={() => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== idx) })} className="sm:col-span-2 text-xs text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Expenses (predefined)</span>
        </div>
        {form.expensesPreset.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <input value={row.name} readOnly className="sm:col-span-7 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-300" />
            <input type="number" min={0} value={row.amount} onChange={(e) => setForm({ ...form, expensesPreset: form.expensesPreset.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x) })} placeholder="Amount" className="sm:col-span-5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Extra expenses</span>
          <button type="button" onClick={() => setForm({ ...form, expensesExtra: [...form.expensesExtra, { name: '', amount: '' }] })} className="text-xs text-blue-400 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
        </div>
        {form.expensesExtra.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <input value={row.name} onChange={(e) => setForm({ ...form, expensesExtra: form.expensesExtra.map((x, i) => i === idx ? { ...x, name: e.target.value } : x) })} placeholder="Expense name" className="sm:col-span-5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input type="number" min={0} value={row.amount} onChange={(e) => setForm({ ...form, expensesExtra: form.expensesExtra.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x) })} placeholder="Amount" className="sm:col-span-5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <button type="button" onClick={() => setForm({ ...form, expensesExtra: form.expensesExtra.filter((_, i) => i !== idx) })} className="sm:col-span-2 text-xs text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Children DOB</span>
          <button type="button" onClick={() => setForm({ ...form, children: [...form.children, { name: '', dob: '' }] })} className="text-xs text-blue-400 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
        </div>
        {form.children.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <input value={row.name} onChange={(e) => setForm({ ...form, children: form.children.map((c, i) => i === idx ? { ...c, name: e.target.value } : c) })} placeholder="Child name" className="sm:col-span-6 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <input type="date" value={row.dob} onChange={(e) => setForm({ ...form, children: form.children.map((c, i) => i === idx ? { ...c, dob: e.target.value } : c) })} className="sm:col-span-4 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
            <button type="button" onClick={() => setForm({ ...form, children: form.children.filter((_, i) => i !== idx) })} className="sm:col-span-2 text-xs text-red-400 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Banking (UK banks)</label>
        <input list="uk-banks-shared-intake" value={form.bankNames} onChange={(e) => setForm({ ...form, bankNames: e.target.value })} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" placeholder="Select or type bank names" />
        <datalist id="uk-banks-shared-intake">
          {UK_BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">Notes</label>
        <textarea value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} rows={3} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" />
      </div>

    </div>
  )
}

