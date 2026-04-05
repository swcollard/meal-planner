import { assemblePrompt, SYSTEM_PROMPT } from './prompt';
import type { PlanFormInputs } from './types';

const baseInputs: PlanFormInputs = {
  weekOf: '2026-04-07',
  theme: '',
  avoid: '',
  feature: '',
  easyCleanupDays: ['Wednesday'],
  easyLunchDay: 'Tuesday',
  notes: '',
};

describe('SYSTEM_PROMPT', () => {
  it('mentions sesame allergy', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('sesame');
  });

  it('instructs Claude to return JSON only', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('json');
  });
});

describe('assemblePrompt', () => {
  it('includes the week-of date', () => {
    const prompt = assemblePrompt(baseInputs);
    expect(prompt).toContain('2026-04-07');
  });

  it('includes EASY CLEANUP day when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyCleanupDays: ['Wednesday'] });
    expect(prompt).toContain('EASY CLEANUP: Wednesday');
  });

  it('includes multiple easy cleanup days joined', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyCleanupDays: ['Wednesday', 'Thursday'] });
    expect(prompt).toContain('EASY CLEANUP: Wednesday, Thursday');
  });

  it('includes EASY LUNCH day', () => {
    const prompt = assemblePrompt({ ...baseInputs, easyLunchDay: 'Tuesday' });
    expect(prompt).toContain('EASY LUNCH: Tuesday');
  });

  it('includes THEME when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, theme: 'Tex-Mex' });
    expect(prompt).toContain('THEME: Tex-Mex');
  });

  it('omits THEME line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, theme: '' });
    expect(prompt).not.toContain('THEME:');
  });

  it('includes AVOID when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, avoid: 'beef' });
    expect(prompt).toContain('AVOID: beef');
  });

  it('omits AVOID line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, avoid: '' });
    expect(prompt).not.toContain('AVOID:');
  });

  it('includes FEATURE when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, feature: 'zucchini' });
    expect(prompt).toContain('FEATURE: zucchini');
  });

  it('omits FEATURE line when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, feature: '' });
    expect(prompt).not.toContain('FEATURE:');
  });

  it('includes freeform notes when provided', () => {
    const prompt = assemblePrompt({ ...baseInputs, notes: 'DATE NIGHT Friday' });
    expect(prompt).toContain('DATE NIGHT Friday');
  });

  it('omits notes section when empty', () => {
    const prompt = assemblePrompt({ ...baseInputs, notes: '' });
    expect(prompt).not.toContain('Additional notes:');
  });
});
