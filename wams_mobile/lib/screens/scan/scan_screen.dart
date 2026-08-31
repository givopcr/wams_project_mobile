import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../kategori/barang_kategori_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final TextEditingController _manualInputController = TextEditingController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _manualInputController.dispose();
    super.dispose();
  }

  void _handleBarcode(String rawValue) {
    if (_isProcessing) return;
    _isProcessing = true;

    // Pattern format QR kategori: /scan/kategori/{id} atau digit langsung
    int? kategoriId;
    final match = RegExp(r'\/scan\/kategori\/(\d+)').firstMatch(rawValue);
    if (match != null) {
      kategoriId = int.tryParse(match.group(1)!);
    } else {
      kategoriId = int.tryParse(rawValue.trim());
    }

    if (kategoriId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BarangKategoriScreen(
            kategoriId: kategoriId!,
            namaKategori: 'Kategori #$kategoriId',
          ),
        ),
      ).then((_) {
        _isProcessing = false;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('QR Code tidak valid untuk kategori workshop.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code Kategori'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Scanner Simulation UI
            Container(
              height: 260,
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.primary, width: 2),
                      ),
                      child: const Icon(Icons.qr_code_scanner_rounded, size: 48, color: AppTheme.primary),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Pemindai QR Workshop',
                      style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Pindai label QR pada lemari / kotak perkakas',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Quick Category Shortcuts (Perkakas, Elektronik, Komponen)
            const Text(
              'Akses Cepat Kategori Workshop:',
              style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildQuickCategoryChip(1, 'Perkakas', Icons.build_rounded, AppTheme.primary),
                const SizedBox(width: 8),
                _buildQuickCategoryChip(2, 'Elektronik', Icons.electrical_services_rounded, const Color(0xFF2563EB)),
                const SizedBox(width: 8),
                _buildQuickCategoryChip(3, 'Komponen', Icons.memory_rounded, const Color(0xFF059669)),
              ],
            ),
            const SizedBox(height: 24),

            // Manual Input QR
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Input Manual URL / ID QR Code:',
                    style: TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualInputController,
                          decoration: const InputDecoration(
                            hintText: 'Contoh: 1 atau /scan/kategori/1',
                            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          if (_manualInputController.text.trim().isNotEmpty) {
                            _handleBarcode(_manualInputController.text.trim());
                          }
                        },
                        child: const Text('Buka'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickCategoryChip(int id, String label, IconData icon, Color color) {
    return Expanded(
      child: InkWell(
        onTap: () => _handleBarcode(id.toString()),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
