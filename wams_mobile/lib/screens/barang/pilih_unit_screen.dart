import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../models/barang_model.dart';
import '../../models/barang_unit_model.dart';
import '../../providers/asset_provider.dart';
import 'form_peminjaman_screen.dart';

class PilihUnitScreen extends StatefulWidget {
  final BarangModel barang;

  const PilihUnitScreen({super.key, required this.barang});

  @override
  State<PilihUnitScreen> createState() => _PilihUnitScreenState();
}

class _PilihUnitScreenState extends State<PilihUnitScreen> {
  BarangUnitModel? _selectedUnit;

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
          ? const Center(
              child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(20.0),
                    children: [
                      // Subtitle
                      Text(
                        'Pilih unit fisik ${widget.barang.namaBarang} yang ingin dipinjam:',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textMuted,
                        ),
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
                        ...units.map((unit) {
                          final isSelected = _selectedUnit?.id == unit.id;
                          final isAvailable = unit.isTersedia;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: InkWell(
                              onTap: isAvailable
                                  ? () => setState(() => _selectedUnit = unit)
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
                                    // Custom Radio Indicator
                                    Container(
                                      width: 20,
                                      height: 20,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
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
                                          ? Center(
                                              child: Container(
                                                width: 10,
                                                height: 10,
                                                decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: AppTheme.primary,
                                                ),
                                              ),
                                            )
                                          : null,
                                    ),
                                    const SizedBox(width: 14),

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
                          );
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
                      onPressed: _selectedUnit != null
                          ? () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => FormPeminjamanScreen(
                                    barang: widget.barang,
                                    unit: _selectedUnit!,
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
                      child: const Text(
                        'Lanjutkan',
                        style: TextStyle(
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
