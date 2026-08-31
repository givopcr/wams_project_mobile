import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.userProfile;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil Pengguna'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primary, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        user?.nama.isNotEmpty == true ? user!.nama[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          fontSize: 28,
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
                    user?.email ?? '',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
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
                  ListTile(
                    leading: const Icon(Icons.badge_outlined, color: AppTheme.primary, size: 20),
                    title: const Text('NIP', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                    trailing: Text(
                      user?.nip ?? 'Belum diset',
                      style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  ListTile(
                    leading: const Icon(Icons.security_outlined, color: AppTheme.primary, size: 20),
                    title: const Text('Role Akun', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                    trailing: Text(
                      user?.role.toUpperCase() ?? 'USER',
                      style: const TextStyle(fontSize: 13, color: AppTheme.primaryDark, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  ListTile(
                    leading: const Icon(Icons.edit_outlined, color: AppTheme.primary, size: 20),
                    title: const Text('Edit Profil & Password', style: TextStyle(fontSize: 13, color: AppTheme.textPrimary, fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 18),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (dialogCtx) => AlertDialog(
                    backgroundColor: AppTheme.cardLight,
                    title: const Text('Konfirmasi Logout', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16)),
                    content: const Text('Yakin ingin keluar dari akun WAMS?', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(dialogCtx, false), child: const Text('Batal', style: TextStyle(color: AppTheme.textMuted))),
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
              label: const Text('LOGOUT / KELUAR', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold, fontSize: 13)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.danger),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
