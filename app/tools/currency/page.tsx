'use client';
import Script from 'next/script';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
// import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { copyResult, shareResult, exportPDF, showToast, validateInput, parseNumber, formatNumber } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const currencies: { code: string; flag: string; name: string }[] = [
  { code: 'IDR', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound Sterling' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
  { code: 'MYR', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal' },
  { code: 'KRW', flag: '🇰🇷', name: 'South Korean Won' },
  { code: 'HKD', flag: '🇭🇰', name: 'Hong Kong Dollar' },
  { code: 'THB', flag: '🇹🇭', name: 'Thai Baht' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'PHP', flag: '🇵🇭', name: 'Philippine Peso' },
  { code: 'VND', flag: '🇻🇳', name: 'Vietnamese Dong' },
  { code: 'TWD', flag: '🇹🇼', name: 'New Taiwan Dollar' },
  { code: 'BDT', flag: '🇧🇩', name: 'Bangladeshi Taka' },
  { code: 'PKR', flag: '🇵🇰', name: 'Pakistani Rupee' },
  { code: 'LKR', flag: '🇱🇰', name: 'Sri Lankan Rupee' },
  { code: 'MMK', flag: '🇲🇲', name: 'Myanmar Kyat' },
  { code: 'KHR', flag: '🇰🇭', name: 'Cambodian Riel' },
  { code: 'LAK', flag: '🇱🇦', name: 'Lao Kip' },
  { code: 'BND', flag: '🇧🇳', name: 'Brunei Dollar' },
  { code: 'NPR', flag: '🇳🇵', name: 'Nepalese Rupee' },
  { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'SEK', flag: '🇸🇪', name: 'Swedish Krona' },
  { code: 'NOK', flag: '🇳🇴', name: 'Norwegian Krone' },
  { code: 'DKK', flag: '🇩🇰', name: 'Danish Krone' },
  { code: 'PLN', flag: '🇵🇱', name: 'Polish Zloty' },
  { code: 'CZK', flag: '🇨🇿', name: 'Czech Koruna' },
  { code: 'HUF', flag: '🇭🇺', name: 'Hungarian Forint' },
  { code: 'RON', flag: '🇷🇴', name: 'Romanian Leu' },
  { code: 'HRK', flag: '🇭🇷', name: 'Croatian Kuna' },
  { code: 'BGN', flag: '🇧🇬', name: 'Bulgarian Lev' },
  { code: 'RSD', flag: '🇷🇸', name: 'Serbian Dinar' },
  { code: 'UAH', flag: '🇺🇦', name: 'Ukrainian Hryvnia' },
  { code: 'RUB', flag: '🇷🇺', name: 'Russian Ruble' },
  { code: 'TRY', flag: '🇹🇷', name: 'Turkish Lira' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'MXN', flag: '🇲🇽', name: 'Mexican Peso' },
  { code: 'BRL', flag: '🇧🇷', name: 'Brazilian Real' },
  { code: 'ARS', flag: '🇦🇷', name: 'Argentine Peso' },
  { code: 'CLP', flag: '🇨🇱', name: 'Chilean Peso' },
  { code: 'COP', flag: '🇨🇴', name: 'Colombian Peso' },
  { code: 'PEN', flag: '🇵🇪', name: 'Peruvian Sol' },
  { code: 'UYU', flag: '🇺🇾', name: 'Uruguayan Peso' },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'QAR', flag: '🇶🇦', name: 'Qatari Riyal' },
  { code: 'KWD', flag: '🇰🇼', name: 'Kuwaiti Dinar' },
  { code: 'BHD', flag: '🇧🇭', name: 'Bahraini Dinar' },
  { code: 'OMR', flag: '🇴🇲', name: 'Omani Rial' },
  { code: 'JOD', flag: '🇯🇴', name: 'Jordanian Dinar' },
  { code: 'ILS', flag: '🇮🇱', name: 'Israeli New Shekel' },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'ZAR', flag: '🇿🇦', name: 'South African Rand' },
  { code: 'NGN', flag: '🇳🇬', name: 'Nigerian Naira' },
  { code: 'KES', flag: '🇰🇪', name: 'Kenyan Shilling' },
  { code: 'GHS', flag: '🇬🇭', name: 'Ghanaian Cedi' },
  { code: 'MAD', flag: '🇲🇦', name: 'Moroccan Dirham' },
  { code: 'TND', flag: '🇹🇳', name: 'Tunisian Dinar' },
  { code: 'NZD', flag: '🇳🇿', name: 'New Zealand Dollar' },
  { code: 'FJD', flag: '🇫🇯', name: 'Fijian Dollar' },
  { code: 'PGK', flag: '🇵🇬', name: 'Papua New Guinean Kina' },
  { code: 'XOF', flag: '🌍', name: 'West African CFA Franc' },
  { code: 'XAF', flag: '🌍', name: 'Central African CFA Franc' },
  { code: 'AFN', flag: '🇦🇫', name: 'Afghan Afghani' },
  { code: 'ALL', flag: '🇦🇱', name: 'Albanian Lek' },
  { code: 'AMD', flag: '🇦🇲', name: 'Armenian Dram' },
  { code: 'ANG', flag: '🇨🇼', name: 'Netherlands Antillean Guilder' },
  { code: 'AOA', flag: '🇦🇴', name: 'Angolan Kwanza' },
  { code: 'AWG', flag: '🇦🇼', name: 'Aruban Florin' },
  { code: 'AZN', flag: '🇦🇿', name: 'Azerbaijani Manat' },
  { code: 'BAM', flag: '🇧🇦', name: 'Bosnia-Herzegovina Convertible Mark' },
  { code: 'BBD', flag: '🇧🇧', name: 'Barbadian Dollar' },
  { code: 'BIF', flag: '🇧🇮', name: 'Burundian Franc' },
  { code: 'BMD', flag: '🇧🇲', name: 'Bermudian Dollar' },
  { code: 'BOB', flag: '🇧🇴', name: 'Bolivian Boliviano' },
  { code: 'BSD', flag: '🇧🇸', name: 'Bahamian Dollar' },
  { code: 'BTN', flag: '🇧🇹', name: 'Bhutanese Ngultrum' },
  { code: 'BWP', flag: '🇧🇼', name: 'Botswana Pula' },
  { code: 'BYN', flag: '🇧🇾', name: 'Belarusian Ruble' },
  { code: 'BZD', flag: '🇧🇿', name: 'Belize Dollar' },
  { code: 'CDF', flag: '🇨🇩', name: 'Congolese Franc' },
  { code: 'CRC', flag: '🇨🇷', name: 'Costa Rican Colon' },
  { code: 'CUP', flag: '🇨🇺', name: 'Cuban Peso' },
  { code: 'CVE', flag: '🇨🇻', name: 'Cape Verdean Escudo' },
  { code: 'DJF', flag: '🇩🇯', name: 'Djiboutian Franc' },
  { code: 'DOP', flag: '🇩🇴', name: 'Dominican Peso' },
  { code: 'DZD', flag: '🇩🇿', name: 'Algerian Dinar' },
  { code: 'ERN', flag: '🇪🇷', name: 'Eritrean Nakfa' },
  { code: 'ETB', flag: '🇪🇹', name: 'Ethiopian Birr' },
  { code: 'FKP', flag: '🇫🇰', name: 'Falkland Islands Pound' },
  { code: 'FOK', flag: '🇫🇴', name: 'Faroese Krona' },
  { code: 'GEL', flag: '🇬🇪', name: 'Georgian Lari' },
  { code: 'GGP', flag: '🇬🇬', name: 'Guernsey Pound' },
  { code: 'GIP', flag: '🇬🇮', name: 'Gibraltar Pound' },
  { code: 'GMD', flag: '🇬🇲', name: 'Gambian Dalasi' },
  { code: 'GNF', flag: '🇬🇳', name: 'Guinean Franc' },
  { code: 'GTQ', flag: '🇬🇹', name: 'Guatemalan Quetzal' },
  { code: 'GYD', flag: '🇬🇾', name: 'Guyanese Dollar' },
  { code: 'HNL', flag: '🇭🇳', name: 'Honduran Lempira' },
  { code: 'HTG', flag: '🇭🇹', name: 'Haitian Gourde' },
  { code: 'IMP', flag: '🇮🇲', name: 'Manx Pound' },
  { code: 'IQD', flag: '🇮🇶', name: 'Iraqi Dinar' },
  { code: 'IRR', flag: '🇮🇷', name: 'Iranian Rial' },
  { code: 'ISK', flag: '🇮🇸', name: 'Icelandic Krona' },
  { code: 'JEP', flag: '🇯🇪', name: 'Jersey Pound' },
  { code: 'JMD', flag: '🇯🇲', name: 'Jamaican Dollar' },
  { code: 'KGS', flag: '🇰🇬', name: 'Kyrgyzstani Som' },
  { code: 'KID', flag: '🌍', name: 'Kiribati Dollar' },
  { code: 'KMF', flag: '🇰🇲', name: 'Comorian Franc' },
  { code: 'KYD', flag: '🇰🇾', name: 'Cayman Islands Dollar' },
  { code: 'KZT', flag: '🇰🇿', name: 'Kazakhstani Tenge' },
  { code: 'LBP', flag: '🇱🇧', name: 'Lebanese Pound' },
  { code: 'LRD', flag: '🇱🇷', name: 'Liberian Dollar' },
  { code: 'LSL', flag: '🇱🇸', name: 'Lesotho Loti' },
  { code: 'LYD', flag: '🇱🇾', name: 'Libyan Dinar' },
  { code: 'MDL', flag: '🇲🇩', name: 'Moldovan Leu' },
  { code: 'MGA', flag: '🇲🇬', name: 'Malagasy Ariary' },
  { code: 'MKD', flag: '🇲🇰', name: 'Macedonian Denar' },
  { code: 'MNT', flag: '🇲🇳', name: 'Mongolian Tugrik' },
  { code: 'MOP', flag: '🇲🇴', name: 'Macanese Pataca' },
  { code: 'MRU', flag: '🇲🇷', name: 'Mauritanian Ouguiya' },
  { code: 'MUR', flag: '🇲🇺', name: 'Mauritian Rupee' },
  { code: 'MVR', flag: '🇲🇻', name: 'Maldivian Rufiyaa' },
  { code: 'MWK', flag: '🇲🇼', name: 'Malawian Kwacha' },
  { code: 'MZN', flag: '🇲🇿', name: 'Mozambican Metical' },
  { code: 'NAD', flag: '🇳🇦', name: 'Namibian Dollar' },
  { code: 'NIO', flag: '🇳🇮', name: 'Nicaraguan Cordoba' },
  { code: 'PAB', flag: '🇵🇦', name: 'Panamanian Balboa' },
  { code: 'PYG', flag: '🇵🇾', name: 'Paraguayan Guarani' },
  { code: 'RWF', flag: '🇷🇼', name: 'Rwandan Franc' },
  { code: 'SBD', flag: '🇸🇧', name: 'Solomon Islands Dollar' },
  { code: 'SCR', flag: '🇸🇨', name: 'Seychellois Rupee' },
  { code: 'SDG', flag: '🇸🇩', name: 'Sudanese Pound' },
  { code: 'SHP', flag: '🇸🇭', name: 'Saint Helena Pound' },
  { code: 'SLE', flag: '🇸🇱', name: 'Sierra Leonean Leone' },
  { code: 'SOS', flag: '🇸🇴', name: 'Somali Shilling' },
  { code: 'SRD', flag: '🇸🇷', name: 'Surinamese Dollar' },
  { code: 'SSP', flag: '🇸🇸', name: 'South Sudanese Pound' },
  { code: 'STN', flag: '🇸🇹', name: 'Sao Tome and Principe Dobra' },
  { code: 'SYP', flag: '🇸🇾', name: 'Syrian Pound' },
  { code: 'SZL', flag: '🇸🇿', name: 'Swazi Lilangeni' },
  { code: 'TJS', flag: '🇹🇯', name: 'Tajikistani Somoni' },
  { code: 'TMT', flag: '🇹🇲', name: 'Turkmenistan Manat' },
  { code: 'TOP', flag: '🇹🇴', name: 'Tongan Paanga' },
  { code: 'TTD', flag: '🇹🇹', name: 'Trinidad and Tobago Dollar' },
  { code: 'TVD', flag: '🌍', name: 'Tuvaluan Dollar' },
  { code: 'TZS', flag: '🇹🇿', name: 'Tanzanian Shilling' },
  { code: 'UGX', flag: '🇺🇬', name: 'Ugandan Shilling' },
  { code: 'UZS', flag: '🇺🇿', name: 'Uzbekistani Som' },
  { code: 'VES', flag: '🇻🇪', name: 'Venezuelan Bolivar' },
  { code: 'VUV', flag: '🇻🇺', name: 'Vanuatu Vatu' },
  { code: 'WST', flag: '🇼🇸', name: 'Samoan Tala' },
  { code: 'XCD', flag: '🌍', name: 'East Caribbean Dollar' },
  { code: 'XPF', flag: '🌍', name: 'CFP Franc' },
  { code: 'YER', flag: '🇾🇪', name: 'Yemeni Rial' },
  { code: 'ZMW', flag: '🇿🇲', name: 'Zambian Kwacha' },
  { code: 'ZWL', flag: '🇿🇼', name: 'Zimbabwean Dollar' },
];

