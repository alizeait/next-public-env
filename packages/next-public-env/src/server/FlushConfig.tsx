'use client';
import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

const setupFunctionString =
  'function i(n){window.__NEXT_PUBLIC_ENV||Object.defineProperty(window,"__NEXT_PUBLIC_ENV",{value:Object.freeze(n),enumerable:!0})}';

export const FlushConfig: React.FC<{ config: string; nonce?: string }> = ({
  config,
  nonce,
}) => {
  const hasFlushed = useRef(false);

  useServerInsertedHTML(() => {
    if (hasFlushed.current) return null;

    hasFlushed.current = true;
    const scriptContent = `(${setupFunctionString})(${config});`;

    return (
      <script
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
        type="text/javascript"
        nonce={nonce}
      />
    );
  });

  return null;
};
