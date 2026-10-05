import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../core/constants.dart';
import '../../providers/asset_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/skeleton_loader.dart';
import '../kategori/kategori_screen.dart';
import '../kategori/barang_kategori_screen.dart';
import '../riwayat/detail_peminjaman_screen.dart';

/// Technical Grid Background Painter matching workshop graph paper
class _GridBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF000000).withValues(alpha: 0.025)
      ..strokeWidth = 0.8;

    const step = 24.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedDayIndex = 0;

  List<Map<String, dynamic>> _getDynamicWeekDays() {
    final now = DateTime.now();
    // Monday of current week (DateTime.monday is 1)
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final days = <Map<String, dynamic>>[];

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
    for (int i = 0; i < 5; i++) {
      final date = monday.add(Duration(days: i));
      final isToday = date.year == now.year && date.month == now.month && date.day == now.day;
      days.add({
        'day': dayLabels[i],
        'date': date.day.toString(),
        'fullDate': date,
        'isToday': isToday,
      });
    }
    return days;
  }

  String _formatIndonesianDate(DateTime d) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return '${d.day} ${months[d.month - 1]}';
  }

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    if (now.weekday >= 1 && now.weekday <= 5) {
      _selectedDayIndex = now.weekday - 1;
    } else {
      _selectedDayIndex = 0;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchCategories();
        context.read<AuthProvider>().fetchProfile();
        context.read<TransactionProvider>().fetchRiwayat();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final assetProvider = Provider.of<AssetProvider>(context);
    final txProvider = Provider.of<TransactionProvider>(context);
    final user = authProvider.userProfile;
    final activeBorrows = txProvider.activeBorrows;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: Stack(
        children: [
          // 1. Subtle Workshop Blueprint Graph Paper Grid
          Positioned.fill(
            child: CustomPaint(
              painter: _GridBackgroundPainter(),
            ),
          ),

          // 2. Main Scrollable Dashboard Content
          RefreshIndicator(
            onRefresh: () async {
              await assetProvider.fetchCategories();
              await authProvider.fetchProfile();
              await txProvider.fetchRiwayat();
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. HEADER MERAH (Tepi Lengkung)
                  _buildCurvedRedHeader(user),

                  // Content Body with Horizontal Padding
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 14),

                        // 2. DATE STRIP CARD (Sen 12, Sel 13, Rab 14 [hari ini], Kam 15, Jum 16)
                        _buildDateStripCard(activeBorrows),
                        const SizedBox(height: 18),

                        // 3. STATUS SAYA (Dipinjam | Menunggu | Selesai) -> DITUKAR KE ATAS
                        _buildStatusSayaSection(activeBorrows, txProvider),
                        const SizedBox(height: 18),

                        // 4. STATUS ALAT / SEGERA DIKEMBALIKAN (Featured Alert Card) -> DITUKAR KE BAWAH
                        _buildFeaturedReturnCard(context, activeBorrows),
                        const SizedBox(height: 22),

                        // 5. KATEGORI PERALATAN (Horizontal scrolling vertical cards)
                        _buildKategoriSection(context, assetProvider),
                        const SizedBox(height: 22),

                        // 6. AKTIVITAS TERBARU (With colored status dots)
                        _buildAktivitasTerbaruSection(context, txProvider),
                        const SizedBox(height: 28),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =============================================================
  // 1. HEADER MERAH DENGAN TEPI LENGKUNG DI BAWAH
  // =============================================================
  Widget _buildCurvedRedHeader(dynamic user) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF991B1B),
            Color(0xFF8E1616),
            Color(0xFF7F1D1D),
          ],
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(22)),
        boxShadow: [
          BoxShadow(
            color: Color(0x358E1616),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar: (W) Logo + WAMS Workshop + Bell Icon
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.18),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(2.5),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/wams_logo.png',
                            fit: BoxFit.contain,
                          ),
                        ),
                      ).animate().scale(duration: 350.ms, curve: Curves.easeOutBack),
                      const SizedBox(width: 10),
                      const Text(
                        'WAMS',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.08, end: 0),
                    ],
                  ),
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(
                          Icons.notifications_none_rounded,
                          color: Colors.white,
                          size: 25,
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Tidak ada notifikasi baru.'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                      ),
                      Positioned(
                        right: 12,
                        top: 10,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFCA5A5),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // User Info: Real dynamic user data
              Text(
                user?.nama ?? 'Teknisi',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.4,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.22),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: Text(
                  user?.nip != null && user!.nip!.isNotEmpty
                      ? 'NIP ${user!.nip}'
                      : (user != null ? 'Pengguna WAMS' : 'Memuat profil...'),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =============================================================
  // 2. DATE STRIP / CALENDAR CARD
  // =============================================================
  Widget _buildDateStripCard(List activeBorrows) {
    final dateItems = _getDynamicWeekDays();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(dateItems.length, (index) {
          final isSelected = index == _selectedDayIndex;
          final item = dateItems[index];
          final isToday = item['isToday'] as bool;
          final fullDate = item['fullDate'] as DateTime;

          // Cek apakah tanggal ini merupakan batas waktu pengembalian barang aktif
          final matchingBorrows = activeBorrows.where((b) {
            if (b.batasKembali == null) return false;
            final dt = DateTime.tryParse(b.batasKembali.toString());
            if (dt == null) return false;
            return dt.year == fullDate.year && dt.month == fullDate.month && dt.day == fullDate.day;
          }).toList();

          final bool hasDeadline = matchingBorrows.isNotEmpty;

          // Tentukan warna outline batas pengembalian
          Color deadlineColor = const Color(0xFFDC2626);
          if (hasDeadline) {
            bool isOverdue = false;
            bool isNear = false;
            for (final b in matchingBorrows) {
              final dt = DateTime.tryParse(b.batasKembali.toString());
              if (dt != null) {
                final diff = dt.difference(DateTime.now());
                if (diff.isNegative) {
                  isOverdue = true;
                } else if (diff.inHours <= 24) {
                  isNear = true;
                }
              }
            }
            if (isOverdue) {
              deadlineColor = const Color(0xFFDC2626); // Terlambat: Merah pekat
            } else if (isNear) {
              deadlineColor = const Color(0xFFE11D48); // Segera dikembalikan (<= 24 jam): Rose / Crimson
            } else {
              deadlineColor = const Color(0xFFEA580C); // Batas normal: Oranye kemerahan
            }
          }

          // Border & Outline warna
          Border border;
          if (isSelected) {
            border = Border.all(color: const Color(0xFF8E1616), width: 1.8);
          } else if (hasDeadline) {
            // Outline warna tegas untuk batas waktu pengembalian
            border = Border.all(color: deadlineColor, width: 2.0);
          } else if (isToday) {
            border = Border.all(color: const Color(0xFF8E1616), width: 1.5);
          } else {
            border = Border.all(color: const Color(0xFFE2E8F0), width: 1.0);
          }

          // Latar belakang box tanggal
          Color boxColor;
          if (isSelected) {
            boxColor = const Color(0xFF8E1616);
          } else if (hasDeadline) {
            boxColor = deadlineColor.withValues(alpha: 0.08);
          } else {
            boxColor = const Color(0xFFF8FAFC);
          }

          // Warna teks angka tanggal
          Color textColor;
          if (isSelected) {
            textColor = Colors.white;
          } else if (hasDeadline) {
            textColor = deadlineColor;
          } else if (isToday) {
            textColor = const Color(0xFF8E1616);
          } else {
            textColor = const Color(0xFF0F172A);
          }

          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedDayIndex = index;
              });
            },
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  item['day'] as String,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isToday || hasDeadline ? FontWeight.w900 : FontWeight.w700,
                    color: isSelected
                        ? const Color(0xFF8E1616)
                        : (hasDeadline
                            ? deadlineColor
                            : (isToday ? const Color(0xFF8E1616) : const Color(0xFF64748B))),
                  ),
                ),
                const SizedBox(height: 6),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: boxColor,
                    border: border,
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFF8E1616).withValues(alpha: 0.35),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : (hasDeadline
                            ? [
                                BoxShadow(
                                  color: deadlineColor.withValues(alpha: 0.22),
                                  blurRadius: 5,
                                  offset: const Offset(0, 1),
                                ),
                              ]
                            : null),
                  ),
                  child: Center(
                    child: Text(
                      item['date'] as String,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: textColor,
                      ),
                    ),
                  ),
                ),
                if (isToday) ...[
                  const SizedBox(height: 4),
                  Container(
                    width: 5,
                    height: 5,
                    decoration: const BoxDecoration(
                      color: Color(0xFF8E1616),
                      shape: BoxShape.circle,
                    ),
                  ),
                ] else if (hasDeadline) ...[
                  const SizedBox(height: 4),
                  Container(
                    width: 5,
                    height: 5,
                    decoration: BoxDecoration(
                      color: deadlineColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                ] else
                  const SizedBox(height: 5),
              ],
            ),
          );
        }),
      ),
    ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04, end: 0);
  }

  // =============================================================
  // 3. SEGERA DIKEMBALIKAN (Featured Alert Card)
  // =============================================================
  // =============================================================
  // 3. STATUS ALAT / BARANG DIPINJAM (Slidable Cards Carousel)
  // =============================================================
  Widget _buildFeaturedReturnCard(BuildContext context, List activeBorrows) {
    if (activeBorrows.isEmpty) {
      // Kondisi Aman: Tidak Ada Pinjaman Aktif
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFF10B981),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF10B981).withValues(alpha: 0.10),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Left Content Column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge Status
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: const Color(0xFFA7F3D0),
                        width: 1.2,
                      ),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_rounded,
                          size: 13,
                          color: Color(0xFF047857),
                        ),
                        SizedBox(width: 5),
                        Text(
                          'STATUS ALAT: AMAN',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF047857),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Tool Title
                  const Text(
                    'Semua Alat Tersimpan Rapi',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.3,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),

                  // Tool Subtitle / Status
                  const Text(
                    'Tidak ada pinjaman aktif · Siap dipinjam',
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Action Row
                  InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const KategoriScreen(),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x140F172A),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.search_rounded,
                            size: 15,
                            color: Colors.white,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Jelajahi Katalog',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Right Squircle Container (Verified Icon)
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: const Color(0xFFECFDF5),
                border: Border.all(
                  color: const Color(0xFFA7F3D0),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.10),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: const Icon(
                  Icons.task_alt_rounded,
                  size: 38,
                  color: Color(0xFF059669),
                ).animate().scale(delay: 150.ms, duration: 400.ms, curve: Curves.easeOutBack),
              ),
            ),
          ],
        ),
      ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04, end: 0);
    }

    // Jika ada barang yang sedang dipinjam: Tampilkan Card Stack Transition Section
    return _CardStackBorrowSection(
      activeBorrows: activeBorrows,
      cardBuilder: (ctx, item, {bool isInteractive = true}) {
        return _buildSingleActiveBorrowCard(ctx, item, isInteractive: isInteractive);
      },
    );
  }

  Widget _buildSingleActiveBorrowCard(
    BuildContext context,
    dynamic item, {
    bool isInteractive = true,
  }) {
    final toolName = item.namaBarang;
    final categoryName = item.kodeUnit.isNotEmpty ? item.kodeUnit : item.namaKategori;
    final toolImage = item.gambarUrl;

    String sisaText = 'sisa 2 hari';
    if (item.batasKembali != null) {
      try {
        final dt = DateTime.parse(item.batasKembali!);
        final diff = dt.difference(DateTime.now());
        if (diff.isNegative) {
          sisaText = 'Terlambat';
        } else if (diff.inDays > 0) {
          sisaText = 'sisa ${diff.inDays} hari';
        } else if (diff.inHours > 0) {
          sisaText = 'sisa ${diff.inHours} jam';
        } else {
          sisaText = 'segera berakhir';
        }
      } catch (_) {}
    }

    String sisaDisplay;
    if (sisaText.toLowerCase().startsWith('sisa ')) {
      sisaDisplay = 'S${sisaText.substring(1)}';
    } else {
      sisaDisplay = 'Sisa $sisaText';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFDC2626),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFDC2626).withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Left Content Column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Badge Status
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFFFCA5A5),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.alarm_rounded,
                        size: 13,
                        color: Color(0xFFDC2626),
                      ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(
                            begin: const Offset(0.9, 0.9),
                            end: const Offset(1.15, 1.15),
                            duration: 700.ms,
                          ),
                      const SizedBox(width: 5),
                      Text(
                        'SEGERA DIKEMBALIKAN · ${sisaText.toUpperCase()}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFB91C1C),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Tool Title
                Text(
                  toolName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),

                // Tool Subtitle / Status
                Text(
                  'Kode: $categoryName · $sisaDisplay',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),

                // Action Row
                Row(
                  children: [
                    InkWell(
                      onTap: isInteractive
                          ? () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => DetailPeminjamanScreen(item: item),
                                ),
                              );
                            }
                          : null,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8E1616),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x140F172A),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.assignment_return_rounded,
                              size: 15,
                              color: Colors.white,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Kembalikan',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    if (item.batasKembali != null)
                      Text(
                        _formatIndonesianDate(
                          DateTime.tryParse(item.batasKembali!) ?? DateTime.now(),
                        ),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF475569),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Right Squircle Container (Tool Real Photo)
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Colors.white,
              border: Border.all(
                color: const Color(0xFFFECACA),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFDC2626).withValues(alpha: 0.10),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(13),
              child: _buildToolRealPhoto(toolImage, toolName, fit: BoxFit.cover),
            ),
          ),
        ],
      ),
    );
  }

  // =============================================================
  // 4. STATUS SAYA (Dipinjam | Menunggu | Selesai)
  // =============================================================
  Widget _buildStatusSayaSection(List activeBorrows, TransactionProvider txProvider) {
    final dipinjamCount = txProvider.countDipinjam;
    final menungguCount = txProvider.countMenunggu;
    final selesaiCount = txProvider.countSelesai;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Status Saya',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: Color(0xFF0F172A),
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            // Card 1: Dipinjam
            Expanded(
              child: _buildStatusVerticalCard(
                icon: Icons.construction_rounded,
                iconColor: const Color(0xFFDC2626),
                iconBgColor: const Color(0xFFFEE2E2),
                count: '$dipinjamCount',
                label: 'Dipinjam',
                topBorderColor: const Color(0xFFDC2626),
                bgColor: Colors.white,
              ).animate().fadeIn(delay: 100.ms, duration: 350.ms).slideY(begin: 0.08, end: 0),
            ),
            const SizedBox(width: 10),

            // Card 2: Menunggu
            Expanded(
              child: _buildStatusVerticalCard(
                icon: Icons.hourglass_empty_rounded,
                iconColor: const Color(0xFFD97706),
                iconBgColor: const Color(0xFFFEF3C7),
                count: '$menungguCount',
                label: 'Menunggu',
                topBorderColor: const Color(0xFFD97706),
                bgColor: Colors.white,
              ).animate().fadeIn(delay: 170.ms, duration: 350.ms).slideY(begin: 0.08, end: 0),
            ),
            const SizedBox(width: 10),

            // Card 3: Selesai
            Expanded(
              child: _buildStatusVerticalCard(
                icon: Icons.check_circle_rounded,
                iconColor: const Color(0xFF059669),
                iconBgColor: const Color(0xFFD1FAE5),
                count: '$selesaiCount',
                label: 'Selesai',
                topBorderColor: const Color(0xFF059669),
                bgColor: Colors.white,
              ).animate().fadeIn(delay: 240.ms, duration: 350.ms).slideY(begin: 0.08, end: 0),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusVerticalCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required String count,
    required String label,
    required Color topBorderColor,
    required Color bgColor,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(13),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 4.0,
              width: double.infinity,
              color: topBorderColor,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: iconBgColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: iconColor.withValues(alpha: 0.2),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: iconColor.withValues(alpha: 0.12),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        icon,
                        size: 22,
                        color: iconColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    count,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      height: 1.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF475569),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =============================================================
  // 5. KATEGORI PERALATAN (Geser ke samping, warna kartu berbeda)
  // =============================================================
  Widget _buildKategoriSection(BuildContext context, AssetProvider assetProvider) {
    final categories = assetProvider.categories;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header: Kategori Peralatan + Lihat semua
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Kategori Peralatan',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1E293B),
                letterSpacing: -0.3,
              ),
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const KategoriScreen()),
                );
              },
              child: const Text(
                'Lihat semua >',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF8E1616),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Horizontal Scrolling Dynamic Category Cards from Laravel API
        if (assetProvider.isLoading && categories.isEmpty)
          SizedBox(
            height: 146,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) => Container(
                width: 122,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              ),
            ),
          )
        else if (categories.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Center(
              child: Text(
                'Belum ada kategori peralatan.',
                style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
              ),
            ),
          )
        else
          SizedBox(
            height: 146,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: categories.length,
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final kat = categories[index];
                final style = _getCategoryCardStyle(kat.namaKategori);

                return InkWell(
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
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: 122,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                    decoration: BoxDecoration(
                      color: style['bgColor'] as Color,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: style['borderColor'] as Color, width: 1.2),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0A0F172A),
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Top Icon Container
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: (style['borderColor'] as Color).withValues(alpha: 0.8),
                              width: 1,
                            ),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x0A0F172A),
                                blurRadius: 4,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Icon(
                              style['icon'] as IconData,
                              size: 22,
                              color: style['iconColor'] as Color,
                            ),
                          ),
                        ),

                        // Name & Quantity
                        Column(
                          children: [
                            Text(
                              kat.namaKategori,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A),
                                height: 1.1,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: (style['borderColor'] as Color).withValues(alpha: 0.8),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                '${kat.tersedia} unit siap',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: style['iconColor'] as Color,
                                  fontWeight: FontWeight.w800,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),

                        // Button: ▶ Lihat
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFCBD5E1), width: 1),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x080F172A),
                                blurRadius: 3,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.play_arrow_rounded,
                                size: 13,
                                color: Color(0xFF8E1616),
                              ),
                              SizedBox(width: 3),
                              Text(
                                'Lihat',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
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
      ],
    ).animate().fadeIn(delay: 180.ms, duration: 350.ms);
  }

  Map<String, dynamic> _getCategoryCardStyle(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('perkakas') || lower.contains('tangan')) {
      return {
        'icon': Icons.handyman_rounded,
        'iconColor': const Color(0xFFDC2626),
        'bgColor': const Color(0xFFFFF1F2),
        'borderColor': const Color(0xFFFECACA),
      };
    } else if (lower.contains('elektronik') || lower.contains('listrik') || lower.contains('ukur')) {
      return {
        'icon': Icons.bolt_rounded,
        'iconColor': const Color(0xFFD97706),
        'bgColor': const Color(0xFFFEF3C7),
        'borderColor': const Color(0xFFFDE68A),
      };
    } else if (lower.contains('komponen') || lower.contains('chip') || lower.contains('board')) {
      return {
        'icon': Icons.memory_rounded,
        'iconColor': const Color(0xFF059669),
        'bgColor': const Color(0xFFECFDF5),
        'borderColor': const Color(0xFFA7F3D0),
      };
    } else {
      return {
        'icon': Icons.precision_manufacturing_rounded,
        'iconColor': const Color(0xFF2563EB),
        'bgColor': const Color(0xFFEFF6FF),
        'borderColor': const Color(0xFFBFDBFE),
      };
    }
  }



  Widget _buildAktivitasTerbaruSection(BuildContext context, TransactionProvider txProvider) {
    final history = txProvider.riwayatList;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Aktivitas Terbaru',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: Color(0xFF0F172A),
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 10),

        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0A0F172A),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: history.isEmpty
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: Text(
                      'Belum ada aktivitas transaksi',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                )
              : Column(
                  children: List.generate(history.take(4).length, (index) {
                    final act = history[index];
                    final isDone = act.statusTransaksi == 'dikembalikan';
                    final isPending = act.statusTransaksi == 'menunggu_persetujuan';
                    final isLast = index == history.take(4).length - 1;

                    final actionName = isDone
                        ? 'dikembalikan'
                        : isPending
                            ? 'diajukan'
                            : 'dipinjam';

                    final itemLabel = act.kodeUnit.isNotEmpty
                        ? act.kodeUnit
                        : act.namaBarang;

                    return Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          child: Row(
                            children: [
                              // Dot: 🟢 (green) or 🔴 (red) or 🟡 (amber)
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isDone
                                      ? const Color(0xFF059669) // Solid Green
                                      : isPending
                                          ? const Color(0xFFD97706) // Solid Amber
                                          : const Color(0xFFDC2626), // Solid Red
                                ),
                              ),
                              const SizedBox(width: 10),

                              // Action & Item Name
                              Expanded(
                                child: Text(
                                  '$itemLabel $actionName',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF0F172A),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Timestamp
                              Text(
                                _formatRelativeTime(act.tanggalPinjam),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!isLast)
                          const Divider(
                            height: 1,
                            color: Color(0xFFE2E8F0),
                          ),
                      ],
                    );
                  }),
                ),
        ),
      ],
    ).animate().fadeIn(delay: 260.ms, duration: 350.ms);
  }

  String _formatRelativeTime(String? raw) {
    if (raw == null || raw.isEmpty) return '-';
    try {
      final dt = DateTime.parse(raw);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays == 0) {
        if (diff.inHours == 0) {
          return diff.inMinutes <= 1 ? 'Baru saja' : '${diff.inMinutes} mnt lalu';
        }
        return '${diff.inHours} jam lalu';
      } else if (diff.inDays == 1) {
        return 'Kemarin';
      } else if (diff.inDays < 7) {
        return '${diff.inDays} hari lalu';
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return '${dt.day} ${months[dt.month - 1]}';
      }
    } catch (_) {
      return raw;
    }
  }

  // =============================================================
  // HELPER: REAL PHOTO LOADER WITH FALLBACK ICON
  // =============================================================
  Widget _buildToolRealPhoto(String? imageUrl, String toolName, {BoxFit fit = BoxFit.cover}) {
    final resolvedUrl = ApiConstants.resolveImageUrl(imageUrl);
    if (resolvedUrl != null && resolvedUrl.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: resolvedUrl,
        fit: fit,
        placeholder: (context, url) => const WamsShimmer(
          child: ColoredBox(color: Colors.white),
        ),
        errorWidget: (context, url, error) => Padding(
          padding: const EdgeInsets.all(12.0),
          child: _buildToolFallbackIcon(toolName),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: _buildToolFallbackIcon(toolName),
    );
  }

  Widget _buildToolFallbackIcon(String toolName) {
    final n = toolName.toLowerCase();
    IconData icon = Icons.speed_rounded;
    if (n.contains('multimeter') || n.contains('ukur') || n.contains('listrik')) {
      icon = Icons.electrical_services_rounded;
    } else if (n.contains('bor') || n.contains('perkakas')) {
      icon = Icons.handyman_rounded;
    } else if (n.contains('solder')) {
      icon = Icons.fireplace_rounded;
    } else if (n.contains('obeng') || n.contains('kunci')) {
      icon = Icons.hardware_rounded;
    }

    return Center(
      child: Icon(
        icon,
        size: 38,
        color: const Color(0xFF8E1616),
      ),
    );
  }
}