const fallbackRates: Record<string, number> = {
  IDR: 1,
  USD: 15800, EUR: 17200, GBP: 20100, JPY: 106, SGD: 11700, MYR: 3400, AUD: 10200, CNY: 2200, SAR: 4200,
  KRW: 11.8, HKD: 2020, THB: 440, INR: 190, PHP: 275, VND: 0.64, TWD: 495, BDT: 130, PKR: 56, LKR: 52,
  MMK: 7.5, KHR: 3.9, LAK: 0.72, BND: 11700, NPR: 119,
  CHF: 18000, SEK: 1500, NOK: 1480, DKK: 2300, PLN: 4000, CZK: 700, HUF: 44, RON: 3500, HRK: 2280,
  BGN: 8800, RSD: 147, UAH: 390, RUB: 175, TRY: 500,
  CAD: 11600, MXN: 930, BRL: 3200, ARS: 15.5, CLP: 17, COP: 3.9, PEN: 4200, UYU: 390,
  AED: 4300, QAR: 4340, KWD: 51300, BHD: 41900, OMR: 41100, JOD: 22300, ILS: 4300, EGP: 510, ZAR: 860,
  NGN: 10.5, KES: 123, GHS: 1300, MAD: 1570, TND: 5200,
  NZD: 9600, FJD: 7000, PGK: 4100, XOF: 26, XAF: 26,
};

