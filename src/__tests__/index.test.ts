import { describe, it, expect } from 'vitest';
import { example } from '../index';

describe('example', () => {
  it('should return greeting', () => {
    expect(example()).toBe('Hello from next-public-env!');
  });
});
