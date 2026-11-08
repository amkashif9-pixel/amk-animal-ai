import { describe, it, expect } from 'vitest';
import { SAMPLE_VETERINARIANS } from '../data/sampleVets';

describe('Phase 1 Safety: Veterinary Directory Integrity', () => {
  it('should mark all sample veterinarians as isDemo: true', () => {
    expect(SAMPLE_VETERINARIANS.length).toBeGreaterThan(0);
    SAMPLE_VETERINARIANS.forEach((vet) => {
      expect(vet.isDemo).toBe(true);
    });
  });

  it('should not contain any dummy phone numbers or fake contact details', () => {
    // Doctors 2 through 5 must have empty phone and whatsapp so real users are never misdirected
    const nonHelplineVets = SAMPLE_VETERINARIANS.filter((v) => v.id !== 'vet_1');
    nonHelplineVets.forEach((vet) => {
      expect(vet.phone).toBe('');
      expect(vet.whatsapp).toBe('');
    });
  });

  it('should route vet_1 only through verified official platform helpline', () => {
    const vet1 = SAMPLE_VETERINARIANS.find((v) => v.id === 'vet_1');
    expect(vet1).toBeDefined();
    expect(vet1?.whatsapp).toBe('+923346682654');
    expect(vet1?.phone).toBe('+923346682654');
  });
});

describe('Phase 1 Routing: Canonical Section Mapping', () => {
  const TAB_ALIASES: Record<string, string> = {
    '': 'home',
    home: 'home',
    scanner: 'scanner',
    scan: 'scanner',
    camera: 'scanner',
    health: 'health',
    disease: 'health',
    'market-price': 'marketPrice',
    marketprice: 'marketPrice',
    price: 'marketPrice',
    mandi: 'marketPrice',
    'meat-yield': 'meatYield',
    meatyield: 'meatYield',
    meat: 'meatYield',
    nutrition: 'nutrition',
    feed: 'nutrition',
    diet: 'nutrition',
    calendar: 'calendar',
    vaccination: 'calendar',
    vaccines: 'calendar',
    profiles: 'profiles',
    animals: 'profiles',
    herd: 'profiles',
    marketplace: 'marketplace',
    bazaar: 'marketplace',
    mandi_bazaar: 'marketplace',
    vets: 'vets',
    'vet-directory': 'vets',
    doctors: 'vets',
    chat: 'chat',
    'ai-chat': 'chat',
    consultation: 'chat',
    admin: 'admin',
  };

  const resolveTab = (hashOrSlug: string) => {
    const clean = hashOrSlug.replace(/^#\/?/, '').trim().toLowerCase().split('?')[0].replace(/\/+$/, '');
    return TAB_ALIASES[clean] || 'home';
  };

  it('should correctly resolve canonical section hashes', () => {
    expect(resolveTab('#/scanner')).toBe('scanner');
    expect(resolveTab('#/health')).toBe('health');
    expect(resolveTab('#/marketPrice')).toBe('marketPrice');
    expect(resolveTab('#/market-price')).toBe('marketPrice');
    expect(resolveTab('#/meatYield')).toBe('meatYield');
    expect(resolveTab('#/meat-yield')).toBe('meatYield');
    expect(resolveTab('#/nutrition')).toBe('nutrition');
    expect(resolveTab('#/calendar')).toBe('calendar');
    expect(resolveTab('#/profiles')).toBe('profiles');
    expect(resolveTab('#/marketplace')).toBe('marketplace');
    expect(resolveTab('#/vets')).toBe('vets');
    expect(resolveTab('#/chat')).toBe('chat');
    expect(resolveTab('#/admin')).toBe('admin');
  });

  it('should support slug aliases and query parameters', () => {
    expect(resolveTab('#/scan?mode=auto')).toBe('scanner');
    expect(resolveTab('#/price?species=cow')).toBe('marketPrice');
    expect(resolveTab('#/meat')).toBe('meatYield');
    expect(resolveTab('#/doctors')).toBe('vets');
    expect(resolveTab('#/unknown_route')).toBe('home');
    expect(resolveTab('')).toBe('home');
  });

  it('should resolve pathname segments from SPA fallback', () => {
    const resolveFromPathname = (pathname: string) => {
      const segments = pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1]?.toLowerCase().trim();
      if (last && last !== 'amk-animal-ai' && last !== 'index.html' && TAB_ALIASES[last]) {
        return TAB_ALIASES[last];
      }
      return 'home';
    };

    expect(resolveFromPathname('/amk-animal-ai/scanner')).toBe('scanner');
    expect(resolveFromPathname('/amk-animal-ai/marketplace')).toBe('marketplace');
    expect(resolveFromPathname('/amk-animal-ai/health')).toBe('health');
    expect(resolveFromPathname('/amk-animal-ai/meat-yield')).toBe('meatYield');
    expect(resolveFromPathname('/amk-animal-ai/')).toBe('home');
    expect(resolveFromPathname('/amk-animal-ai/index.html')).toBe('home');
  });
});
