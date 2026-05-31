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
    'cta.login':        'Log In',
    'cta.open_account': 'Open Account',
    'cta.register':     'Register',
    'cta.try_demo':     'Try Demo',
    'cta.see_accounts': 'See Accounts',
    'cta.start_now':    'Start Now',
    'cta.learn_more':   'Learn More',

    'hero.slogan':      'Grow without limits',
    'hero.title':       'Trusted by traders',
    'hero.title_em':    'worldwide',
    'hero.lede':        'Trusted. Fast deposits. Easy withdrawals. Built for traders worldwide.',

    'search.placeholder':'Search markets, accounts, tools…',
    'search.empty':     'No results for',
    'search.hint_select':'select',
    'search.hint_close':'close',

    'bonus.label':      'Limited',
    'bonus.text':       'Welcome bonus,',
    'bonus.amount':     'claim your first-deposit boost',
    'bonus.suffix':     '· ends in',
    'bonus.claim':      'Claim Now',

    'accts.choose':     'Choose your account',
    'accts.sub':        'Three tiers. Same execution. Pick the one that fits your strategy',

    'why.title':        'Why traders choose',
    'why.title_em':     'RakizFx',
    'why.sub':          'Direct market access, 24/7 support and conditions that scale with your strategy.',

    'mt5.title':        'MetaTrader 5',
    'mt5.title_em':     'everywhere you trade',
    'mt5.sub':          'Desktop, web and mobile, your account stays in sync. One-click execution, 38 built-in indicators, depth of market, expert advisors and the MQL5 marketplace.',
    'mt5.p1_t':         'Lightning execution',
    'mt5.p1_b':         '28ms average fill across all markets',
    'mt5.p2_t':         'Advanced charting',
    'mt5.p2_b':         '38 indicators, 21 timeframes, depth of market',
    'mt5.p3_t':         'Algorithmic trading',
    'mt5.p3_b':         'Expert Advisors (EAs) + MQL5 marketplace',
    'mt5.p4_t':         'Mobile-first',
    'mt5.p4_b':         'Native iOS & Android with biometric login',
    'mt5.cta_open':     'Open MT5 Account',
    'mt5.cta_learn':    'MT5 Tutorials',

    'asset.title':      'Trade every',
    'asset.title_em':   'major asset class',
    'asset.sub':        '1,200+ instruments across every market, from a single MetaTrader 5 account.',
    'mobile.title':     'Your account, in your',
    'mobile.title_em':  'pocket',
    'fullcta.title':    'Markets don’t wait',
    'fullcta.title_em': 'Neither should you',
    'fullcta.lede':     'Open a live account in under 2 minutes. Fund from $50 via bank wire, card or crypto. Trade 1,200+ instruments from a single MetaTrader 5 login.',

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
    'cta.register':     'रजिस्टर करें',
    'cta.try_demo':     'डेमो आज़माएँ',
    'cta.see_accounts': 'सभी खाते देखें',
    'cta.start_now':    'अभी शुरू करें',
    'cta.learn_more':   'और जानें',

    'hero.slogan':      'बिना सीमा के बढ़ें',
    'hero.title':       'दुनिया भर के',
    'hero.title_em':    'ट्रेडर्स का भरोसा',
    'hero.lede':        'भरोसेमंद। तेज़ डिपॉज़िट। आसान विद्ड्रॉल। दुनिया भर के ट्रेडर्स के लिए बना।',

    'search.placeholder':'बाज़ार, खाते, टूल खोजें…',
    'search.empty':     'इसके लिए कोई परिणाम नहीं',
    'search.hint_select':'चुनें',
    'search.hint_close':'बंद करें',

    'bonus.label':      'सीमित समय',
    'bonus.text':       'वेलकम बोनस,',
    'bonus.amount':     'अपना पहला डिपॉज़िट बूस्ट क्लेम करें',
    'bonus.suffix':     '· समाप्ति में',
    'bonus.claim':      'अभी क्लेम करें',

    'accts.choose':     'अपना खाता चुनें',
    'accts.sub':        'तीन टियर, समान एक्ज़ीक्यूशन, वही चुनें जो आपकी रणनीति से मेल खाए',

    'why.title':        'ट्रेडर्स क्यों चुनते हैं',
    'why.title_em':     'RakizFx',
    'why.sub':          'सीधी मार्केट एक्सेस, 24/7 सपोर्ट और ऐसी कंडीशन जो आपकी रणनीति के साथ बढ़ें।',

    'mt5.title':        'MetaTrader 5',
    'mt5.title_em':     'हर जगह जहाँ आप ट्रेड करें',
    'mt5.sub':          'डेस्कटॉप, वेब और मोबाइल, आपका खाता सिंक्रनाइज़ रहता है। वन-क्लिक एक्ज़ीक्यूशन, 38 बिल्ट-इन इंडिकेटर, डेप्थ ऑफ़ मार्केट, एक्सपर्ट एडवाइज़र्स और MQL5 मार्केटप्लेस।',
    'mt5.p1_t':         'लाइटनिंग एक्ज़ीक्यूशन',
    'mt5.p1_b':         'सभी मार्केट्स में औसतन 28ms फ़िल',
    'mt5.p2_t':         'एडवांस्ड चार्टिंग',
    'mt5.p2_b':         '38 इंडिकेटर, 21 टाइमफ़्रेम, डेप्थ ऑफ़ मार्केट',
    'mt5.p3_t':         'एल्गोरिथमिक ट्रेडिंग',
    'mt5.p3_b':         'एक्सपर्ट एडवाइज़र्स (EAs) + MQL5 मार्केटप्लेस',
    'mt5.p4_t':         'मोबाइल-फ़र्स्ट',
    'mt5.p4_b':         'बायोमेट्रिक लॉगिन के साथ नेटिव iOS और Android',
    'mt5.cta_open':     'MT5 खाता खोलें',
    'mt5.cta_learn':    'MT5 ट्यूटोरियल',

    'asset.title':      'ट्रेड करें हर',
    'asset.title_em':   'मुख्य एसेट क्लास',
    'asset.sub':        'एक ही MetaTrader 5 खाते से हर मार्केट में 1,200+ इंस्ट्रूमेंट।',
    'mobile.title':     'आपका खाता, आपकी',
    'mobile.title_em':  'जेब में',
    'fullcta.title':    'बाज़ार रुकते नहीं',
    'fullcta.title_em': 'आप भी मत रुकिए',
    'fullcta.lede':     '2 मिनट में लाइव खाता खोलें। $50 से बैंक वायर, कार्ड या क्रिप्टो से फ़ंड करें। एक ही MetaTrader 5 लॉगिन से 1,200+ इंस्ट्रूमेंट ट्रेड करें।',

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
    'cta.register':     'تسجيل',
    'cta.try_demo':     'تجربة العرض التوضيحي',
    'cta.see_accounts': 'عرض الحسابات',
    'cta.start_now':    'ابدأ الآن',
    'cta.learn_more':   'اعرف المزيد',

    'hero.slogan':      'انمُ بلا حدود',
    'hero.title':       'موثوق من المتداولين',
    'hero.title_em':    'حول العالم',
    'hero.lede':        'موثوقية. إيداعات سريعة. سحوبات سهلة. مصمم للمتداولين حول العالم.',

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
    'accts.sub':        'ثلاث فئات، تنفيذ موحَّد, اختر ما يناسب استراتيجيتك',

    'why.title':        'لماذا يختار المتداولون',
    'why.title_em':     'RakizFx',
    'why.sub':          'وصول مباشر للأسواق، دعم على مدار الساعة، وظروف تنمو مع استراتيجيتك.',

    'mt5.title':        'MetaTrader 5',
    'mt5.title_em':     'في كل مكان تتداول فيه',
    'mt5.sub':          'سطح المكتب، الويب والجوال, حسابك متزامن دائماً. تنفيذ بضغطة واحدة، 38 مؤشراً مدمجاً، عمق السوق، خبراء التداول (EAs) ومتجر MQL5.',
    'mt5.p1_t':         'تنفيذ فائق السرعة',
    'mt5.p1_b':         'متوسط 28 مللي ثانية في جميع الأسواق',
    'mt5.p2_t':         'تحليل فني متقدم',
    'mt5.p2_b':         '38 مؤشراً، 21 إطاراً زمنياً، عمق السوق',
    'mt5.p3_t':         'تداول خوارزمي',
    'mt5.p3_b':         'خبراء التداول (EAs) + متجر MQL5',
    'mt5.p4_t':         'محمول أولاً',
    'mt5.p4_b':         'iOS وAndroid أصلية مع تسجيل دخول حيوي',
    'mt5.cta_open':     'فتح حساب MT5',
    'mt5.cta_learn':    'دروس MT5',

    'asset.title':      'تداول كل',
    'asset.title_em':   'فئات الأصول الرئيسية',
    'asset.sub':        'أكثر من 1,200 أداة في كل سوق, من حساب MetaTrader 5 واحد.',
    'mobile.title':     'حسابك في',
    'mobile.title_em':  'جيبك',
    'fullcta.title':    'الأسواق لا تنتظر',
    'fullcta.title_em': 'وأنت لا تنتظر',
    'fullcta.lede':     'افتح حساباً مباشراً في أقل من دقيقتين. مَوِّل من 50$ عبر الحوالة المصرفية أو البطاقة أو العملات الرقمية. تداول أكثر من 1,200 أداة من حساب MetaTrader 5 واحد.',

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
