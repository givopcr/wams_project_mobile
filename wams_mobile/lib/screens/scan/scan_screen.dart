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
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _scanLineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _handleBarcode(String rawValue) {
    if (_isProcessing) return;
    _isProcessing = true;

    // Format QR kategori dari Admin Web:
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

    if (kategoriId != null && kategoriId > 0) {
      _scannerController.stop();

      String namaKategori = 'Kategori Workshop #$kategoriId';
      if (kategoriId == 1) namaKategori = 'Perkakas';
      if (kategoriId == 2) namaKategori = 'Elektronik';
      if (kategoriId == 3) namaKategori = 'Komponen';

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BarangKategoriScreen(
            kategoriId: kategoriId!,
            namaKategori: namaKategori,
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
    final screenSize = MediaQuery.of(context).size;
    final double scanBoxSize = (screenSize.width * 0.72).clamp(240.0, 300.0);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text(
          'Scan QR Code',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          // Toggle Flash / Torch
          IconButton(
            icon: Icon(
              _isFlashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
              color: _isFlashOn ? Colors.amber : Colors.white,
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
            icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white),
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
      body: Stack(
        alignment: Alignment.center,
        children: [
          // 1. Full-screen Camera Feed
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
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.videocam_off_outlined, color: Colors.white70, size: 56),
                      const SizedBox(height: 16),
                      Text(
                        'Kamera tidak aktif atau izin belum diberikan (${error.errorCode.name})',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 18),
                      ElevatedButton.icon(
                        onPressed: () => _scannerController.start(),
                        icon: const Icon(Icons.refresh, size: 18),
                        label: const Text('Coba Lagi'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // 2. Dark Overlay Outside Center Scan Box
          ColorFiltered(
            colorFilter: ColorFilter.mode(
              Colors.black.withValues(alpha: 0.60),
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
                      width: scanBoxSize,
                      height: scanBoxSize,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. Center Scanning Viewfinder Frame & Animated Laser
          Center(
            child: SizedBox(
              width: scanBoxSize,
              height: scanBoxSize,
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
                        top: 14 + (_scanLineAnimation.value * (scanBoxSize - 28)),
                        left: 10,
                        right: 10,
                        child: Container(
                          height: 3,
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primary.withValues(alpha: 0.85),
                                blurRadius: 12,
                                spreadRadius: 3,
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
          ),

          // 4. Floating Instruction Badge below Viewfinder
          Positioned(
            bottom: (screenSize.height * 0.12).clamp(40.0, 100.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.75),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Posisikan QR Code di dalam area kotak',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
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

  Widget _buildScannerCorner(Alignment alignment, {required bool top, required bool left}) {
    return Align(
      alignment: alignment,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          border: Border(
            top: top ? const BorderSide(color: AppTheme.primary, width: 4.5) : BorderSide.none,
            bottom: !top ? const BorderSide(color: AppTheme.primary, width: 4.5) : BorderSide.none,
            left: left ? const BorderSide(color: AppTheme.primary, width: 4.5) : BorderSide.none,
            right: !left ? const BorderSide(color: AppTheme.primary, width: 4.5) : BorderSide.none,
          ),
          borderRadius: BorderRadius.only(
            topLeft: top && left ? const Radius.circular(16) : Radius.zero,
            topRight: top && !left ? const Radius.circular(16) : Radius.zero,
            bottomLeft: !top && left ? const Radius.circular(16) : Radius.zero,
            bottomRight: !top && !left ? const Radius.circular(16) : Radius.zero,
          ),
        ),
      ),
    );
  }
}