const faqItems = [
  { question: 'Kurs mana yang paling akurat?', answer: 'Kurs Bank Indonesia (kurs tengah) adalah referensi resmi. Untuk transaksi, gunakan kurs yang ditawarkan bank atau money changer tempat kamu bertransaksi, yang biasanya sedikit berbeda dari kurs BI.' },
  { question: 'Apakah kurs di kalkulator ini real-time?', answer: 'Kurs yang ditampilkan adalah kurs estimasi/referensi yang diperbarui berkala, bukan live real-time. Untuk transaksi penting, selalu konfirmasi kurs terbaru ke bank atau money changer.' },
  { question: 'Dimana tukar uang asing yang paling menguntungkan?', answer: 'Umumnya: bank devisa > money changer resmi > ATM luar negeri > kartu kredit > bandara. Bandingkan beberapa tempat dan perhatikan total biaya termasuk fee transaksi.' },
  { question: 'Bagaimana cara transfer uang ke luar negeri?', answer: 'Bisa via transfer bank (SWIFT), Wise/Remitly (biaya lebih murah), atau Western Union. Wise umumnya memberikan kurs terbaik dengan fee terendah untuk transfer internasional.' },
];

const heroTags = ['💵 USD', '💶 EUR', '💷 GBP', '💴 JPY'];

