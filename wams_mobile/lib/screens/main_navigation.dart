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
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) {
            setState(() {
              _currentIndex = idx;
            });
          },
          backgroundColor: Colors.transparent,
          indicatorColor: AppTheme.primary.withValues(alpha: 0.12),
          destinations: [
            NavigationDestination(
              icon: Image.asset(
                'assets/icons/nav_home.png',
                width: 24,
                height: 24,
                color: AppTheme.textMuted,
              ),
              selectedIcon: Image.asset(
                'assets/icons/nav_home.png',
                width: 24,
                height: 24,
                color: AppTheme.primary,
              ),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Image.asset(
                'assets/icons/nav_scan.png',
                width: 24,
                height: 24,
                color: AppTheme.textMuted,
              ),
              selectedIcon: Image.asset(
                'assets/icons/nav_scan.png',
                width: 24,
                height: 24,
                color: AppTheme.primary,
              ),
              label: 'Scan QR',
            ),
            NavigationDestination(
              icon: Image.asset(
                'assets/icons/nav_history.png',
                width: 24,
                height: 24,
                color: AppTheme.textMuted,
              ),
              selectedIcon: Image.asset(
                'assets/icons/nav_history.png',
                width: 24,
                height: 24,
                color: AppTheme.primary,
              ),
              label: 'Riwayat',
            ),
            NavigationDestination(
              icon: Image.asset(
                'assets/icons/nav_profile.png',
                width: 24,
                height: 24,
                color: AppTheme.textMuted,
              ),
              selectedIcon: Image.asset(
                'assets/icons/nav_profile.png',
                width: 24,
                height: 24,
                color: AppTheme.primary,
              ),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}
