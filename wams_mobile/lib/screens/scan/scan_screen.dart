import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';
import '../kategori/barang_kategori_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _manualInputController = TextEditingController();
  late final MobileScannerController _scannerController;
  late final AnimationController _animController;
  late final Animation<double> _scanLineAnimation;

  bool _isProcessing = false;
  bool _isFlashOn = false;
  CameraFacing _cameraFacing = CameraFacing.back;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _scanLineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _manualInputController.dispose();
    _scannerController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _handleBarcode(String rawValue) {
    if (_isProcessing) return;
    _isProcessing = true;

    // Pattern format QR kategori dari Admin Web:
    // Format standar: /scan/kategori/{id}
    // Format url: http://.../scan/kategori/{id}
    // Format id langsung: 1, 2, 3
    int? kategoriId;
    final match = RegExp(r'\/scan\/kategori\/(\d+)').firstMatch(rawValue);
    if (match != null) {
      kategoriId = int.tryParse(match.group(1)!);
    } else {
      kategoriId = int.tryParse(rawValue.trim());
    }

    if (kategoriId != null) {
      // Pause camera stream selagi berpindah layar
      _scannerController.stop();

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BarangKategoriScreen(
            kategoriId: kategoriId!,
            namaKategori: 'Kategori #$kategoriId',
          ),
        ),
      ).then((_) {
        // Resume camera stream kembali saat kembali ke halaman scan
        if (mounted) {
          _scannerController.start();
          _isProcessing = false;
        }
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('QR Code tidak valid: $rawValue\nHarap scan QR kategori workshop yang sesuai.'),
          backgroundColor: AppTheme.danger,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          _isProcessing = false;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        title: const Text('Scan QR Kategori'),
        actions: [
          // Toggle Flash / Torch
          IconButton(
            icon: Icon(
              _isFlashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
              color: _isFlashOn ? Colors.amber : AppTheme.textPrimary,
            ),
            tooltip: 'Senter',
            onPressed: () async {
              await _scannerController.toggleTorch();
              setState(() {
                _isFlashOn = !_isFlashOn;
              });
            },
          ),
          // Switch Camera (Front / Back)
          IconButton(
            icon: const Icon(Icons.flip_camera_ios_rounded, color: AppTheme.textPrimary),
            tooltip: 'Ganti Kamera',
            onPressed: () async {
              await _scannerController.switchCamera();
              setState(() {
                _cameraFacing = _cameraFacing == CameraFacing.back
                    ? CameraFacing.front
                    : CameraFacing.back;
              });
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Viewfinder Scanner Card dengan Overlay Animasi
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Container(
                height: 320,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Kamera Scanner Mobile
                      MobileScanner(
                        controller: _scannerController,
                        onDetect: (BarcodeCapture capture) {
                          final barcodes = capture.barcodes;
                          for (final barcode in barcodes) {
                            if (barcode.rawValue != null && barcode.rawValue!.isNotEmpty) {
                              _handleBarcode(barcode.rawValue!);
                              break;
                            }
                          }
                        },
                        errorBuilder: (context, error) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.videocam_off_outlined, color: Colors.white70, size: 48),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Kamera tidak aktif atau izin belum diberikan: ${error.errorCode.name}',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                  const SizedBox(height: 12),
                                  ElevatedButton.icon(
                                    onPressed: () => _scannerController.start(),
                                    icon: const Icon(Icons.refresh, size: 16),
                                    label: const Text('Coba Lagi'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primary,
                                      foregroundColor: Colors.white,
                                    ),
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),

                      // Dark Vignette Overlay di Luar Target
                      ColorFiltered(
                        colorFilter: ColorFilter.mode(
                          Colors.black.withValues(alpha: 0.45),
                          BlendMode.srcOut,
                        ),
                        child: Stack(
                          children: [
                            Container(
                              decoration: const BoxDecoration(
                                color: Colors.transparent,
                              ),
                              child: Center(
                                child: Container(
                                  width: 210,
                                  height: 210,
                                  decoration: BoxDecoration(
                                    color: Colors.black,
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Scanning Frame Modern (Border Sudut)
                      SizedBox(
                        width: 210,
                        height: 210,
                        child: Stack(
                          children: [
                            // 4 Corner borders
                            _buildScannerCorner(Alignment.topLeft, top: true, left: true),
                            _buildScannerCorner(Alignment.topRight, top: true, left: false),
                            _buildScannerCorner(Alignment.bottomLeft, top: false, left: true),
                            _buildScannerCorner(Alignment.bottomRight, top: false, left: false),

                            // Animated Laser Beam
                            AnimatedBuilder(
                              animation: _scanLineAnimation,
                              builder: (context, child) {
                                return Positioned(
                                  top: 10 + (_scanLineAnimation.value * 190),
                                  left: 8,
                                  right: 8,
                                  child: Container(
                                    height: 3,
                                    decoration: BoxDecoration(
                                      color: AppTheme.primary,
                                      borderRadius: BorderRadius.circular(2),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppTheme.primary.withValues(alpha: 0.8),
                                          blurRadius: 10,
                                          spreadRadius: 2,
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),

                      // Petunjuk Arah
                      Positioned(
                        bottom: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.65),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.crop_free_rounded, color: Colors.white, size: 14),
                              SizedBox(width: 6),
                              Text(
                                'Arahkan kamera ke QR Code Kategori',
                                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Akses Cepat Kategori Workshop
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Akses Cepat Kategori Workshop:',
                    style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildQuickCategoryChip(1, 'Perkakas', Icons.build_rounded, AppTheme.primary),
                      const SizedBox(width: 8),
                      _buildQuickCategoryChip(2, 'Elektronik', Icons.electrical_services_rounded, const Color(0xFF2563EB)),
                      const SizedBox(width: 8),
                      _buildQuickCategoryChip(3, 'Komponen', Icons.memory_rounded, const Color(0xFF059669)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Input Manual Alternatif
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              child: Container(
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
                    const Row(
                      children: [
                        Icon(Icons.keyboard_outlined, size: 18, color: AppTheme.textMuted),
                        SizedBox(width: 8),
                        Text(
                          'Input Manual URL / Payload QR Code:',
                          style: TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _manualInputController,
                            decoration: const InputDecoration(
                              hintText: 'Contoh: /scan/kategori/1',
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
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerCorner(Alignment alignment, {required bool top, required bool left}) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          border: Border(
            top: top ? const BorderSide(color: AppTheme.primary, width: 4) : BorderSide.none,
            bottom: !top ? const BorderSide(color: AppTheme.primary, width: 4) : BorderSide.none,
            left: left ? const BorderSide(color: AppTheme.primary, width: 4) : BorderSide.none,
            right: !left ? const BorderSide(color: AppTheme.primary, width: 4) : BorderSide.none,
          ),
          borderRadius: BorderRadius.only(
            topLeft: top && left ? const Radius.circular(12) : Radius.zero,
            topRight: top && !left ? const Radius.circular(12) : Radius.zero,
            bottomLeft: !top && left ? const Radius.circular(12) : Radius.zero,
            bottomRight: !top && !left ? const Radius.circular(12) : Radius.zero,
          ),
        ),
      ),
    );
  }

  Widget _buildQuickCategoryChip(int id, String label, IconData icon, Color color) {
    return Expanded(
      child: InkWell(
        onTap: () => _handleBarcode('/scan/kategori/$id'),
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
