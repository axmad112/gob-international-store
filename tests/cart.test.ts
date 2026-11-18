import { describe, expect, it } from 'vitest';
import { calculateCartSubtotal, calculateDiscount } from '../lib/cart';

describe('cart calculations', () => {
  it('calculates subtotal from quantities', () => { expect(calculateCartSubtotal([{ unitPrice: 10, quantity: 2 }, { unitPrice: 4.5, quantity: 3 }])).toBe(33.5); });
  it('caps fixed discounts at subtotal', () => { expect(calculateDiscount(20, { type: 'FIXED', value: 25 })).toBe(20); });
  it('calculates percentage discounts', () => { expect(calculateDiscount(80, { type: 'PERCENTAGE', value: 15 })).toBe(12); });
});
