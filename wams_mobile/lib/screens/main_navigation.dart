import 'package:flutter/material.dart';

import '../core/theme.dart';
import 'dashboard/dashboard_screen.dart';
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
        return const ScanScreen();
      case 2:
        return const RiwayatScreen();
      case 3:
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
          color: AppTheme.cardLight,
          border: Border(
            top: BorderSide(color: AppTheme.borderLight, width: 0.8),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final totalWidth = constraints.maxWidth;
                final tabWidth = totalWidth / 4;
                const pillWidth = 60.0;
                const pillHeight = 40.0;

                return Stack(
                  alignment: Alignment.centerLeft,
                  children: [
                    // Smooth sliding red pill indicator
                    AnimatedPositioned(
                      duration: const Duration(milliseconds: 280),
                      curve: Curves.easeInOutCubic,
                      left: _currentIndex * tabWidth + (tabWidth - pillWidth) / 2,
                      top: (64 - pillHeight) / 2,
                      width: pillWidth,
                      height: pillHeight,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),

                    // Interactive Nav Items on top
                    Row(
                      children: [
                        _buildNavItem(0, 'assets/icons/nav_home.png'),
                        _buildNavItem(1, 'assets/icons/nav_scan.png'),
                        _buildNavItem(2, 'assets/icons/nav_history.png'),
                        _buildNavItem(3, 'assets/icons/nav_profile.png'),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, String iconAsset) {
    final isSelected = _currentIndex == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: Center(
          child: AnimatedScale(
            scale: isSelected ? 1.08 : 1.0,
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOutBack,
            child: Image.asset(
              iconAsset,
              width: 24,
              height: 24,
              color: isSelected ? AppTheme.primary : AppTheme.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}
