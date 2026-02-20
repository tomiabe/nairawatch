export interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  buy: number;
  sell: number;
  official?: number;
  lastUpdated?: string;
}

export interface MarketData {
  rates: CurrencyRate[];
  lastChecked: string;
  source: string;
}

export type TrendPeriod = '24h' | '7d';

export interface TrendPoint {
  timestamp: string;
  buy: number;
  sell: number;
}

export enum CurrencyCode {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
  CAD = 'CAD',
  AUD = 'AUD',
  CNY = 'CNY',
  AED = 'AED',
  SAR = 'SAR',
  JPY = 'JPY',
  CHF = 'CHF',
  ZAR = 'ZAR',
  INR = 'INR',
  GHS = 'GHS',
  XOF = 'XOF',
  KES = 'KES',
  SGD = 'SGD',
  TRY = 'TRY',
  BRL = 'BRL',
  KRW = 'KRW',
  MYR = 'MYR',
}
