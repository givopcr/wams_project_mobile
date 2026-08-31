import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final txProvider = Provider.of<TransactionProvider>(context);
    final user = authProvider.userProfile;

    final int total = user?.totalHistory ?? txProvider.riwayatList.length;
    final int aktif = user?.activeBorrows ?? txProvider.activeBorrows.length;
    final int selesai = total >= aktif ? (total - aktif) : 0;
    const int terlambat = 0;

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Profil',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppTheme.textPrimary),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
        child: Column(
          children: [
            // User Header Avatar & Info (Mockup 12)
            Center(
              child: Column(
                children: [
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primary, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        user?.nama.isNotEmpty == true ? user!.nama[0].toUpperCase() : 'T',
                        style: const TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.nama ?? 'Teknisi Workshop',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'NIP: ${user?.nip ?? "2457301063"}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Teknik Mesin',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4 Stats Cards Horizontal (Total, Dipinjam, Selesai, Terlambat)
            Row(
              children: [
                _buildStatCard('Total Peminjaman', '$total', AppTheme.textPrimary),
                const SizedBox(width: 8),
                _buildStatCard('Sedang Dipinjam', '$aktif', const Color(0xFFD97706)),
                const SizedBox(width: 8),
                _buildStatCard('Selesai', '$selesai', AppTheme.success),
                const SizedBox(width: 8),
                _buildStatCard('Terlambat', '$terlambat', AppTheme.danger),
              ],
            ),
            const SizedBox(height: 24),

            // Navigation Menu List (Mockup 12)
            Container(
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    title: 'Informasi Profil',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  _buildMenuItem(
                    icon: Icons.lock_outline,
                    title: 'Ubah Password',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  _buildMenuItem(
                    icon: Icons.notifications_none_outlined,
                    title: 'Notifikasi',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Pengaturan notifikasi dibuka.')),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  _buildMenuItem(
                    icon: Icons.help_outline,
                    title: 'Bantuan',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Pusat bantuan workshop wams@politala.ac.id')),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  _buildMenuItem(
                    icon: Icons.info_outline,
                    title: 'Tentang Aplikasi',
                    onTap: () {
                      showAboutDialog(
                        context: context,
                        applicationName: 'WAMS Mobile',
                        applicationVersion: 'v1.0.0 (Build 2026)',
                        applicationLegalese: '© 2026 Workshop Asset Management System',
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Logout Button
            OutlinedButton.icon(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (dialogCtx) => AlertDialog(
                    backgroundColor: AppTheme.cardLight,
                    title: const Text('Konfirmasi Keluar', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16)),
                    content: const Text('Yakin ingin keluar dari akun WAMS?', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(dialogCtx, false),
                        child: const Text('Batal', style: TextStyle(color: AppTheme.textMuted)),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(dialogCtx, true),
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
                        child: const Text('Keluar'),
                      ),
                    ],
                  ),
                );

                if (confirm == true) {
                  await authProvider.logout();
                  if (!context.mounted) return;
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                }
              },
              icon: const Icon(Icons.logout, color: AppTheme.danger, size: 18),
              label: const Text(
                'Keluar',
                style: TextStyle(
                  color: AppTheme.danger,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFCA5A5)),
                backgroundColor: const Color(0xFFFFEAEA),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
        decoration: BoxDecoration(
          color: AppTheme.cardLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 9.5,
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: AppTheme.textPrimary, size: 20),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: AppTheme.textPrimary,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 18),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
    );
  }
}
