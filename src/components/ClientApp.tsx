'use client';

import dynamic from 'next/dynamic';
import { I18nProvider } from '@/lib/i18n';

const App = dynamic(() => import('./Site'), { ssr: false });

export default function ClientApp() {
  return (
    <I18nProvider>
      <App />
    </I18nProvider>
  );
}
