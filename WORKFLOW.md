# Kalkunesia AI Workflow
> OpenCode Codex 5.3 · Multi-Agent System · v1.0

---

## LANGKAH 0 — KLASIFIKASI TASK

**Sisyphus (Manager)** wajib klasifikasi task sebelum mulai, berdasarkan kriteria objektif berikut:

### SEDERHANA → Skip step 1 & 2, langsung ke EXECUTE
- Menyentuh ≤ 2 file
- Estimasi < 50 baris kode
- Tidak mengubah logika / kalkulasi
- Tidak menyentuh Supabase, Clerk, atau API external
- Contoh: perbaikan UI minor, fix typo, tweak warna/spacing

### KOMPLEKS → Full 5 Step
- Menyentuh ≥ 3 file
- Estimasi ≥ 50 baris kode
- Mengubah logika kalkulasi atau struktur data
- Menyentuh Supabase, Clerk, Sanity, atau API external
- Ada risiko breaking change ke komponen lain
- Contoh: fitur baru, refactor kalkulasi, integrasi API

> ⚠️ Kalau ragu → default ke **KOMPLEKS** (lebih aman)

---

## ALUR KERJA — 5 LANGKAH

```
[1. PLAN] → [2. ARCHITECT] → ✦ CHECKPOINT 1 ✦ → [3. EXECUTE] → [4. REVIEW] → ✦ CHECKPOINT 2 ✦ → [5. CLEANUP]
```

---

### STEP 1 — PLAN
**Agent: Sisyphus (Manager)**

- Baca dan pahami task secara menyeluruh
- Breakdown menjadi sub-tasks yang spesifik dan terurut
- Identifikasi risiko dan dependensi antar sub-task
- Estimasi kompleksitas tiap sub-task

**Output wajib:**
```
📋 PLAN:
- Sub-task 1: [deskripsi]
- Sub-task 2: [deskripsi]
- Risiko: [kalau ada]
- Estimasi: [jumlah file, baris kode]
```

---

### STEP 2 — ARCHITECT
**Agent: Prometheus (Architect)**

- Tentukan file mana saja yang akan diubah
- Antisipasi side effects ke komponen/halaman lain
- Tentukan urutan eksekusi yang aman
- Pastikan tidak ada breaking change yang tidak disengaja

**Output wajib:**
```
🏗 ARCHITECT:
- File diubah: [daftar file]
- File terdampak: [file yang mungkin kena efek]
- Urutan eksekusi: [urutan aman]
- Side effect potensial: [kalau ada]
```

---

### ✦ CHECKPOINT 1 — USER REVIEW PLAN
> **STOP. Tunggu persetujuan user sebelum lanjut.**

Presentasikan ringkasan PLAN + ARCHITECT kepada user:
- File apa saja yang akan diubah
- Apa yang akan dilakukan
- Risiko potensial

**Lanjut hanya jika user menyetujui.**

---

### STEP 3 — EXECUTE
**Agent: Executor (Code) + Oracle (Debug) — jalankan PARALEL**

- **Executor**: implementasi kode sesuai plan
- **Oracle**: monitor dan debug error secara realtime
- Ikuti RULES.md secara ketat saat menulis kode
- Jangan ubah file di luar daftar yang sudah disetujui
- Commit progress per sub-task selesai

**Error handling:**
- Error pertama → Oracle diagnosa dan fix
- Error kedua → Oracle coba solusi alternatif
- Error ketiga → STOP, rollback, lapor ke user (lihat Rollback Rule)

---

### STEP 4 — REVIEW
**Agent: Reviewer (Quality) + Security (Audit) — jalankan PARALEL**

- **Reviewer**: cek kualitas kode, konsistensi, dan kesesuaian dengan RULES.md
- **Security**: cek celah keamanan, validasi input, exposure data sensitif
- Pastikan tidak ada regresi dari perubahan

**Output wajib:**
```
🔍 REVIEW:
- Quality: [PASS / ISSUES FOUND]
- Security: [PASS / ISSUES FOUND]
- Issues: [daftar kalau ada]
```

---

### ✦ CHECKPOINT 2 — USER REVIEW HASIL
> **STOP. Tunggu persetujuan user sebelum finalize.**

Presentasikan hasil kepada user:
```
✅ File diubah: [nama file]
✅ Apa yang diubah: [ringkasan]
⚠️ Side effect potensial: [kalau ada]
📋 Next step: [rekomendasi]
```

**Lanjut ke CLEANUP hanya jika user menyetujui.**

---

### STEP 5 — CLEANUP
**Agent: Refactorer**

- Hapus kode yang tidak terpakai (dead code)
- Hapus console.log dan debug statement
- Rapikan import yang tidak digunakan
- Pastikan context limit tetap di bawah 50%
- Buang semua trace dan log yang tidak diperlukan

---

## ATURAN PENTING

### 🔄 Rollback Rule
Jika error tidak selesai dalam **3 percobaan berturut-turut**:
1. STOP — jangan lanjut eksekusi
2. Rollback semua perubahan ke kondisi awal
3. Lapor ke user dengan detail error yang terjadi
4. Tunggu instruksi dari user

### 📋 Output Format
Setiap checkpoint **wajib** menggunakan format laporan standar:
```
✅ File diubah: [nama file]
✅ Apa yang diubah: [ringkasan singkat]
⚠️ Side effect potensial: [kalau ada, atau "Tidak ada"]
📋 Next step: [rekomendasi langkah berikutnya]
```

### 🧹 Context Management
- Pantau context limit setiap selesai 1 step
- Jika context mendekati 50% → buang trace dan log lama
- Jika context mendekati 70% → STOP, lapor ke user
- Prioritaskan menyimpan: task aktif, file yang sedang dikerjakan, error terkini

### ⚡ Paralel Execution
- Step 3: **Executor + Oracle** wajib jalan paralel
- Step 4: **Reviewer + Security** wajib jalan paralel
- Maksimalkan spawn sub-agent untuk efisiensi
- Pantau dan arahkan sub-agent agar tetap sesuai plan

---

## JALUR EKSEKUSI RINGKAS

| Task | Jalur |
|------|-------|
| SEDERHANA | Step 3 → Step 4 → Checkpoint 2 → Step 5 |
| KOMPLEKS | Step 1 → Step 2 → Checkpoint 1 → Step 3 → Step 4 → Checkpoint 2 → Step 5 |

---

## PERAN

| Siapa | Tugasnya |
|-------|----------|
| **Claude (Sonnet)** | Diskusi, buat prompt detail, review arsitektur |
| **Kamu (User)** | Approve di setiap checkpoint |
| **OpenCode (Codex)** | Eksekusi: plan → code → debug → review → cleanup |

---

*Kalkunesia AI Workflow · v1.0 · 2025*
