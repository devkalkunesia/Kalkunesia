# Kalkunesia — Rules & Coding Standards
> Wajib dipatuhi oleh semua AI agent saat mengerjakan project ini.

---

## PROJECT OVERVIEW

**Kalkunesia** adalah website kalkulator finansial Indonesia.
- **URL**: https://kalkunesia.com
- **Stack**: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Clerk · Sanity CMS
- **Runtime**: Bun
- **Deploy**: Vercel / Cloudflare Pages

---

## STRUKTUR FOLDER

```
kalkunesia/
├── app/
│   ├── tools/[nama-tool]/   # Setiap tool punya folder sendiri
│   │   ├── page.tsx         # Komponen utama tool
│   │   ├── layout.tsx       # Layout + metadata SEO
│   │   └── [nama].css       # CSS khusus tool (opsional)
│   ├── blog/                # Halaman blog (Sanity CMS)
│   ├── dashboard/           # Dashboard history user
│   └── layout.tsx           # Root layout
├── components/              # Komponen reusable
├── lib/                     # Utilities, hooks, helpers
├── public/                  # Static assets
└── supabase/                # Schema database
```

---

## ATURAN UMUM

### ❌ DILARANG
- Mengubah file di luar yang sudah disetujui di Checkpoint 1
- Install dependency baru tanpa izin user
- Menghapus atau mengubah schema Supabase tanpa konfirmasi
- Mengubah file `layout.tsx` root tanpa izin
- Mengubah konfigurasi `next.config.ts`, `tailwind.config`, atau `eslint.config.mjs`
- Hardcode nilai yang seharusnya dari environment variable
- Menyimpan data sensitif (API key, password) di dalam kode

### ✅ WAJIB
- Selalu ikuti pattern komponen yang sudah ada
- Gunakan komponen reusable yang sudah tersedia sebelum buat baru
- Pastikan setiap tool punya metadata SEO yang lengkap di `layout.tsx`
- Semua kalkulasi finansial harus akurat dan sesuai regulasi Indonesia 2025
- Semua angka Rupiah menggunakan `formatRupiah()` dari `lib/utils`
- Semua input numerik menggunakan `formatNumber()` dan `parseNumber()` dari `lib/utils`

---

## TYPESCRIPT

- **Wajib** gunakan TypeScript untuk semua file baru
- Hindari penggunaan `any` — gunakan tipe yang spesifik
- State typing wajib eksplisit: `useState<Record<string, string>>({})`
- Props interface wajib didefinisikan untuk komponen baru
- Gunakan `useLocalStorage` dari `lib/hooks` untuk persist input user

```typescript
// ✅ BENAR
const [errors, setErrors] = useState<Record<string, string>>({});

// ❌ SALAH
const [errors, setErrors] = useState<any>({});
```

---

## STYLING — TAILWIND v4 + CSS

- **Utamakan** Tailwind utility classes untuk styling
- CSS custom boleh dipakai untuk animasi kompleks atau override yang tidak bisa dengan Tailwind
- CSS variables menggunakan `var(--nama)` — lihat `globals.css` untuk daftar lengkap
- Jangan pakai inline style kecuali untuk nilai dinamis (hasil kalkulasi)
- Responsif wajib: semua tool harus mobile-friendly

### CSS Variables yang tersedia:
```css
var(--navy)    /* Warna utama gelap */
var(--teal)    /* Warna aksen hijau */
var(--border)  /* Warna border */
var(--bg)      /* Background */
var(--text)    /* Warna teks */
```

---

## KOMPONEN — PATTERN WAJIB

Setiap halaman tool **wajib** menggunakan struktur ini:

```tsx
<>
  {/* Schema.org JSON-LD */}
  <script type="application/ld+json" ... />

  <Navbar variant="simple" />
  <Breadcrumb toolName="Nama Tool" />
  <ToolHero icon="🎯" badge="LABEL" title="..." subtitle="..." tags={[...]} />

  <ToolLayout sidebar={
    <>
      <AdSenseBox size="rectangle" />
      <TipsCard ... />
      <RelatedToolsCard ... />
      <KamusCard ... />   {/* Opsional tapi disarankan */}
      <BlogCard ... />
    </>
  }>
    {/* Konten kalkulator */}
    <div className="calc-card">
      ...
    </div>
  </ToolLayout>

  <FaqSection ... />
  <MoreTools exclude="nama-tool" />
  <FooterSimple />
</>
```

---

## KOMPONEN REUSABLE — REFERENSI

### Sudah tersedia di `components/`:
| Komponen | Kegunaan |
|----------|----------|
| `Navbar` | Navigasi utama |
| `Breadcrumb` | Breadcrumb navigasi |
| `ToolHero` | Hero section tiap tool |
| `ToolLayout` | Layout 2 kolom (main + sidebar) |
| `AdSenseBox` | Slot iklan AdSense |
| `FaqSection` | Seksi FAQ |
| `MoreTools` | Grid tool lainnya |
| `SaveHistoryButton` | Simpan ke history Supabase |
| `TipsCard` | Kartu tips di sidebar |
| `RelatedToolsCard` | Kartu tool terkait di sidebar |
| `KamusCard` | Kartu kamus istilah di sidebar |
| `BlogCard` | Kartu artikel blog di sidebar |
| `FooterSimple` | Footer halaman tool |

