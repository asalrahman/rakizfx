'use client';

export function RakizLogo({ size = 32 }: { size?: number; showWord?: boolean }) {
  const h = size * 1.1;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/rakizfx-logo-light.png"
        alt="RakizFx"
        style={{
          height: h,
          width: 'auto',
          display: 'block',
          filter: 'var(--logo-filter, none)',
        }}
      />
    </span>
  );
}
