'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type LangCode = 'en' | 'hi' | 'ar';

export const LANGS: { code: LangCode; short: string; name: string; nav: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', short: 'EN', name: 'English',  nav: 'EN', dir: 'ltr' },
  { code: 'hi', short: 'हि', name: 'हिन्दी',    nav: 'HI', dir: 'ltr' },
  { code: 'ar', short: 'ع',  name: 'العربية',  nav: 'AR', dir: 'rtl' },
];

type Dict = Record<string, string>;

/* ─── Translation dictionary ───
   Keys group by area. Anything missing falls back to English, then to the key. */
const STRINGS: Record<LangCode, Dict> = {
  en: {
    'nav.home':         'Home',
    'nav.markets':      'Markets',
    'nav.accounts':     'Accounts',
    'nav.tools':        'Tools',
    'nav.partner':      'Become a Partner',
    'nav.promotion':    'Promotion',
    'nav.company':      'Company',
    'nav.search':       'Search',
    'nav.language':     'Language',
    'cta.login':        'Log in',
    'cta.open_account': 'Open Account',
    'cta.try_demo':     'Try demo',
    'cta.see_accounts': 'See accounts',
    'cta.start_now':    'Start now',
    'cta.learn_more':   'Learn more',

    'hero.slogan':      'Grow without limits',
    'hero.title':       'Trusted by traders',
    'hero.title_em':    'worldwide',
    'hero.lede':        'Institutional execution on 1,200+ markets — forex, indices, metals, energies, crypto and shares, from a single MetaTrader 5 account.',

    'search.placeholder':'Search markets, accounts, tools…',
    'search.empty':     'No results for',
    'search.hint_select':'select',
    'search.hint_close':'close',

    'bonus.label':      'Limited',
    'bonus.text':       'Welcome bonus —',
    'bonus.amount':     'claim your first-deposit boost',
    'bonus.suffix':     '· ends in',
    'bonus.claim':      'Claim now',

    'accts.choose':     'Choose your account',
    'accts.sub':        'Three tiers. Same execution. Pick the one that fits your strategy',

    'why.title':        'Why RakizFx',

    'foot.risk':        'Risk warning',
    'foot.copy':        '© 2026 Rakiz Capital Ltd. All rights reserved.',
  },

  hi: {
    'nav.home':         'होम',
    'nav.markets':      'बाज़ार',
    'nav.accounts':     'खाते',
    'nav.tools':        'टूल्स',
    'nav.partner':      'पार्टनर बनें',
    'nav.promotion':    'ऑफ़र',
    'nav.company':      'कंपनी',
    'nav.search':       'खोजें',
    'nav.language':     'भाषा',
    'cta.login':        'लॉग इन',
    'cta.open_account': 'खाता खोलें',
    'cta.try_demo':     'डेमो आज़माएँ',
    'cta.see_accounts': 'सभी खाते देखें',
    'cta.start_now':    'अभी शुरू करें',
    'cta.learn_more':   'और जानें',

    'hero.slogan':      'बिना सीमा के बढ़ें',
    'hero.title':       'दुनिया भर के',
    'hero.title_em':    'ट्रेडर्स का भरोसा',
    'hero.lede':        '1,200+ मार्केट्स पर इंस्टीट्यूशनल-ग्रेड एक्ज़ीक्यूशन — फ़ॉरेक्स, इंडाइसेस, मेटल्स, एनर्जी, क्रिप्टो और शेयर्स, एक ही MetaTrader 5 खाते से।',

    'search.placeholder':'बाज़ार, खाते, टूल खोजें…',
    'search.empty':     'इसके लिए कोई परिणाम नहीं',
    'search.hint_select':'चुनें',
    'search.hint_close':'बंद करें',

    'bonus.label':      'सीमित समय',
    'bonus.text':       'वेलकम बोनस —',
    'bonus.amount':     'अपना पहला डिपॉज़िट बूस्ट क्लेम करें',
    'bonus.suffix':     '· समाप्ति में',
    'bonus.claim':      'अभी क्लेम करें',

    'accts.choose':     'अपना खाता चुनें',
    'accts.sub':        'तीन टियर, समान एक्ज़ीक्यूशन — वही चुनें जो आपकी रणनीति से मेल खाए',

    'why.title':        'RakizFx क्यों',

    'foot.risk':        'जोखिम चेतावनी',
    'foot.copy':        '© 2026 Rakiz Capital Ltd. सर्वाधिकार सुरक्षित।',
  },

  ar: {
    'nav.home':         'الرئيسية',
    'nav.markets':      'الأسواق',
    'nav.accounts':     'الحسابات',
    'nav.tools':        'الأدوات',
    'nav.partner':      'كن شريكاً',
    'nav.promotion':    'العروض',
    'nav.company':      'الشركة',
    'nav.search':       'بحث',
    'nav.language':     'اللغة',
    'cta.login':        'تسجيل الدخول',
    'cta.open_account': 'فتح حساب',
    'cta.try_demo':     'تجربة العرض التوضيحي',
    'cta.see_accounts': 'عرض الحسابات',
    'cta.start_now':    'ابدأ الآن',
    'cta.learn_more':   'اعرف المزيد',

    'hero.slogan':      'انمُ بلا حدود',
    'hero.title':       'موثوق من المتداولين',
    'hero.title_em':    'حول العالم',
    'hero.lede':        'تنفيذ بمستوى المؤسسات على أكثر من 1,200 سوق — فوركس، مؤشرات، معادن، طاقة، عملات رقمية وأسهم، من حساب MetaTrader 5 واحد.',

    'search.placeholder':'ابحث في الأسواق والحسابات والأدوات…',
    'search.empty':     'لا توجد نتائج لـ',
    'search.hint_select':'اختر',
    'search.hint_close':'إغلاق',

    'bonus.label':      'لفترة محدودة',
    'bonus.text':       'مكافأة الترحيب —',
    'bonus.amount':     'احصل على دفعة الإيداع الأول',
    'bonus.suffix':     '· ينتهي خلال',
    'bonus.claim':      'احصل عليها الآن',

    'accts.choose':     'اختر حسابك',
    'accts.sub':        'ثلاث فئات، تنفيذ موحَّد — اختر ما يناسب استراتيجيتك',

    'why.title':        'لماذا RakizFx',

    'foot.risk':        'تحذير المخاطر',
    'foot.copy':        '© 2026 شركة Rakiz Capital. جميع الحقوق محفوظة.',
  },
};

type Ctx = {
  lang: LangCode;
  setLang: (c: LangCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
};

const I18nContext = createContext<Ctx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  dir: 'ltr',
});

const STORAGE_KEY = 'rakizfx.lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (saved && LANGS.some((l) => l.code === saved)) {
        setLangState(saved);
        return;
      }
      // Auto-detect from browser locale on first load
      const b = (navigator.language || 'en').slice(0, 2).toLowerCase();
      if (b === 'hi') setLangState('hi');
      else if (b === 'ar') setLangState('ar');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang) || LANGS[0];
    if (typeof document !== 'undefined') {
      document.documentElement.lang = meta.code;
      document.documentElement.dir = meta.dir;
      document.documentElement.dataset.lang = meta.code;
    }
  }, [lang]);

  const setLang = useCallback((c: LangCode) => {
    setLangState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const here = STRINGS[lang]?.[key];
      if (here) return here;
      return STRINGS.en[key] ?? key;
    },
    [lang]
  );

  const value = useMemo<Ctx>(() => {
    const meta = LANGS.find((l) => l.code === lang) || LANGS[0];
    return { lang, setLang, t, dir: meta.dir };
  }, [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}