const currencyTerms = [
  { term: 'Kurs', def: 'Nilai tukar antara dua mata uang yang berubah setiap saat.' },
  { term: 'Kurs Tengah', def: 'Rata-rata kurs beli dan jual Bank Indonesia, digunakan sebagai referensi.' },
  { term: 'Kurs Jual', def: 'Harga di mana bank menjual valuta asing kepada nasabah.' },
  { term: 'Kurs Beli', def: 'Harga di mana bank membeli valuta asing dari nasabah.' },
  { term: 'Devisa', def: 'Valuta asing yang diterima sebagai alat pembayaran internasional.' },
  { term: 'Spread', def: 'Selisih antara kurs jual dan kurs beli sebagai keuntungan bank/money changer.' },
];

type CurrencyDirection = 'from' | 'to';
const defaultCurrencyInputs = {
  dari: 'IDR',
  ke: 'USD',
  fromAmount: 100,
  toAmount: 0,
  lastTouched: 'from' as CurrencyDirection,
};
type CurrencyInputState = typeof defaultCurrencyInputs;
type ConversionRecord = {
  id: string;
  timestamp: string;
  dari: string;
  ke: string;
  fromAmount: number;
  toAmount: number;
};

const convertFromTo = (amount: number, from: string, to: string, rates: Record<string, number>) => {
  const inIDR = amount * (rates[from] || 1);
  return inIDR / (rates[to] || 1);
};

