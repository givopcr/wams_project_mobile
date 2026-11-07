<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\TransaksiStok;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BarangController extends Controller
{
    /**
     * Manajemen Master Barang & Unit Fisik
     */
    public function index(Request $request): Response
    {
        $query = Barang::with([
            'kategori',
            'units' => function ($q) {
                $q->withCount('validLogbooks as total_peminjaman')
                  ->with(['latestUsageLogbook.user', 'activeLogbook.user']);
            }
        ]);

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->filled('tipe') && in_array($request->tipe, ['aset', 'habis_pakai'])) {
            $tipe = $request->tipe;
            if ($tipe === 'habis_pakai') {
                $query->where('tipe', 'habis_pakai');
            } else {
                $query->where(fn ($sub) => $sub->where('tipe', 'aset')->orWhereNull('tipe'));
            }
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%")
                  ->orWhereHas('units', fn ($qu) => $qu->where('kode_unit', 'like', "%{$search}%"));
            });
        }

        $barangList = $query->latest()->paginate(10)->withQueryString();

        $barangList->getCollection()->transform(function ($b) {
            $tipeBarang = $b->isHabisPakai() ? 'habis_pakai' : 'aset';
            $isHabisPakai = $tipeBarang === 'habis_pakai';
            return [
                'id' => $b->id,
                'kategori_id' => $b->kategori_id,
                'nama_kategori' => $b->kategori ? $b->kategori->nama_kategori : '-',
                'tipe' => $tipeBarang,
                'tipe_kategori' => $tipeBarang,
                'nama_barang' => $b->nama_barang,
                'kode_barang' => $b->kode_barang,
                'satuan' => $b->satuan,
                'stok_saat_ini' => (float) $b->stok_saat_ini,
                'stok_minimum' => (float) $b->stok_minimum,
                'is_low_stock' => $isHabisPakai ? $b->isLowStock() : false,
                'detail_spesifikasi' => $b->detail_spesifikasi,
                'lokasi' => $b->lokasi,
                'gambar_url' => $b->gambar ? asset('storage/'.$b->gambar) : null,
                'total_unit' => $b->units->count(),
                'tersedia' => $b->units->where('status', 'tersedia')->count(),
                'dipinjam' => $b->units->where('status', 'dipinjam')->count(),
                'maintenance' => $b->units->where('status', 'maintenance')->count(),
                'perlu_persetujuan' => (bool) $b->perlu_persetujuan,
                'units' => $b->units->map(function ($u) use ($b) {
                    $latestLog = $u->latestUsageLogbook;
                    $isCurrentlyBorrowed = $u->status === 'dipinjam' || ($latestLog && $latestLog->status_transaksi === 'dipinjam');

                    $lastUsage = null;
                    if ($latestLog) {
                        $lastUsage = [
                            'id' => $latestLog->id,
                            'peminjam_nama' => $latestLog->peminjam_nama,
                            'tipe_peminjam' => $latestLog->tipe_peminjam,
                            'tanggal_pinjam' => $latestLog->tanggal_pinjam ? $latestLog->tanggal_pinjam->format('d-m-Y') : null,
                            'tanggal_kembali' => $latestLog->tanggal_kembali ? $latestLog->tanggal_kembali->format('d-m-Y') : null,
                            'tanggal_display' => $latestLog->tanggal_kembali ? $latestLog->tanggal_kembali->format('d-m-Y') : ($latestLog->tanggal_pinjam ? $latestLog->tanggal_pinjam->format('d-m-Y') : '-'),
                            'kondisi_kembali' => $latestLog->kondisi_kembali ?: ($isCurrentlyBorrowed ? 'Sedang Dipinjam' : ($u->kondisi ?: 'baik')),
                            'catatan_kembali' => $latestLog->catatan_kembali,
                            'foto_kembali_url' => $latestLog->foto_kembali_url ?: ($isCurrentlyBorrowed ? $latestLog->foto_pinjam_url : null),
                            'foto_pinjam_url' => $latestLog->foto_pinjam_url,
                            'is_active' => $isCurrentlyBorrowed,
                        ];
                    }

                    return [
                        'id' => $u->id,
                        'kode_unit' => $u->kode_unit,
                        'status' => $u->status,
                        'kondisi' => $u->kondisi,
                        'gambar' => $u->gambar,
                        'unit_gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : null,
                        'gambar_url' => $u->gambar ? asset('storage/'.$u->gambar) : ($b->gambar ? asset('storage/'.$b->gambar) : null),
                        'total_peminjaman' => (int) ($u->total_peminjaman ?? 0),
                        'last_usage' => $lastUsage,
                    ];
                })->values(),
            ];
        });

        $categories = KategoriBarang::withCount('barang')->with(['units', 'barang'])->get();

        $categoryStats = $categories->map(function ($k) {
            $habisPakaiItems = $k->barang->filter(fn ($b) => $b->isHabisPakai());
            $isMostlyHabisPakai = ($k->tipe ?? 'aset') === 'habis_pakai' || ($k->barang_count > 0 && $habisPakaiItems->count() === $k->barang_count);
            $lowStockCount = $habisPakaiItems->filter(fn ($b) => (float) $b->stok_saat_ini <= (float) $b->stok_minimum)->count();
            $safeStockCount = max(0, $habisPakaiItems->count() - $lowStockCount);

            return [
                'id' => $k->id,
                'nama_kategori' => $k->nama_kategori,
                'tipe' => $isMostlyHabisPakai ? 'habis_pakai' : 'aset',
                'total_barang' => $k->barang_count,
                'total_unit' => $k->units->count(),
                'tersedia' => $k->units->where('status', 'tersedia')->count(),
                'dipinjam' => $k->units->where('status', 'dipinjam')->count(),
                'maintenance' => $k->units->where('status', 'maintenance')->count(),
                'stok_aman' => $safeStockCount,
                'stok_menipis' => $lowStockCount,
            ];
        });

        $totalAllCount = Barang::count();
        $totalHabisPakaiCount = Barang::where('tipe', 'habis_pakai')->count();
        $totalAsetCount = max(0, $totalAllCount - $totalHabisPakaiCount);
        $totalLowStockCount = Barang::where('tipe', 'habis_pakai')
            ->whereColumn('stok_saat_ini', '<=', 'stok_minimum')
            ->count();

        return Inertia::render('Barang/Index', [
            'barangList' => $barangList,
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'nama_kategori' => $c->nama_kategori,
                'tipe' => $c->tipe ?? 'aset',
            ]),
            'categoryStats' => $categoryStats,
            'globalTabCounts' => [
                'totalAll' => $totalAllCount,
                'totalAset' => $totalAsetCount,
                'totalHabisPakai' => $totalHabisPakaiCount,
                'totalLowStock' => $totalLowStockCount,
            ],
            'filters' => $request->only(['q', 'kategori_id', 'tipe']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_barang,id'],
            'tipe' => ['required', 'in:aset,habis_pakai'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:50', 'unique:barang,kode_barang'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'stok_saat_ini' => ['nullable', 'numeric', 'min:0'],
            'stok_minimum' => ['nullable', 'numeric', 'min:0'],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'perlu_persetujuan' => ['nullable', 'boolean'],
        ]);

        $validated['perlu_persetujuan'] = $request->boolean('perlu_persetujuan');

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        } else {
            unset($validated['gambar']);
        }

        $isHabisPakai = $validated['tipe'] === 'habis_pakai';
        $stokAwal = (float) ($validated['stok_saat_ini'] ?? 0);
        $validated['stok_saat_ini'] = $stokAwal;
        $validated['stok_minimum'] = (float) ($validated['stok_minimum'] ?? 0);

        $barang = Barang::create($validated);

        if ($isHabisPakai) {
            if ($stokAwal > 0) {
                TransaksiStok::create([
                    'barang_id' => $barang->id,
                    'user_id' => auth()->id(),
                    'tipe' => 'masuk',
                    'jumlah' => $stokAwal,
                    'sisa_stok' => $stokAwal,
                    'keterangan' => 'Stok awal saat pendaftaran barang',
                ]);
            }
            return back()->with('success', "Barang habis pakai {$barang->nama_barang} berhasil dibuat.");
        }

        $jumlahUnit = (int) $request->input('jumlah_unit', 0);
        if ($jumlahUnit > 0) {
            for ($i = 1; $i <= $jumlahUnit; $i++) {
                $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $i);
                BarangUnit::create([
                    'barang_id' => $barang->id,
                    'kode_unit' => $kodeUnit,
                    'status' => 'tersedia',
                    'kondisi' => 'baik',
                ]);
            }
            return back()->with('success', "Barang berhasil dibuat beserta {$jumlahUnit} unit fisik siap pakai.");
        }

        return back()->with('success', 'Barang berhasil dibuat.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);

        $validated = $request->validate([
            'kategori_id' => ['required', 'exists:kategori_barang,id'],
            'tipe' => ['required', 'in:aset,habis_pakai'],
            'nama_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:50', Rule::unique('barang', 'kode_barang')->ignore($barang->id)],
            'satuan' => ['nullable', 'string', 'max:50'],
            'stok_minimum' => ['nullable', 'numeric', 'min:0'],
            'detail_spesifikasi' => ['nullable', 'string'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'perlu_persetujuan' => ['nullable', 'boolean'],
        ]);

        $validated['perlu_persetujuan'] = $request->boolean('perlu_persetujuan');
        $validated['stok_minimum'] = (float) ($validated['stok_minimum'] ?? 0);

        if ($request->hasFile('gambar')) {
            if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        } elseif ($request->boolean('hapus_gambar')) {
            if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = null;
        } else {
            unset($validated['gambar']);
        }

        $barang->update($validated);

        return back()->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy($id): RedirectResponse
    {
        $barang = Barang::with('units')->find($id);
        if (!$barang) {
            return redirect()->route('admin.barang')->with('success', 'Barang sudah berhasil dihapus.');
        }

        if ($barang->units->whereIn('status', ['dipinjam', 'menunggu_persetujuan'])->isNotEmpty()) {
            return back()->with('error', 'Barang tidak dapat dihapus karena masih ada unit yang sedang dipinjam atau menunggu persetujuan.');
        }

        if ($barang->gambar && Storage::disk('public')->exists($barang->gambar)) {
            Storage::disk('public')->delete($barang->gambar);
        }
        foreach ($barang->units as $u) {
            if ($u->gambar && Storage::disk('public')->exists($u->gambar)) {
                Storage::disk('public')->delete($u->gambar);
            }
        }
        $barang->delete();

        return redirect()->route('admin.barang')->with('success', 'Barang berhasil dihapus.');
    }

    public function restock(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => ['required', 'numeric', 'gt:0'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $id) {
            $barang = Barang::lockForUpdate()->findOrFail($id);
            $jumlahMasuk = (float) $validated['jumlah'];
            $stokBaru = round((float) $barang->stok_saat_ini + $jumlahMasuk, 2);
            $barang->stok_saat_ini = $stokBaru;
            $barang->save();

            TransaksiStok::create([
                'barang_id' => $barang->id,
                'user_id' => auth()->id(),
                'tipe' => 'masuk',
                'jumlah' => $jumlahMasuk,
                'sisa_stok' => $stokBaru,
                'keterangan' => $validated['keterangan'] ?: 'Restock barang oleh admin',
            ]);
        });

        return back()->with('success', 'Stok bahan habis pakai berhasil ditambahkan.');
    }

    public function kartuStokJson($id): JsonResponse
    {
        $barang = Barang::with('kategori')->findOrFail($id);
        $riwayat = TransaksiStok::with('user:id,nama,nip')
            ->where('barang_id', $id)
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'tipe' => $t->tipe,
                    'jumlah' => (float) $t->jumlah,
                    'sisa_stok' => (float) $t->sisa_stok,
                    'keterangan' => $t->keterangan ?: '-',
                    'user_nama' => $t->user?->nama ?? 'Sistem',
                    'user_nip' => $t->user?->nip ?? '-',
                    'tanggal' => $t->created_at->format('d M Y H:i'),
                ];
            });

        return response()->json([
            'barang' => [
                'id' => $barang->id,
                'nama_barang' => $barang->nama_barang,
                'kode_barang' => $barang->kode_barang,
                'satuan' => $barang->satuan,
                'stok_saat_ini' => (float) $barang->stok_saat_ini,
                'stok_minimum' => (float) $barang->stok_minimum,
                'is_low_stock' => $barang->isLowStock(),
            ],
            'mutasi' => $riwayat,
        ]);
    }

    public function storeUnit(Request $request): RedirectResponse
    {
        $jumlahUnit = (int) $request->input('jumlah_unit', 1);

        if ($jumlahUnit > 1) {
            $validated = $request->validate([
                'barang_id' => ['required', 'exists:barang,id'],
                'status' => ['required', 'in:tersedia,menunggu_persetujuan,dipinjam,maintenance'],
                'kondisi' => ['required', 'in:baik,rusak'],
            ]);

            $barang = Barang::findOrFail($validated['barang_id']);
            if ($barang->isHabisPakai()) {
                return back()->with('error', 'Barang habis pakai menggunakan sistem stok dan tidak memiliki unit fisik.');
            }
            $existingCount = $barang->units()->count();

            $createdCount = 0;
            for ($i = 1; $i <= $jumlahUnit; $i++) {
                $unitNumber = $existingCount + $i;
                $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $unitNumber);

                while (BarangUnit::where('kode_unit', $kodeUnit)->exists()) {
                    $unitNumber++;
                    $kodeUnit = sprintf('%s-%02d', $barang->kode_barang, $unitNumber);
                }

                BarangUnit::create([
                    'barang_id' => $barang->id,
                    'kode_unit' => $kodeUnit,
                    'status' => $validated['status'],
                    'kondisi' => $validated['kondisi'],
                ]);
                $createdCount++;
            }

            return back()->with('success', "{$createdCount} unit fisik baru berhasil dibuat secara otomatis.");
        }

        $validated = $request->validate([
            'barang_id' => ['required', 'exists:barang,id'],
            'kode_unit' => ['required', 'string', 'max:50', 'unique:barang_unit,kode_unit'],
            'status' => ['required', 'in:tersedia,menunggu_persetujuan,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $barang = Barang::findOrFail($validated['barang_id']);
        if ($barang->isHabisPakai()) {
            return back()->with('error', 'Barang habis pakai menggunakan sistem stok dan tidak memiliki unit fisik.');
        }

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('unit', 'public');
        }

        BarangUnit::create($validated);

        return back()->with('success', 'Unit fisik berhasil ditambahkan.');
    }

    public function updateUnit(Request $request, $id): RedirectResponse
    {
        $unit = BarangUnit::findOrFail($id);

        $validated = $request->validate([
            'kode_unit' => ['required', 'string', 'max:50', Rule::unique('barang_unit', 'kode_unit')->ignore($unit->id)],
            'status' => ['required', 'in:tersedia,menunggu_persetujuan,dipinjam,maintenance'],
            'kondisi' => ['required', 'in:baik,rusak'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('gambar')) {
            if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
                Storage::disk('public')->delete($unit->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('unit', 'public');
        } elseif ($request->boolean('hapus_gambar')) {
            if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
                Storage::disk('public')->delete($unit->gambar);
            }
            $validated['gambar'] = null;
        } else {
            unset($validated['gambar']);
        }

        DB::transaction(function () use ($unit, $validated) {
            $oldStatus = $unit->status;
            $newStatus = $validated['status'];

            if (in_array($oldStatus, ['dipinjam', 'menunggu_persetujuan']) && in_array($newStatus, ['tersedia', 'maintenance'])) {
                $activeLogs = Logbook::where('barang_unit_id', $unit->id)
                    ->whereIn('status_transaksi', ['dipinjam', 'menunggu_persetujuan'])
                    ->lockForUpdate()
                    ->get();

                foreach ($activeLogs as $log) {
                    if ($log->status_transaksi === 'dipinjam') {
                        $log->update([
                            'status_transaksi' => 'dikembalikan',
                            'tanggal_kembali' => now(),
                            'kondisi_kembali' => $validated['kondisi'],
                        ]);
                    } else {
                        $log->update([
                            'status_transaksi' => 'dibatalkan',
                            'alasan_penolakan' => 'Status unit diubah secara manual oleh Administrator.',
                        ]);
                    }
                }
            }

            $unit->update($validated);
        });

        return back()->with('success', 'Unit fisik berhasil diperbarui.');
    }

    public function destroyUnit($id): RedirectResponse
    {
        $unit = BarangUnit::find($id);
        if (!$unit) {
            return back()->with('success', 'Unit fisik sudah berhasil dihapus.');
        }

        if (in_array($unit->status, ['dipinjam', 'menunggu_persetujuan'])) {
            return back()->with('error', 'Unit fisik yang sedang dipinjam atau dalam pengajuan tidak dapat dihapus.');
        }

        if ($unit->gambar && Storage::disk('public')->exists($unit->gambar)) {
            Storage::disk('public')->delete($unit->gambar);
        }
        $unit->delete();

        return back()->with('success', 'Unit fisik berhasil dihapus.');
    }

    public function unitHistoryJson($id): JsonResponse
    {
        $unit = BarangUnit::with(['barang.kategori'])->findOrFail($id);

        $history = Logbook::with(['user', 'approver'])
            ->where('barang_unit_id', $id)
            ->whereIn('status_transaksi', ['dipinjam', 'dikembalikan'])
            ->orderByDesc('tanggal_pinjam')
            ->orderByDesc('id')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'peminjam_nama' => $log->peminjam_nama,
                    'peminjam_email' => $log->peminjam_email,
                    'tipe_peminjam' => $log->tipe_peminjam,
                    'keperluan' => $log->keperluan ?: '-',
                    'status_transaksi' => $log->status_transaksi,
                    'tanggal_pinjam' => $log->tanggal_pinjam ? $log->tanggal_pinjam->format('d M Y, H:i') : '-',
                    'tanggal_kembali' => $log->tanggal_kembali ? $log->tanggal_kembali->format('d M Y, H:i') : null,
                    'batas_kembali' => $log->batas_kembali ? $log->batas_kembali->format('d M Y, H:i') : null,
                    'kondisi_kembali' => $log->kondisi_kembali ?: 'baik',
                    'catatan_kembali' => $log->catatan_kembali,
                    'foto_pinjam_url' => $log->foto_pinjam_url,
                    'foto_kembali_url' => $log->foto_kembali_url,
                    'approver_nama' => $log->approver ? $log->approver->nama : null,
                ];
            });

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'nama_barang' => $unit->barang ? $unit->barang->nama_barang : '-',
                'nama_kategori' => $unit->barang && $unit->barang->kategori ? $unit->barang->kategori->nama_kategori : '-',
                'status' => $unit->status,
                'kondisi' => $unit->kondisi,
                'gambar_url' => $unit->gambar_url,
                'total_peminjaman' => $history->count(),
            ],
            'history' => $history,
        ]);
    }

    public function qrCode(): Response
    {
        $categories = KategoriBarang::withCount('barang')->with('units')->get()->map(fn ($k) => [
            'id' => $k->id,
            'nama_kategori' => $k->nama_kategori,
            'qr_code' => $k->qr_code ?: "/scan/kategori/{$k->id}",
            'total_barang' => $k->barang_count,
            'total_unit' => $k->units->count(),
        ]);

        $units = BarangUnit::with('barang.kategori')->get()->map(fn ($u) => [
            'id' => $u->id,
            'kode_unit' => $u->kode_unit,
            'nama_barang' => $u->barang?->nama_barang ?? 'Alat Workshop',
            'kategori' => $u->barang?->kategori?->nama_kategori ?? 'Umum',
            'status' => $u->status,
            'kondisi' => $u->kondisi,
            'qr_payload' => url("/scan/{$u->kode_unit}"),
        ]);

        return Inertia::render('QrCode/Index', [
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    public function scanner(): Response
    {
        return Inertia::render('Scanner/Index');
    }
}

