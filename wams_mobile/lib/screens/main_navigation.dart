import 'package:flutter/material.dart';

import 'dashboard/dashboard_screen.dart';
import 'kategori/kategori_screen.dart';
import 'scan/scan_screen.dart';
import 'riwayat/riwayat_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigation extends StatefulWidget {
  final int initialIndex;
  const MainNavigation({super.key, this.initialIndex = 0});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  Widget _getCurrentScreen() {
    switch (_currentIndex) {
      case 0:
        return const DashboardScreen();
      case 1:
        return const KategoriScreen();
      case 2:
        return const ScanScreen();
      case 3:
        return const RiwayatScreen();
      case 4:
        return const ProfileScreen();
      default:
        return const DashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _getCurrentScreen(),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Color(0x0F0F172A),
              blurRadius: 12,
              offset: Offset(0, -3),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 66,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  // 1. Home
                  _buildNavItem(
                    index: 0,
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home_rounded,
                    tooltip: 'Beranda',
                  ),

                  // 2. Katalog (3D Wireframe Cube)
                  _buildNavItem(
                    index: 1,
                    icon: Icons.view_in_ar_outlined,
                    activeIcon: Icons.view_in_ar_rounded,
                    tooltip: 'Katalog',
                  ),

                  // 3. Center Floating QR Scan Button (Red Squircle)
                  Expanded(
                    child: Center(
                      child: _buildCenterScanButton(),
                    ),
                  ),

                  // 4. Riwayat (Clock with notification red dot)
                  _buildNavItem(
                    index: 3,
                    icon: Icons.access_time_rounded,
                    activeIcon: Icons.access_time_filled_rounded,
                    tooltip: 'Riwayat',
                    hasBadge: true,
                  ),

                  // 5. Profil
                  _buildNavItem(
                    index: 4,
                    icon: Icons.person_outline_rounded,
                    activeIcon: Icons.person_rounded,
                    tooltip: 'Profil',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCenterScanButton() {
    final isSelected = _currentIndex == 2;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = 2;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 46,
        height: 46,
        decoration: BoxDecoration(
          color: const Color(0xFFDC2626),
          borderRadius: BorderRadius.circular(15),
          border: isSelected
              ? Border.all(color: Colors.white, width: 2)
              : null,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFDC2626).withValues(alpha: 0.35),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.qr_code_2_rounded,
            color: Colors.white,
            size: 25,
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    IconData? activeIcon,
    String? tooltip,
    bool hasBadge = false,
  }) {
    final isSelected = _currentIndex == index;
    const activeColor = Color(0xFFDC2626);
    const inactiveColor = Color(0xFF64748B);

    return Expanded(
      child: Tooltip(
        message: tooltip ?? '',
        child: InkWell(
          onTap: () {
            setState(() {
              _currentIndex = index;
            });
          },
          borderRadius: BorderRadius.circular(16),
          child: Center(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFFEE2E2) : Colors.transparent,
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Center(
                    child: Icon(
                      isSelected ? (activeIcon ?? icon) : icon,
                      size: 24,
                      color: isSelected ? activeColor : inactiveColor,
                    ),
                  ),
                ),
                if (hasBadge)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFFDC2626),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
