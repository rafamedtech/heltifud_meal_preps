import { describe, expect, it } from 'vitest';
import { fitChosenDays, offerChangedSinceDraft, type DraftOfferBaseline } from '../../layers/menu/shared/utils/customerOrderDraft';

const week = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

describe('fitChosenDays', () => {
  it('completes the days when switching to a variant with more days', () => {
    expect(fitChosenDays(['LUNES', 'MARTES', 'MIERCOLES'], week, 5)).toEqual(week);
    expect(fitChosenDays(['LUNES', 'MIERCOLES', 'VIERNES'], week, 4)).toEqual(['LUNES', 'MARTES', 'MIERCOLES', 'VIERNES']);
  });
  it('keeps the earliest chosen days when switching to fewer days', () => {
    expect(fitChosenDays(['MARTES', 'JUEVES', 'VIERNES'], week, 2)).toEqual(['MARTES', 'JUEVES']);
  });
  it('drops days the offer no longer sells and fills from the start of the week', () => {
    expect(fitChosenDays(['SABADO', 'JUEVES'], week, 3)).toEqual(['LUNES', 'MARTES', 'JUEVES']);
    expect(fitChosenDays([], week, 3)).toEqual(['LUNES', 'MARTES', 'MIERCOLES']);
  });
  it('leaves a complete selection untouched', () => {
    expect(fitChosenDays(['MARTES', 'JUEVES', 'VIERNES'], week, 3)).toEqual(['MARTES', 'JUEVES', 'VIERNES']);
  });
});

describe('offerChangedSinceDraft', () => {
  const draft: DraftOfferBaseline = { variantId: 'v3', menuType: 'ESTANDAR', menuId: 'm1', offerVersion: 2, offerRevision: 'r', expectedPrice: 700 };
  it('never asks for a review without a recovered draft', () => {
    expect(offerChangedSinceDraft(null, { ...draft, variantId: 'v5', expectedPrice: 1000 })).toBe(false);
  });
  it('ignores a plan or menu type changed by the customer', () => {
    expect(offerChangedSinceDraft(draft, { ...draft, variantId: 'v5', expectedPrice: 1000 })).toBe(false);
    expect(offerChangedSinceDraft(draft, { ...draft, menuType: 'VEGETARIANO', menuId: 'm2' })).toBe(false);
  });
  it('asks for a review when the same selection now has a different offer', () => {
    expect(offerChangedSinceDraft(draft, { ...draft })).toBe(false);
    expect(offerChangedSinceDraft(draft, { ...draft, offerVersion: 3 })).toBe(true);
    expect(offerChangedSinceDraft(draft, { ...draft, offerRevision: 's' })).toBe(true);
    expect(offerChangedSinceDraft(draft, { ...draft, expectedPrice: 750 })).toBe(true);
    expect(offerChangedSinceDraft(draft, { ...draft, menuId: 'm9' })).toBe(true);
  });
});
