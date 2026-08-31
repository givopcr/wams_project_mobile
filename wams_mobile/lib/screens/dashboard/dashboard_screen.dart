import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../kategori/barang_kategori_screen.dart';
import '../kategori/kategori_screen.dart';
import '../riwayat/detail_peminjaman_screen.dart';
import '../scan/scan_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchCategories();
        context.read<AuthProvider>().fetchProfile();
        context.read<TransactionProvider>().fetchRiwayat();
      }
    });
  }

  IconData _getCategoryIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('perkakas') || n.contains('tangan')) return Icons.handyman;
    if (n.contains('listrik') || n.contains('elektronik') || n.contains('ukur')) return Icons.bolt;
    if (n.contains('mesin') || n.contains('berat') || n.contains('bubut')) return Icons.precision_manufacturing;
    if (n.contains('komponen') || n.contains('elektronika')) return Icons.memory;
    return Icons.build_circle_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final assetProvider = Provider.of<AssetProvider>(context);
    final txProvider = Provider.of<TransactionProvider>(context);
    final user = authProvider.userProfile;
    final activeBorrows = txProvider.activeBorrows;

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  'W',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'WAMS Workshop',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined, color: AppTheme.textPrimary, size: 24),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tidak ada notifikasi baru.')),
                  );
                },
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppTheme.primary,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await assetProvider.fetchCategories();
          await authProvider.fetchProfile();
          await txProvider.fetchRiwayat();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner User Gradient
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.darkSlate, AppTheme.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.darkSlate.withValues(alpha: 0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Halo, ${user?.nama ?? "Teknisi"}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'NIP: ${user?.nip ?? "-"}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFFE0E0E0),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.success.withValues(alpha: 0.2),
                            border: Border.all(color: AppTheme.success.withValues(alpha: 0.4)),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              CircleAvatar(radius: 3, backgroundColor: AppTheme.success),
                              SizedBox(width: 5),
                              Text(
                                'Aktif',
                                style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Divider(color: Colors.white.withValues(alpha: 0.2), height: 1),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Sedang Dipinjam', style: TextStyle(color: Color(0xFFE0E0E0), fontSize: 11)),
                              const SizedBox(height: 2),
                              Text(
                                '${user?.activeBorrows ?? activeBorrows.length} Unit',
                                style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Total Riwayat', style: TextStyle(color: Color(0xFFE0E0E0), fontSize: 11)),
                              const SizedBox(height: 2),
                              Text(
                                '${user?.totalHistory ?? txProvider.riwayatList.length} Transaksi',
                                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Scan QR Banner Shortcut Card
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ScanScreen()),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.cardLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderLight),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.qr_code_scanner, color: AppTheme.primary, size: 26),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Pindai QR Code Rak / Kategori',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textPrimary),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Arahkan kamera ke stiker QR untuk melihat alat',
                              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppTheme.textMuted),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Section: Peminjaman Aktif (Mockup 1)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Peminjaman Aktif',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                  TextButton(
                    onPressed: () {
                      context.read<TransactionProvider>().setFilter('aktif');
                      // Navigate via bottom bar or push screen
                    },
                    child: const Text(
                      'Lihat Semua',
                      style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (activeBorrows.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.cardLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: const Center(
                    child: Text(
                      'Tidak ada peminjaman aktif saat ini.',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ),
                )
              else
                ...activeBorrows.take(2).map((item) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10.0),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DetailPeminjamanScreen(item: item),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.cardLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderLight),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.borderLight),
                              ),
                              child: const Center(
                                child: Icon(Icons.handyman, color: AppTheme.primary, size: 24),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.namaBarang,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.kodeUnit,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppTheme.textMuted,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                '3 hari lagi',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFD97706),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),

              const SizedBox(height: 20),

              // Section: Kategori Peralatan Workshop
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Kategori Peralatan Workshop',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const KategoriScreen()),
                      );
                    },
                    child: const Text(
                      'Lihat Semua',
                      style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (assetProvider.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: SpinKitFadingCircle(color: AppTheme.primary, size: 32),
                  ),
                )
              else if (assetProvider.categories.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Text('Belum ada kategori terdaftar.', style: TextStyle(color: AppTheme.textMuted)),
                  ),
                )
              else
                ...assetProvider.categories.take(3).map((kat) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10.0),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => BarangKategoriScreen(
                              kategoriId: kat.id,
                              namaKategori: kat.namaKategori,
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.cardLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderLight),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 46,
                              height: 46,
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Icon(
                                  _getCategoryIcon(kat.namaKategori),
                                  color: AppTheme.primary,
                                  size: 24,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    kat.namaKategori,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    '${kat.totalBarang} Master Barang • ${kat.tersedia}/${kat.totalUnit} Unit Siap',
                                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 20),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
