import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../../providers/transaction_provider.dart';

class RiwayatScreen extends StatefulWidget {
  const RiwayatScreen({super.key});

  @override
  State<RiwayatScreen> createState() => _RiwayatScreenState();
}

class _RiwayatScreenState extends State<RiwayatScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<TransactionProvider>().fetchRiwayat();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showReturnDialog(BuildContext context, RiwayatModel item) {
    String selectedKondisi = 'baik';

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.cardDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Pengembalian Alat', style: TextStyle(color: Colors.white, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Unit: ${item.namaBarang} (${item.kodeUnit})',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
              ),
              const SizedBox(height: 14),
              const Text(
                'Pilih kondisi fisik unit saat dikembalikan:',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
              const SizedBox(height: 10),
              RadioListTile<String>(
                value: 'baik',
                groupValue: selectedKondisi,
                onChanged: (val) => setDialogState(() => selectedKondisi = val ?? 'baik'),
                title: const Text('Baik (Siap digunakan kembali)', style: TextStyle(color: AppTheme.success, fontSize: 13, fontWeight: FontWeight.bold)),
                contentPadding: EdgeInsets.zero,
                activeColor: AppTheme.success,
              ),
              RadioListTile<String>(
                value: 'rusak',
                groupValue: selectedKondisi,
                onChanged: (val) => setDialogState(() => selectedKondisi = val ?? 'rusak'),
                title: const Text('Rusak (Perlu Maintenance)', style: TextStyle(color: AppTheme.danger, fontSize: 13, fontWeight: FontWeight.bold)),
                contentPadding: EdgeInsets.zero,
                activeColor: AppTheme.danger,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogCtx);
                final txProvider = context.read<TransactionProvider>();
                final messenger = ScaffoldMessenger.of(context);
                final success = await txProvider.returnItem(
                  logbookId: item.id,
                  kondisi: selectedKondisi,
                );

                if (!mounted) return;
                if (success) {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text('Unit berhasil dikembalikan (Kondisi: $selectedKondisi).'),
                      backgroundColor: selectedKondisi == 'baik' ? AppTheme.success : AppTheme.warning,
                    ),
                  );
                } else {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(txProvider.errorMessage ?? 'Gagal memproses pengembalian.'),
                      backgroundColor: AppTheme.danger,
                    ),
                  );
                }
              },
              child: const Text('Konfirmasi Pengembalian'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final txProvider = Provider.of<TransactionProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Transaksi'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Row(
              children: [
                _buildFilterChip('Semua', '', txProvider),
                const SizedBox(width: 8),
                _buildFilterChip('Sedang Dipinjam', 'dipinjam', txProvider),
                const SizedBox(width: 8),
                _buildFilterChip('Dikembalikan', 'dikembalikan', txProvider),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => txProvider.fetchRiwayat(),
              child: txProvider.isLoading
                  ? const Center(
                      child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
                    )
                  : txProvider.riwayatList.isEmpty
                      ? const Center(
                          child: Text(
                            'Belum ada transaksi peminjaman.',
                            style: TextStyle(color: Color(0xFF64748B)),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: txProvider.riwayatList.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = txProvider.riwayatList[index];
                            final isDipinjam = item.isDipinjam;

                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppTheme.cardDark,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isDipinjam
                                      ? AppTheme.warning.withValues(alpha: 0.4)
                                      : AppTheme.borderDark,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        item.kodeUnit,
                                        style: const TextStyle(
                                          fontFamily: 'monospace',
                                          color: AppTheme.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: isDipinjam
                                              ? AppTheme.warning.withValues(alpha: 0.15)
                                              : AppTheme.success.withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          isDipinjam ? 'Dipinjam' : 'Dikembalikan (${item.kondisiKembali ?? "-"})',
                                          style: TextStyle(
                                            color: isDipinjam ? AppTheme.warning : AppTheme.success,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    item.namaBarang,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Kategori: ${item.namaKategori}',
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                  ),
                                  const SizedBox(height: 12),
                                  const Divider(color: AppTheme.borderDark, height: 1),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('Waktu Pinjam', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                                          const SizedBox(height: 2),
                                          Text(
                                            item.tanggalPinjam?.substring(0, 10) ?? '-',
                                            style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12),
                                          ),
                                        ],
                                      ),
                                      if (isDipinjam)
                                        ElevatedButton(
                                          onPressed: () => _showReturnDialog(context, item),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: AppTheme.primary,
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                          child: const Text('KEMBALIKAN', style: TextStyle(fontSize: 11)),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, TransactionProvider provider) {
    final isSelected = provider.selectedFilter == value;
    return GestureDetector(
      onTap: () => provider.setFilter(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.cardDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.primary : AppTheme.borderDark,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