---

## UTILITY FUNCTIONS — `lib/utils.ts`

Selalu gunakan fungsi yang sudah ada:

```typescript
formatRupiah(value)           // Format angka ke "Rp 1.000.000"
formatNumber(value)           // Format angka dengan titik ribuan
parseNumber(str)              // Parse string ke number (hapus titik)
validateInput(value, options) // Validasi input dengan pesan error
copyResult()                  // Copy hasil ke clipboard
shareResult()                 // Share via Web Share API
exportPDF()                   // Export hasil ke PDF
showToast(message)            // Tampilkan notifikasi toast
```

---

## HOOKS — `lib/hooks.ts`

```typescript
useLocalStorage(key, defaultValue)  // Persist state ke localStorage
useScrollReveal()                   // Animasi reveal saat scroll
useBackToTop()                      // Tombol back to top
```

---

## KALKULASI FINANSIAL

- Semua rumus harus sesuai **regulasi Indonesia 2025**
- Cantumkan referensi regulasi di komentar kode
- Gunakan `Math.min()` dan `Math.max()` untuk batas cap/floor
- Jangan bulatkan hasil kalkulasi kecuali memang diperlukan

```typescript
// ✅ BENAR — cantumkan referensi
// BPJS Kesehatan: PP No. 64/2020 — 5% dari gaji, cap Rp 12jt
const capKes = 12_000_000;
const dasarKes = Math.min(gaji, capKes);
```

---

## AUTO-CALCULATE PATTERN

Semua tool **wajib** menggunakan auto-calculate (bukan tombol hitung manual):

```typescript
const hitung = useCallback(() => {
  // validasi
  // kalkulasi
  // set result
}, [dependency1, dependency2]);

useEffect(() => {
  const t = setTimeout(hitung, 300); // debounce 300ms
  return () => clearTimeout(t);
}, [hitung]);
```

---

## SEO — LAYOUT.TSX

Setiap tool wajib punya `layout.tsx` dengan metadata lengkap:

```typescript
export const metadata: Metadata = {
  title: 'Nama Tool — Kalkunesia',
  description: 'Deskripsi singkat tool, max 160 karakter.',
  keywords: ['kata kunci 1', 'kata kunci 2'],
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://kalkunesia.com/tools/nama-tool',
  },
};
```

---

## KOMENTAR KODE

- Komentar dalam **Bahasa Indonesia**
- Wajib untuk: kalkulasi kompleks, regex, dan logika bisnis
- Tidak perlu untuk: kode yang sudah self-explanatory

```typescript
// ✅ BENAR
// JHT: 5.7% dari gaji — 3.7% perusahaan, 2% karyawan (PP No. 46/2015)
const jhtKary = gaji * 0.02;

// ❌ TIDAK PERLU
// Set state show ke true
setShow(true);
```

---

## SUPABASE

- Jangan pernah expose `service_role` key di client-side
- Gunakan `supabase` client dari `lib/supabase.ts`
- Semua query wajib handle error
- Jangan ubah schema tanpa konfirmasi user

---

## CLERK (AUTH)

- Gunakan `ClerkClientProvider` dari `components/ClerkClientProvider.tsx`
- Protected route menggunakan middleware Clerk
- Jangan expose user data yang tidak diperlukan

---

## NAMING CONVENTION

| Jenis | Format | Contoh |
|-------|--------|--------|
| Komponen | PascalCase | `ToolHero`, `SaveHistoryButton` |
| File komponen | PascalCase | `Navbar.tsx`, `FaqSection.tsx` |
| File halaman | lowercase | `page.tsx`, `layout.tsx` |
| Folder tool | kebab-case | `pph-21`, `dana-darurat` |
| Fungsi | camelCase | `formatRupiah`, `handleSubmit` |
| Konstanta | camelCase atau UPPER_SNAKE | `capKes`, `MAX_GAJI` |
| localStorage key | `kalkunesia_[tool]_[type]` | `kalkunesia_bpjs_inputs` |

---

## LARANGAN KERAS

1. **Jangan hapus** komponen atau fungsi yang dipakai tool lain
2. **Jangan ubah** `globals.css` kecuali menambahkan variabel baru
3. **Jangan commit** file `.env.local` atau file berisi secret
4. **Jangan pakai** `document.write()` atau manipulasi DOM langsung
5. **Jangan pakai** `eval()` atau fungsi berbahaya lainnya
6. **Jangan ubah** struktur data history Supabase tanpa konfirmasi

---

*Kalkunesia Rules & Coding Standards · v1.0 · 2025*
