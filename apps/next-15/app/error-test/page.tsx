'use client';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

export default function ErrorTest() {
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error('This is a test error');
  }
  return <div>This will not be rendered</div>;
}
