'use client';
import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

export const FlushConfig: React.FC<{ config: string }> = ({ config }) => {
  const hasFlushed = useRef(false);

  useServerInsertedHTML(() => {
    if (hasFlushed.current) return null;

    hasFlushed.current = true;
    const scriptContent = `window.__NEXT_PUBLIC_ENV = ${config}`;
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
      />
    );
  });

  return null;
};