const convertToFrom = (amount: number, from: string, to: string, rates: Record<string, number>) => {
  const inIDR = amount * (rates[to] || 1);
  return inIDR / (rates[from] || 1);
};

function CurrencySelect({ value, onChange, label, id }: {
  value: string;
  onChange: (code: string) => void;
  label: string;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = currencies.find(c => c.code === value);
  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="currency-select-wrapper" style={{ position: 'relative' }}>
      <label className="input-label" htmlFor={id}>{label}</label>
      <button
        id={id}
        type="button"
        className="currency-select-trigger"
        onClick={() => { setOpen(!open); setSearch(''); }}
        style={{
          width: '100%',
          minHeight: 46,
          borderRadius: 12,
          border: '1.5px solid var(--border)',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{selected?.flag} {selected?.code}</span>
        <span className="currency-select-name" style={{ color: 'var(--muted)', fontSize: 12, flex: 1 }}>{selected?.name}</span>
        <span className="currency-select-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="currency-select-dropdown"
          style={{
            position: 'absolute',
            zIndex: 100,
            left: 0,
            right: 0,
            top: 'calc(100% + 6px)',
            background: '#fff',
            border: '1px solid rgba(15,23,42,.1)',
            borderRadius: 12,
            boxShadow: '0 10px 28px rgba(15,23,42,.16)',
            maxHeight: 280,
            overflow: 'hidden',
          }}
        >
          <input
            type="text"
            className="currency-search-input"
            placeholder="Cari mata uang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderBottom: '1px solid rgba(15,23,42,.08)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div className="currency-select-list" style={{ overflowY: 'auto', maxHeight: 240 }}>
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                className={`currency-select-option${value === c.code ? ' active' : ''}`}
                onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  border: 'none',
                  background: value === c.code ? 'rgba(13,148,136,0.1)' : '#fff',
                  color: value === c.code ? 'var(--teal)' : 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span className="currency-flag">{c.flag}</span>
                <span className="currency-code" style={{ width: 42, fontWeight: 700 }}>{c.code}</span>
                <span className="currency-name" style={{ color: 'var(--muted)', fontSize: 12 }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



export default function CurrencyPage() {
  const [conversion, setConversion] = useLocalStorage<CurrencyInputState>('kalkunesia_currency_inputs', defaultCurrencyInputs);
  const { dari, ke, fromAmount, toAmount, lastTouched } = conversion;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [history, setHistory] = useLocalStorage<ConversionRecord[]>('kalkunesia_currency_history', []);
  useScrollReveal(); useBackToTop();

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/IDR');
        const data = await res.json();
        if (data.result === 'success' && data.rates) {
          const idrRates: Record<string, number> = { IDR: 1 };
          for (const [code, rate] of Object.entries(data.rates)) {
            if (code !== 'IDR') {
              idrRates[code] = 1 / (rate as number);
            }
          }
          setRates(idrRates);
          setLastUpdate(data.time_last_update_utc || new Date().toLocaleDateString('id-ID'));
        }
      } catch {
        try {
          const res = await fetch('https://api.frankfurter.app/latest?from=IDR');
          const data = await res.json();
          if (data.rates) {
            const idrRates: Record<string, number> = { IDR: 1 };
            for (const [code, rate] of Object.entries(data.rates)) {
              if (code !== 'IDR') {
                idrRates[code] = 1 / (rate as number);
              }
            }
            setRates(idrRates);
            setLastUpdate(data.date || new Date().toLocaleDateString('id-ID'));
          }
        } catch {
          setLastUpdate('Offline mode — kurs estimasi');
        }
      }
      setLoading(false);
    }
    fetchRates();
  }, []);

  const result = toAmount;
  const kurs = (rates[dari] || 1) / (rates[ke] || 1);

  useEffect(() => {
    const e: Record<string, string> = {};
    const amountToValidate = lastTouched === 'from' ? fromAmount : toAmount;
    const label = lastTouched === 'from' ? 'Nominal' : 'Hasil';
    const v1 = validateInput(amountToValidate, { min: 0.01, required: true, label });
    if (v1) e.amount = v1;
    setErrors(e);
    setShow(Object.keys(e).length === 0);
  }, [fromAmount, toAmount, lastTouched]);

  const handleFromAmountChange = (value: number) => {
    setConversion(prev => ({
      ...prev,
      fromAmount: value,
      toAmount: convertFromTo(value, prev.dari, prev.ke, rates),
      lastTouched: 'from',
    }));
  };

  const handleToAmountChange = (value: number) => {
    setConversion(prev => ({
      ...prev,
      toAmount: value,
      fromAmount: convertToFrom(value, prev.dari, prev.ke, rates),
      lastTouched: 'to',
    }));
  };

  const handleCurrencyChange = (key: 'dari' | 'ke', value: string) => {
    setConversion(prev => {
      const next = { ...prev, [key]: value };
      if (prev.lastTouched === 'from') {
        return { ...next, toAmount: convertFromTo(prev.fromAmount, next.dari, next.ke, rates) };
      }
      return { ...next, fromAmount: convertToFrom(prev.toAmount, next.dari, next.ke, rates) };
    });
  };

  const swapCurrencies = () => {
    setConversion(prev => {
      const swapped = { ...prev, dari: prev.ke, ke: prev.dari };
      if (prev.lastTouched === 'from') {
        return { ...swapped, toAmount: convertFromTo(prev.fromAmount, swapped.dari, swapped.ke, rates) };
      }
      return { ...swapped, fromAmount: convertToFrom(prev.toAmount, swapped.dari, swapped.ke, rates) };
    });
  };

  const resetCurrency = () => {
    setConversion(defaultCurrencyInputs);
    setErrors({});
    setShow(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!show) return;
      const entry: ConversionRecord = {
        id: `${Date.now()}-${Math.round(Math.random() * 10000)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        dari,
        ke,
        fromAmount,
        toAmount,
      };
      setHistory(prev => {
        if (
          prev[0] &&
          prev[0].dari === entry.dari &&
          prev[0].ke === entry.ke &&
          prev[0].fromAmount === entry.fromAmount &&
          prev[0].toAmount === entry.toAmount
        ) {
          return prev;
        }
        return [entry, ...prev].slice(0, 5);
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [fromAmount, toAmount, dari, ke, show, setHistory]);

  const clearHistory = () => setHistory([]);

  return (
    <>
      <Script id="currency-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Konversi Mata Uang — Kalkunesia',
          description: 'Konversi rupiah ke mata uang dunia dengan kurs terkini.',
          url: 'https://kalkunesia.com/tools/currency',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Currency Converter" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="💱" badge="IDR" title="Currency Converter" subtitle="Konversi mata uang utama dunia ke Rupiah dan sebaliknya. Kurs referensi diperbarui setiap hari kerja." tags={heroTags} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Currency robot</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8"/>
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53"/>
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9"/>
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff"/>
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9"/>
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff"/>
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6"/>
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448"/>
            <rect className="robot-badge" x="30" y="62" width="30" height="20" rx="6" fill="#0D9488" opacity="0.85"/>
            <text x="45" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">IDR</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <rect x="66" y="44" width="26" height="18" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5"/>
            <line x1="69" y1="50" x2="89" y2="50" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="69" y1="54" x2="89" y2="54" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round"/>
            <text x="79" y="60" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0D9488">FX</text>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
          </svg>
        </div>
      </div>

      <ToolLayout
        sidebar={
          <>
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard title="💡 Tips Kurs Valuta" items={[{ icon: '🏦', text: 'Kurs BI vs Bank — Kurs Bank Indonesia adalah referensi. Kurs bank biasanya lebih tinggi 1-2%.' },{ icon: '💳', text: 'Kartu kredit luar negeri — Biasanya menggunakan kurs Visa/Mastercard + spread 1-3%.' },{ icon: '✈️', text: 'Hindari tukar di bandara — Kurs di money changer bandara biasanya paling buruk.' },{ icon: '📱', text: 'Gunakan GoPay/OVO — Beberapa fintech menawarkan kurs lebih kompetitif untuk transfer internasional.' }]} />
            <RelatedToolsCard items={[{ icon: '📈', name: 'ROI Calculator', desc: 'Analisis investasi valas', href: '/tools/roi' },{ icon: '💹', name: 'Compound Interest', desc: 'Simulasi tabungan valas', href: '/tools/compound' },{ icon: '🏠', name: 'KPR Calculator', desc: 'Hitung KPR dalam IDR', href: '/tools/kpr' }]} />
            <KamusCard terms={currencyTerms} />
            <BlogCard posts={[{ title: 'Cara Transfer Uang ke Luar Negeri yang Murah', category: 'Keuangan Global', readTime: '4 menit', slug: 'transfer-uang-luar-negeri' },{ title: 'Kenapa Kurs Rupiah Bisa Naik Turun?', category: 'Ekonomi', readTime: '5 menit', slug: 'faktor-kurs-rupiah' }]} />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Currency Converter</div>
          <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 14, padding: 16, marginBottom: 20, fontFamily: "'Inconsolata',monospace", fontSize: 10, color: '#92400E', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' as const }}>
            ⚠️ Kurs di bawah adalah kurs referensi estimasi. Untuk transaksi nyata, cek kurs Bank Indonesia atau bank kamu.
            {lastUpdate && <div style={{ marginTop: 4, opacity: 0.7 }}>Update: {lastUpdate}</div>}
            {loading && <div style={{ marginTop: 4 }}>🔄 Memuat kurs terbaru...</div>}
          </div>
          <div className="input-grid">
            <div className="input-group full">
              <label className="input-label" htmlFor="nominal-input">Nominal</label>
              <div className="input-wrap">
                <span className="input-prefix">{dari}</span>
                <input
                  id="nominal-input"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.amount && lastTouched === 'from' ? ' input-error' : ''}`}
                  value={formatNumber(fromAmount)}
                  onChange={e => {
                    handleFromAmountChange(parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  min={0.01}
                  step="any"
                />
              </div>
              <input
                type="range"
                className="slider"
                min={1}
                max={100000000}
                step={1000}
                value={fromAmount}
                onChange={e => handleFromAmountChange(parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>1</span><span>100.000.000</span></div>
              {errors.amount && lastTouched === 'from' && <div className="error-msg">{errors.amount}</div>}
            </div>
            <div className="input-group full">
              <label className="input-label" htmlFor="hasil-input">Hasil</label>
              <div className="input-wrap">
                <span className="input-prefix">{ke}</span>
                <input
                  id="hasil-input"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.amount && lastTouched === 'to' ? ' input-error' : ''}`}
                  value={formatNumber(toAmount)}
                  onChange={e => {
                    handleToAmountChange(parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  min={0.01}
                  step="any"
                />
              </div>
              {errors.amount && lastTouched === 'to' && <div className="error-msg">{errors.amount}</div>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, textAlign: 'center' }}>
              Edit salah satu input, nilai lain akan otomatis menyesuaikan (bidirectional conversion).
            </div>
            <div className="input-group full">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 20 }}>
                <CurrencySelect
                  id="dari"
                  label="Dari"
                  value={dari}
                  onChange={value => handleCurrencyChange('dari', value)}
                />
                <div style={{ paddingBottom: 4 }}>
                  <button
                    type="button"
                    onClick={swapCurrencies}
                    style={{
                      background: 'var(--teal)', color: '#fff', border: 'none',
                      borderRadius: '50%', width: 40, height: 40, fontSize: 20,
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    title="Tukar arah konversi"
                    onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(180deg)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
                  >
                    ⇄
                  </button>
                </div>
                <CurrencySelect
                  id="ke"
                  label="Ke"
                  value={ke}
                  onChange={value => handleCurrencyChange('ke', value)}
                />
              </div>
            </div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Konversi</div>
            <div className="result-grid result-grid-2">
              <div className="result-card highlight"><div className="result-label">{dari}</div><div className="result-value">{fromAmount.toLocaleString('id-ID', { maximumFractionDigits: 4 })}</div><div className="result-sub">1 {dari} = {kurs.toFixed(4)} {ke}</div></div>
              <div className="result-card"><div className="result-label">{ke}</div><div className="result-value">{toAmount.toLocaleString('id-ID', { maximumFractionDigits: 4 })}</div><div className="result-sub">Bidirectional update aktif</div></div>
            </div>
            <div className="bracket-badge">
              {loading ? '🔄 Memuat kurs...' : `Kurs Live: 1 ${dari} = ${kurs.toFixed(4)} ${ke}`}
              {!loading && lastUpdate && <span style={{marginLeft: 8, opacity: 0.7, fontSize: 10}}>· {lastUpdate}</span>}
            </div>
            <table className="result-table"><thead><tr><th>Pair</th><th>Kurs Referensi</th></tr></thead><tbody>
              <tr><td>1 {dari} = ? IDR</td><td className="right">{(rates[dari] || 0).toLocaleString('id-ID')}</td></tr>
              <tr><td>1 {ke} = ? IDR</td><td className="right">{(rates[ke] || 0).toLocaleString('id-ID')}</td></tr>
              <tr><td>1 {dari} = ? {ke}</td><td className="right">{kurs.toFixed(4)}</td></tr>
              <tr><td>1 {ke} = ? {dari}</td><td className="right">{(1 / kurs).toFixed(6)}</td></tr>
            </tbody></table>
            <div style={{ marginTop: 20, padding: 16, borderRadius: 14, border: '1px solid rgba(15,23,42,.1)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <strong style={{ fontSize: 14 }}>Riwayat konversi (5 terakhir)</strong>
                <button type="button" className="action-btn" style={{ fontSize: 12, padding: '6px 10px' }} onClick={clearHistory} disabled={!history.length}>Clear History</button>
              </div>
              {history.length ? (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map(entry => (
                    <li key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{entry.fromAmount.toLocaleString('id-ID', { maximumFractionDigits: 4 })} {entry.dari} → {entry.toAmount.toLocaleString('id-ID', { maximumFractionDigits: 4 })} {entry.ke}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{entry.timestamp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Belum ada riwayat. Lakukan konversi untuk menyimpannya.</div>
              )}
            </div>
            <div className="action-bar" style={{ gap: 8 }}>
              <button className="action-btn" type="button" onClick={resetCurrency}>🔁 Reset</button>
              <button className="action-btn copy" type="button" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy Hasil</button>
              <button className="action-btn share" type="button" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button className="action-btn pdf" type="button" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton
                toolId="currency"
                toolName="Currency Converter"
                inputs={{ dari, ke, fromAmount, toAmount }}
                result={{ hasil: toAmount, rate: kurs }}
                disabled={!show}
              />
            </div>
            <p className="calc-disclaimer">* Bidirectional conversion ini menyimpan 5 hasil terakhir secara lokal. Untuk transaksi riil, selalu konfirmasi kurs terbaru ke bank atau money changer yang kamu gunakan.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Currency Converter" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="currency" /></div>
      <FooterSimple />
    </>
  );
}
