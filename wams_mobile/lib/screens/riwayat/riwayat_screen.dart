import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../../providers/transaction_provider.dart';
import 'detail_peminjaman_screen.dart';

class RiwayatScreen extends StatefulWidget {
  const RiwayatScreen({super.key});

  @override
  State<RiwayatScreen> createState() => _RiwayatScreenState();
}

class _RiwayatScreenState extends State<RiwayatScreen> {
  final List<String> _tabs = ['Semua', 'Aktif', 'Selesai', 'Terlambat'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<TransactionProvider>().fetchRiwayat();
      }
    });
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '-';
    try {
      final dt = DateTime.parse(raw);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    final txProvider = Provider.of<TransactionProvider>(context);
    final currentFilter = txProvider.selectedFilter;

    // Filter local list based on tab
    List<RiwayatModel> displayList = txProvider.riwayatList;
    if (currentFilter == 'aktif') {
      displayList = txProvider.riwayatList.where((i) => i.isDipinjam).toList();
    } else if (currentFilter == 'selesai') {
      displayList = txProvider.riwayatList.where((i) => !i.isDipinjam).toList();
    } else if (currentFilter == 'terlambat') {
      displayList = []; // Default 0 for current mock
    }

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Riwayat Peminjaman',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Tabs (Mockup 10 & 11)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _tabs.map((tab) {
                  final key = tab.toLowerCase();
                  final isSelected = currentFilter == key;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () {
                        txProvider.setFilter(key);
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary : AppTheme.cardLight,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : AppTheme.borderLight,
                          ),
                        ),
                        child: Text(
                          tab,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.white : AppTheme.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 6),

          // Transaction list
          Expanded(
            child: txProvider.isLoading
                ? const Center(
                    child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
                  )
                : displayList.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.history, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              currentFilter == 'terlambat'
                                  ? 'Tidak ada peminjaman terlambat.'
                                  : 'Belum ada data peminjaman.',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        itemCount: displayList.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = displayList[index];
                          return InkWell(
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
                                  // Thumbnail
                                  Container(
                                    width: 52,
                                    height: 52,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppTheme.borderLight),
                                    ),
                                    child: const Center(
                                      child: Icon(Icons.handyman, color: AppTheme.primary, size: 26),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Name, Unit Code, Date
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
                                        const SizedBox(height: 3),
                                        Text(
                                          '${item.kodeUnit} • ${_formatDate(item.tanggalPinjam)}',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppTheme.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Status Pill (Aktif / Selesai)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: item.isDipinjam
                                          ? const Color(0xFFFEF3C7) // soft amber
                                          : const Color(0xFFD1FAE5), // soft green
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          item.isDipinjam ? 'Aktif' : 'Selesai',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: item.isDipinjam
                                                ? const Color(0xFFD97706)
                                                : AppTheme.success,
                                          ),
                                        ),
                                        if (item.isDipinjam) ...[
                                          const SizedBox(width: 2),
                                          const Icon(
                                            Icons.chevron_right,
                                            size: 14,
                                            color: Color(0xFFD97706),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Bottom Reminder Banner on 'Aktif' tab (Mockup 11)
          if (currentFilter == 'aktif' && displayList.isNotEmpty)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB), // light warm cream/yellow
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Row(
                children: [
                  Text('😊', style: TextStyle(fontSize: 18)),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Pastikan barang dikembalikan tepat waktu untuk kenyamanan bersama.',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: Color(0xFF92400E),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
