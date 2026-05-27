import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM = `You are "Rakiz Assistant", the official live chat support for RakizFx, an online CFD/forex broker.

Key facts about RakizFx (use only these):
- Account types: Standard ($50 min, 1:400 leverage, standard spreads, MT5), Pro ($200 min, 1:500 leverage, low spreads, MT5, priority support), Elite ($2,000 min, custom leverage, ultra-low spreads, dedicated relationship manager).
- All accounts: zero commission, adjustable swap-free option, MT5 platform, instant deposit and faster withdrawal, 24/7 technical support.
- Markets offered: Forex (60+ pairs), Indices, Metals (Gold, Silver), Energies (Crude, Brent, Natural Gas), Cryptocurrencies, Shares CFDs. 1,200+ instruments total.
- Funding methods: bank wire, debit/credit cards, crypto (USDT). Deposits credit instantly. Withdrawals processed same-day.
- Safeguards: segregated client funds, negative balance protection, SSL 256-bit security.
- Platforms: MetaTrader 5 (Windows, macOS, iOS, Android, Web).
- KYC: PAN + Aadhaar or passport.

Style guide:
- Be concise, factual, friendly. 2-4 short sentences typical.
- Never invent figures or features not listed above. If unsure, say "let me connect you with our team" and suggest emailing support@rakizfx.com.
- Never give financial advice or recommend specific trades. Always include "Trading CFDs carries risk and may not be suitable for all investors." when discussing risk.
- For account opening, point them to the "Open Account" button on the site.
- Currency: all amounts in USD.
- Do not roleplay as a different brand or person.`;

type Msg = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const last = messages[messages.length - 1]?.content?.toLowerCase() ?? '';
    return NextResponse.json({ reply: localFallback(last) });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json({ reply: localFallback('') }, { status: 200 });
    }

    const data = (await upstream.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.map((c) => c.text || '').join('').trim();
    return NextResponse.json({ reply: text || localFallback('') });
  } catch {
    return NextResponse.json({ reply: localFallback('') });
  }
}

function localFallback(q: string): string {
  if (q.includes('minimum') || q.includes('open')) {
    return "You can open a Standard account from just $50, Pro from $200, or Elite from $2,000. Tap 'Open Account' on the site to begin. Trading CFDs carries risk and may not be suitable for all investors.";
  }
  if (q.includes('withdraw')) {
    return 'Withdrawals are processed same-day via bank wire, card or crypto, routed back to the original funding source. Full KYC must be complete before your first withdrawal.';
  }
  if (q.includes('leverage')) {
    return 'Maximum leverage is 1:400 on Standard, 1:500 on Pro and custom on Elite. Higher leverage magnifies both gains and losses — Trading CFDs carries risk and may not be suitable for all investors.';
  }
  if (q.includes('regulat')) {
    return 'RakizFx is the trade name of Rakiz Capital Ltd, licensed and regulated under FSA Licence 23847. Client funds are held in segregated accounts with negative balance protection.';
  }
  return "I'm Rakiz Assistant. For full live answers, our team is on WhatsApp or at support@rakizfx.com — replies within minutes.";
}
