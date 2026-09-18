'use client'

import { useState } from 'react'

const AMOUNTS = [5000, 10000, 25000, 50000, 100000]

const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`

/**
 * Picking an amount before leaving the site makes the decision here rather than
 * on the payment page, which is where most people drop out.
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
    <div className="rounded-2xl bg-paper-50 p-7 text-ink-900 shadow-2xl shadow-teal-950/40 sm:p-8">
      <h2 className="font-display text-2xl">Give today</h2>
      <p className="mt-2 text-sm text-ink-500">
        Your gift supports outreaches, community programmes and the shelters we are working to open.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {AMOUNTS.map((value) => {
          const selected = amount === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              aria-pressed={selected}
              className={`rounded-lg py-3 text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-teal-500 text-paper-50'
                  : 'bg-paper-100 text-ink-700 hover:bg-teal-50'
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
          className={`rounded-lg py-3 text-sm font-semibold transition-colors ${
            amount === null ? 'bg-teal-500 text-paper-50' : 'bg-paper-100 text-ink-700 hover:bg-teal-50'
          }`}
        >
          Other
        </button>
      </div>

      <a
        href={href}
        className="mt-5 block rounded-full bg-brass-400 py-4 text-center font-semibold text-teal-950 transition-colors hover:bg-brass-300"
      >
        {amount ? `Donate ${naira(amount)}` : 'Choose an amount'}
      </a>

      {paystackUrl ? (
        <p className="mt-4 text-center text-xs text-ink-400">Secure payment through Paystack</p>
      ) : (
        <p className="mt-4 text-center text-xs text-ink-400">
          Add your Paystack link in Site settings to start taking gifts here.
        </p>
      )}
    </div>
  )
}
