import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/countdown_badge.dart';
import '../../widgets/tool_thumbnail.dart';
import 'detail_peminjaman_screen.dart';

class RiwayatScreen extends StatefulWidget {
  const RiwayatScreen({super.key});

  @override
  State<RiwayatScreen> createState() => _RiwayatScreenState();
}

class _RiwayatScreenState extends State<RiwayatScreen> {
  final List<String> _tabs = ['Semua', 'Aktif', 'Selesai', 'Terlambat'];

  Color _getTabPillColor(String tab) {
    final lower = tab.toLowerCase();
    switch (lower) {
      case 'aktif':
        return const Color(0xFFDC2626); // Merah
      case 'selesai':
        return const Color(0xFF16A34A); // Hijau
      case 'terlambat':
        return const Color(0xFFF59E0B); // Kuning / Amber
      default:
        return Colors.white; // 'Semua' default
    }
  }

  Color _getTabShadowColor(String tab) {
    final lower = tab.toLowerCase();
    switch (lower) {
      case 'aktif':
        return const Color(0xFFDC2626).withValues(alpha: 0.35);
      case 'selesai':
        return const Color(0xFF16A34A).withValues(alpha: 0.35);
      case 'terlambat':
        return const Color(0xFFF59E0B).withValues(alpha: 0.35);
      default:
        return Colors.black.withValues(alpha: 0.07);
    }
  }

  Color _getTabTextColor(String tab, bool isSelected) {
    if (!isSelected) {
      return const Color(0xFF64748B);
    }
    if (tab.toLowerCase() == 'semua') {
      return const Color(0xFF0F172A);
    }
    return Colors.white;
  }

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
      final now = DateTime.now();
      displayList = txProvider.riwayatList.where((i) {
        if (!i.isDipinjam || i.tanggalPinjam == null) return false;
        try {
          final dt = DateTime.parse(i.tanggalPinjam!);
          return now.difference(dt).inHours >= 24;
        } catch (_) {
          return false;
        }
      }).toList();
    }

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Riwayat Peminjaman',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      body: Column(
        children: [
          // Segmented Control Pill Bar with Smooth Sliding Indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final totalWidth = constraints.maxWidth;
                const horizontalPadding = 4.0;
                final availableWidth = totalWidth - (horizontalPadding * 2);
                final tabWidth = availableWidth / _tabs.length;
                final foundIndex = _tabs.indexWhere((tab) => tab.toLowerCase() == currentFilter);
                final selectedIndex = (foundIndex != -1 ? foundIndex : 0).clamp(0, _tabs.length - 1);

                return Container(
                  height: 44,
                  padding: const EdgeInsets.all(horizontalPadding),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F2F6),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Stack(
                    children: [
                      // Smooth Sliding Dynamic Pill Indicator
                      AnimatedPositioned(
                        duration: const Duration(milliseconds: 260),
                        curve: Curves.easeInOutCubic,
                        left: selectedIndex * tabWidth,
                        top: 0,
                        bottom: 0,
                        width: tabWidth,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 260),
                          curve: Curves.easeInOutCubic,
                          decoration: BoxDecoration(
                            color: _getTabPillColor(_tabs[selectedIndex]),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: _getTabShadowColor(_tabs[selectedIndex]),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Tabs Text Buttons on top
                      Row(
                        children: _tabs.asMap().entries.map((entry) {
                          final index = entry.key;
                          final tab = entry.value;
                          final key = tab.toLowerCase();
                          final isSelected = selectedIndex == index;

                          return Expanded(
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () {
                                txProvider.setFilter(key);
                              },
                              child: Center(
                                child: AnimatedDefaultTextStyle(
                                  duration: const Duration(milliseconds: 200),
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                    color: _getTabTextColor(tab, isSelected),
                                  ),
                                  child: Text(tab),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 6),

          // Transaction list
          Expanded(
            child: txProvider.isLoading
                ? ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    itemCount: 5,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (_, _) => const WamsSkeletonCard(),
                  )
                : displayList.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.history_rounded, size: 52, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              currentFilter == 'terlambat'
                                  ? 'Tidak ada peminjaman terlambat.'
                                  : currentFilter == 'aktif'
                                      ? 'Tidak ada peminjaman aktif.'
                                      : 'Belum ada data peminjaman.',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        key: ValueKey(currentFilter),
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
                                  // Thumbnail Icon
                                  ToolThumbnail(
                                    imageUrl: item.gambarUrl,
                                    toolName: item.namaBarang,
                                    size: 52,
                                    borderRadius: 12,
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

                                  // Status Pill or Countdown Badge
                                  if (item.isDipinjam)
                                    CountdownBadge(batasKembali: item.batasKembali)
                                  else
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: item.isMenungguApproval
                                            ? const Color(0xFFFEF3C7)
                                            : item.isDitolak
                                            ? const Color(0xFFFEE2E2)
                                            : item.isDibatalkan
                                            ? const Color(0xFFF3F4F6)
                                            : const Color(0xFFD1FAE5),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: item.isMenungguApproval
                                              ? const Color(0xFFFCD34D)
                                              : item.isDitolak
                                              ? const Color(0xFFFCA5A5)
                                              : Colors.transparent,
                                          width: 0.8,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            item.isMenungguApproval
                                                ? 'Menunggu Izin'
                                                : item.isDitolak
                                                ? 'Ditolak'
                                                : item.isDibatalkan
                                                ? 'Dibatalkan'
                                                : 'Selesai',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: item.isMenungguApproval
                                                  ? const Color(0xFFD97706)
                                                  : item.isDitolak
                                                  ? AppTheme.danger
                                                  : item.isDibatalkan
                                                  ? AppTheme.textMuted
                                                  : AppTheme.success,
                                            ),
                                          ),
                                          if (item.isMenungguApproval) ...[
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
                          ).animate(delay: (index * 40).ms).fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
