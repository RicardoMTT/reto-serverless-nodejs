import { sum } from './example'; // Suponiendo que existe un archivo `example.ts`

describe('Example Tests', () => {
  it('should correctly sum two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});