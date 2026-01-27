import { CurrencyCode, CurrencyRate } from './types';

export const INITIAL_RATES: CurrencyRate[] = [
  { code: CurrencyCode.USD, name: 'US Dollar', flag: '🇺🇸', buy: 1600, sell: 1615 },
  { code: CurrencyCode.GBP, name: 'British Pound', flag: '🇬🇧', buy: 2050, sell: 2080 },
  { code: CurrencyCode.EUR, name: 'Euro', flag: '🇪🇺', buy: 1720, sell: 1750 },
  { code: CurrencyCode.CAD, name: 'Canadian Dollar', flag: '🇨🇦', buy: 1150, sell: 1180 },
  { code: CurrencyCode.AUD, name: 'Australian Dollar', flag: '🇦🇺', buy: 1050, sell: 1080 },
  { code: CurrencyCode.CNY, name: 'Chinese Yuan', flag: '🇨🇳', buy: 220, sell: 235 },
  { code: CurrencyCode.AED, name: 'UAE Dirham', flag: '🇦🇪', buy: 430, sell: 445 },
  { code: CurrencyCode.SAR, name: 'Saudi Riyal', flag: '🇸🇦', buy: 420, sell: 435 },
  { code: CurrencyCode.CHF, name: 'Swiss Franc', flag: '🇨🇭', buy: 1750, sell: 1780 },
  { code: CurrencyCode.JPY, name: 'Japanese Yen', flag: '🇯🇵', buy: 10.5, sell: 11.5 },
  { code: CurrencyCode.ZAR, name: 'South African Rand', flag: '🇿🇦', buy: 85, sell: 95 },
  { code: CurrencyCode.GHS, name: 'Ghanaian Cedi', flag: '🇬🇭', buy: 95, sell: 105 },
  { code: CurrencyCode.INR, name: 'Indian Rupee', flag: '🇮🇳', buy: 18, sell: 20 },
  { code: CurrencyCode.XOF, name: 'CFA Franc', flag: '🇧🇯', buy: 2.4, sell: 2.8 },
  { code: CurrencyCode.KES, name: 'Kenyan Shilling', flag: '🇰🇪', buy: 12, sell: 13 },
  { code: CurrencyCode.SGD, name: 'Singapore Dollar', flag: '🇸🇬', buy: 1180, sell: 1210 },
  { code: CurrencyCode.TRY, name: 'Turkish Lira', flag: '🇹🇷', buy: 45, sell: 48 },
  { code: CurrencyCode.BRL, name: 'Brazilian Real', flag: '🇧🇷', buy: 280, sell: 300 },
  { code: CurrencyCode.KRW, name: 'South Korean Won', flag: '🇰🇷', buy: 1.1, sell: 1.3 },
  { code: CurrencyCode.MYR, name: 'Malaysian Ringgit', flag: '🇲🇾', buy: 350, sell: 370 },
];

export const APP_NAME = "NairaWatch";