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
          color: AppTheme.cardDark,
          border: Border(
            top: BorderSide(color: AppTheme.borderDark, width: 0.8),
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
          indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined, color: Color(0xFF94A3B8)),
              selectedIcon: Icon(Icons.dashboard, color: AppTheme.primary),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.qr_code_scanner_outlined, color: Color(0xFF94A3B8)),
              selectedIcon: Icon(Icons.qr_code_scanner, color: AppTheme.primary),
              label: 'Scan QR',
            ),
            NavigationDestination(
              icon: Icon(Icons.history_outlined, color: Color(0xFF94A3B8)),
              selectedIcon: Icon(Icons.history, color: AppTheme.primary),
              label: 'Riwayat',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline, color: Color(0xFF94A3B8)),
              selectedIcon: Icon(Icons.person, color: AppTheme.primary),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }
}
