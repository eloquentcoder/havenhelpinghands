'use client'

import { useState } from 'react'

const AMOUNTS = [5000, 10000, 25000, 50000]

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

/**
 * Sits inside the hero's colour block. Choosing an amount before leaving the
 * site puts the decision here rather than on the payment page, which is where
 * most people drop out.
 *
 * No impact claims sit against these figures — "₦10,000 feeds a family for a
 * week" would be a specific promise the organisation has not made.
 */
export function DonatePanel({ paystackUrl }: { paystackUrl?: string | null }) {
  const [amount, setAmount] = useState<number | null>(AMOUNTS[1])

  const href = paystackUrl
    ? amount
      ? `${paystackUrl}${paystackUrl.includes('?') ? '&' : '?'}amount=${amount * 100}`
      : paystackUrl
    : '/get-involved'

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {AMOUNTS.map((value) => {
          const selected = amount === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              aria-pressed={selected}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-teal-600 text-paper-50'
                  : 'bg-teal-950/10 text-teal-950 ring-1 ring-teal-950/40 hover:bg-teal-950/20'
              }`}
            >
              {naira(value)}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setAmount(null)}
          aria-pressed={amount === null}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            amount === null
              ? 'bg-teal-600 text-paper-50'
              : 'bg-teal-950/10 text-teal-950 ring-1 ring-teal-950/40 hover:bg-teal-950/20'
          }`}
        >
          Other
        </button>
      </div>

      <a
        href={href}
        className="mt-7 inline-flex items-center justify-center rounded-lg bg-teal-600 px-9 py-4 font-semibold text-paper-50 transition-transform duration-200 hover:-translate-y-0.5"
      >
        {amount ? `Donate ${naira(amount)}` : 'Choose an amount'}
      </a>

      {!paystackUrl ? (
        <p className="mt-4 max-w-xs text-xs text-teal-950/80">
          Add your Paystack link in Site settings to start taking gifts here.
        </p>
      ) : null}
    </div>
  )
}
