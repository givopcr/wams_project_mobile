import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../models/barang_model.dart';
import '../../providers/asset_provider.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/tool_thumbnail.dart';
import 'form_peminjaman_screen.dart';

class PilihUnitScreen extends StatefulWidget {
  final BarangModel barang;

  const PilihUnitScreen({super.key, required this.barang});

  @override
  State<PilihUnitScreen> createState() => _PilihUnitScreenState();
}

class _PilihUnitScreenState extends State<PilihUnitScreen> {
  final Set<int> _selectedUnitIds = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchBarangUnits(widget.barang.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);
    final units = assetProvider.barangUnits;
    final availableUnits = units.where((u) => u.isTersedia).toList();
    final allAvailableSelected = availableUnits.isNotEmpty &&
        availableUnits.every((u) => _selectedUnitIds.contains(u.id));

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Pilih Unit',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: assetProvider.isLoading
          ? ListView.separated(
              padding: const EdgeInsets.all(20.0),
              itemCount: 4,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (_, _) => const WamsSkeletonCard(),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(20.0),
                    children: [
                      // Subtitle & Select All toggle
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'Pilih unit fisik ${widget.barang.namaBarang} yang ingin dipinjam:',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.textMuted,
                              ),
                            ),
                          ),
                          if (availableUnits.length > 1)
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  if (allAvailableSelected) {
                                    _selectedUnitIds.removeAll(
                                      availableUnits.map((u) => u.id),
                                    );
                                  } else {
                                    _selectedUnitIds.addAll(
                                      availableUnits.map((u) => u.id),
                                    );
                                  }
                                });
                              },
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                allAvailableSelected
                                    ? 'Batal Semua'
                                    : 'Pilih Semua (${availableUnits.length})',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      if (units.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Text(
                              'Belum ada unit terdaftar.',
                              style: TextStyle(color: AppTheme.textMuted),
                            ),
                          ),
                        )
                      else
                        ...units.asMap().entries.map((entry) {
                          final index = entry.key;
                          final unit = entry.value;
                          final isSelected = _selectedUnitIds.contains(unit.id);
                          final isAvailable = unit.isTersedia;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: InkWell(
                              onTap: isAvailable
                                  ? () => setState(() {
                                        if (isSelected) {
                                          _selectedUnitIds.remove(unit.id);
                                        } else {
                                          _selectedUnitIds.add(unit.id);
                                        }
                                      })
                                  : null,
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppTheme.cardLight,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.borderLight,
                                    width: isSelected ? 2 : 1,
                                  ),
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
                                    // Custom Checkbox Indicator (supports multi-selection)
                                    AnimatedContainer(
                                      duration: const Duration(milliseconds: 180),
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppTheme.primary
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(7),
                                        border: Border.all(
                                          color: isSelected
                                              ? AppTheme.primary
                                              : (isAvailable
                                                  ? const Color(0xFF9CA3AF)
                                                  : const Color(0xFFD1D5DB)),
                                          width: 2,
                                        ),
                                      ),
                                      child: isSelected
                                          ? const Icon(
                                              Icons.check,
                                              size: 16,
                                              color: Colors.white,
                                            )
                                          : null,
                                    ),
                                    const SizedBox(width: 12),

                                    // Unit Image Thumbnail
                                    ToolThumbnail(
                                      imageUrl: unit.unitGambarUrl ?? unit.gambarUrl ?? widget.barang.gambarUrl,
                                      toolName: widget.barang.namaBarang,
                                      size: 42,
                                      borderRadius: 10,
                                    ),
                                    const SizedBox(width: 12),

                                    // Unit Code & Condition
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            unit.kodeUnit,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: isAvailable
                                                  ? AppTheme.textPrimary
                                                  : const Color(0xFF9CA3AF),
                                              fontFamily: 'monospace',
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Kondisi: ${unit.kondisi == "baik" ? "Baik" : "Perlu Cek"}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isAvailable
                                                  ? AppTheme.textMuted
                                                  : const Color(0xFF9CA3AF),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Badge Status
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isAvailable
                                            ? const Color(0xFFD1FAE5) // light green
                                            : const Color(0xFFFEF3C7), // light amber
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        isAvailable ? 'Tersedia' : 'Dipinjam',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: isAvailable
                                              ? AppTheme.success
                                              : const Color(0xFFD97706),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ).animate(delay: (index * 40).ms).fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
                        }),
                    ],
                  ),
                ),

                // Bottom Action Button
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.cardLight,
                    border: const Border(top: BorderSide(color: AppTheme.borderLight)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: ElevatedButton(
                      onPressed: _selectedUnitIds.isNotEmpty
                          ? () {
                              final selectedList = units
                                  .where((u) => _selectedUnitIds.contains(u.id))
                                  .toList();
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => FormPeminjamanScreen(
                                    barang: widget.barang,
                                    units: selectedList,
                                  ),
                                ),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        disabledBackgroundColor: const Color(0xFFD1D5DB),
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        _selectedUnitIds.isEmpty
                            ? 'Pilih Unit Terlebih Dahulu'
                            : 'Lanjutkan (${_selectedUnitIds.length} Unit Dipilih)',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
