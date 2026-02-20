import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Calculator, Search, Check, ChevronDown } from 'lucide-react';
import { CurrencyRate, CurrencyCode } from '../types';

interface ConverterProps {
    rates: CurrencyRate[];
    onInteraction?: (eventName: string, params?: Record<string, string | number | boolean>) => void;
}

interface CurrencySelectProps {
    label: string;
    value: string;
    onChange: (code: string) => void;
    rates: CurrencyRate[];
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ label, value, onChange, rates }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Combine NGN + rates for the list
    const allCurrencies = [
        { code: CurrencyCode.NGN, name: 'Nigerian Naira', flag: '🇳🇬' },
        ...rates
    ];

    const selectedCurrency = allCurrencies.find(c => c.code === value) || allCurrencies[0];

    const filtered = allCurrencies.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Reset search when opening
    useEffect(() => {
        if (isOpen) setSearch("");
    }, [isOpen]);

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-emerald-500/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-xl px-3 py-3 flex items-center justify-between transition-all group"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl flex-shrink-0">{selectedCurrency.flag}</span>
                        <div className="text-left min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {selectedCurrency.code}
                            </div>
                            <div className="text-xs text-slate-500 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300 font-medium truncate">
                                {selectedCurrency.name}
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col max-h-[320px] animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search currency..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filtered.map(currency => (
                                <button
                                    key={currency.code}
                                    onClick={() => {
                                        onChange(currency.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${value === currency.code ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{currency.flag}</span>
                                        <div className="text-left">
                                            <div className={`font-medium ${value === currency.code ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {currency.code}
                                            </div>
                                            <div className="text-xs text-slate-500">{currency.name}</div>
                                        </div>
                                    </div>
                                    {value === currency.code && <Check className="h-4 w-4 text-emerald-500" />}
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-slate-500">No currency found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Converter: React.FC<ConverterProps> = ({ rates, onInteraction }) => {
    const [amount, setAmount] = useState<string>('1');
    const [fromCurrency, setFromCurrency] = useState<string>(CurrencyCode.USD);
    const [toCurrency, setToCurrency] = useState<string>(CurrencyCode.NGN);
    const [result, setResult] = useState<number>(0);

    // Helper to get rate against NGN
    const getRateInNGN = (code: string): number => {
        if (code === CurrencyCode.NGN) return 1;
        const rate = rates.find(r => r.code === code);
        // Use average of buy/sell for a mid-market estimate
        return rate ? (rate.buy + rate.sell) / 2 : 0;
    };

    useEffect(() => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setResult(0);
            return;
        }

        const fromRate = getRateInNGN(fromCurrency);
        const toRate = getRateInNGN(toCurrency);

        if (toRate === 0) return;

        // Convert From -> NGN -> To
        // (Amount * FromRate) / ToRate
        const val = (numAmount * fromRate) / toRate;
        setResult(val);
    }, [amount, fromCurrency, toCurrency, rates]);

    const handleSwap = () => {
        onInteraction?.('converter_swap_clicked', {
            from_currency: fromCurrency,
            to_currency: toCurrency
        });
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
    };

    const handleAmountBlur = () => {
        const numericAmount = Number.parseFloat(amount);
        if (Number.isFinite(numericAmount)) {
            onInteraction?.('converter_amount_entered', { amount: numericAmount });
        }
    };

    const handleFromCurrencyChange = (code: string) => {
        onInteraction?.('converter_from_currency_changed', {
            previous_currency: fromCurrency,
            next_currency: code
        });
        setFromCurrency(code);
    };

    const handleToCurrencyChange = (code: string) => {
        onInteraction?.('converter_to_currency_changed', {
            previous_currency: toCurrency,
            next_currency: code
        });
        setToCurrency(code);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-800 relative transition-colors duration-300">
            {/* Background Decoration with clipping */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 dark:text-slate-50">
                    <Calculator size={120} />
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                    <Calculator className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Quick Converter
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
                    {/* From Input */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    onBlur={handleAmountBlur}
                                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-2xl font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-500/50 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <CurrencySelect
                            label="From"
                            value={fromCurrency}
                            onChange={handleFromCurrencyChange}
                            rates={rates}
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center md:pt-16">
                        <button
                            onClick={handleSwap}
                            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-500 dark:text-slate-400 transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 z-20"
                            aria-label="Swap currencies"
                        >
                            <ArrowRightLeft className="h-6 w-6" />
                        </button>
                    </div>

                    {/* To Output */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Converted To</label>
                            <div className="relative block w-full rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
                                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 text-left md:text-right w-full truncate">
                                    {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        <CurrencySelect
                            label="To"
                            value={toCurrency}
                            onChange={handleToCurrencyChange}
                            rates={rates}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl max-w-fit">
                        <span>1 {fromCurrency} ≈ {(getRateInNGN(fromCurrency) / getRateInNGN(toCurrency)).toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Estimated Parallel Market Rate</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