// =============================================================
// CARD STACK BORROW CAROUSEL (Deck of Cards Transition)
// =============================================================
class _CardStackBorrowSection extends StatefulWidget {
  final List activeBorrows;
  final Widget Function(BuildContext context, dynamic item, {bool isInteractive}) cardBuilder;

  const _CardStackBorrowSection({
    required this.activeBorrows,
    required this.cardBuilder,
  });

  @override
  State<_CardStackBorrowSection> createState() => _CardStackBorrowSectionState();
}

class _CardStackBorrowSectionState extends State<_CardStackBorrowSection>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  double _dragOffset = 0.0;
  late AnimationController _animController;
  late Animation<double> _slideAnimation;
  bool _isAnimating = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 260),
    );
    _animController.addListener(() {
      setState(() {
        _dragOffset = _slideAnimation.value;
      });
    });
  }

  @override
  void didUpdateWidget(_CardStackBorrowSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_currentIndex >= widget.activeBorrows.length) {
      _currentIndex = 0;
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _onDragEnd(double velocity) {
    if (_isAnimating || widget.activeBorrows.length <= 1) return;

    final screenWidth = MediaQuery.of(context).size.width;
    if (_dragOffset < -50 || velocity < -400) {
      _animateToNext(screenWidth);
    } else if (_dragOffset > 50 || velocity > 400) {
      _animateToPrev(screenWidth);
    } else {
      _snapBack();
    }
  }

  void _animateToNext(double screenWidth) {
    _isAnimating = true;
    final start = _dragOffset;
    final end = -(screenWidth + 60.0);

    _slideAnimation = Tween<double>(begin: start, end: end).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward(from: 0).then((_) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % widget.activeBorrows.length;
          _dragOffset = 0.0;
          _isAnimating = false;
        });
      }
    });
  }

  void _animateToPrev(double screenWidth) {
    _isAnimating = true;
    final start = _dragOffset;
    final end = screenWidth + 60.0;

    _slideAnimation = Tween<double>(begin: start, end: end).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward(from: 0).then((_) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex - 1 + widget.activeBorrows.length) %
              widget.activeBorrows.length;
          _dragOffset = 0.0;
          _isAnimating = false;
        });
      }
    });
  }

  void _snapBack() {
    _isAnimating = true;
    final start = _dragOffset;
    _slideAnimation = Tween<double>(begin: start, end: 0.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutBack),
    );
    _animController.forward(from: 0).then((_) {
      if (mounted) {
        setState(() {
          _dragOffset = 0.0;
          _isAnimating = false;
        });
      }
    });
  }

  void _animateToCard(int targetIndex) {
    if (targetIndex == _currentIndex || _isAnimating) return;
    final screenWidth = MediaQuery.of(context).size.width;
    if (targetIndex > _currentIndex) {
      _isAnimating = true;
      _slideAnimation = Tween<double>(begin: 0.0, end: -(screenWidth + 60.0)).animate(
        CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
      );
      _animController.forward(from: 0).then((_) {
        if (mounted) {
          setState(() {
            _currentIndex = targetIndex;
            _dragOffset = 0.0;
            _isAnimating = false;
          });
        }
      });
    } else {
      _isAnimating = true;
      _slideAnimation = Tween<double>(begin: 0.0, end: (screenWidth + 60.0)).animate(
        CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
      );
      _animController.forward(from: 0).then((_) {
        if (mounted) {
          setState(() {
            _currentIndex = targetIndex;
            _dragOffset = 0.0;
            _isAnimating = false;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.activeBorrows.length;
    if (total == 1) {
      return widget.cardBuilder(context, widget.activeBorrows[0], isInteractive: true);
    }

    final progress = (_dragOffset.abs() / 240.0).clamp(0.0, 1.0);
    final behindIndex = _dragOffset >= 0
        ? (_currentIndex - 1 + total) % total
        : (_currentIndex + 1) % total;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 178,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.topCenter,
            children: [
              // 3rd card in stack (if total >= 3)
              if (total >= 3) ...[
                Positioned(
                  top: 20.0 - (8.0 * progress),
                  left: 0,
                  right: 0,
                  child: Transform.scale(
                    scale: 0.88 + (0.06 * progress),
                    alignment: Alignment.topCenter,
                    child: Opacity(
                      opacity: 0.55 + (0.25 * progress),
                      child: widget.cardBuilder(
                        context,
                        widget.activeBorrows[(_currentIndex + 2) % total],
                        isInteractive: false,
                      ),
                    ),
                  ),
                ),
              ],

              // Next / Underneath card in stack
              Positioned(
                top: 12.0 * (1.0 - progress),
                left: 0,
                right: 0,
                child: Transform.scale(
                  scale: 0.94 + (0.06 * progress),
                  alignment: Alignment.topCenter,
                  child: Opacity(
                    opacity: 0.85 + (0.15 * progress),
                    child: widget.cardBuilder(
                      context,
                      widget.activeBorrows[behindIndex],
                      isInteractive: false,
                    ),
                  ),
                ),
              ),

              // Top interactive card
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Transform.translate(
                  offset: Offset(_dragOffset, 0),
                  child: Transform.rotate(
                    angle: (_dragOffset / 320.0) * 0.08,
                    alignment: Alignment.bottomCenter,
                    child: Opacity(
                      opacity: (1.0 - (progress * 0.35)).clamp(0.0, 1.0),
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onHorizontalDragUpdate: (details) {
                          if (!_isAnimating) {
                            setState(() {
                              _dragOffset += details.primaryDelta!;
                            });
                          }
                        },
                        onHorizontalDragEnd: (details) {
                          if (!_isAnimating) {
                            _onDragEnd(details.primaryVelocity ?? 0);
                          }
                        },
                        child: widget.cardBuilder(
                          context,
                          widget.activeBorrows[_currentIndex],
                          isInteractive: true,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Indicator Dots Animatif
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(total, (i) {
            final isCurrent = i == _currentIndex;
            return GestureDetector(
              onTap: () => _animateToCard(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeOutCubic,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: isCurrent ? 22 : 6,
                height: 6,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(3),
                  color: isCurrent ? const Color(0xFF8E1616) : const Color(0xFFCBD5E1),
                ),
              ),
            );
          }),
        ),
      ],
    ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04, end: 0);
  }
}
