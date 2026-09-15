import 'package:flutter/material.dart';
import '../core/theme.dart';

/// Smart countdown badge for active loans based on [batasKembali]
class CountdownBadge extends StatelessWidget {
  final String? batasKembali;
  final bool compact;

  const CountdownBadge({
    super.key,
    required this.batasKembali,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final info = _calculateDeadline(batasKembali);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: info.backgroundColor,
        borderRadius: BorderRadius.circular(compact ? 8 : 12),
        border: Border.all(
          color: info.borderColor,
          width: 0.8,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            info.icon,
            size: compact ? 11 : 13,
            color: info.textColor,
          ),
          const SizedBox(width: 4),
          Text(
            info.label,
            style: TextStyle(
              fontSize: compact ? 10 : 11,
              fontWeight: FontWeight.bold,
              color: info.textColor,
            ),
          ),
        ],
      ),
    );
  }

  _DeadlineInfo _calculateDeadline(String? raw) {
    if (raw == null || raw.isEmpty) {
      return _DeadlineInfo(
        label: 'Aktif',
        textColor: AppTheme.primary,
        backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
        borderColor: AppTheme.primary.withValues(alpha: 0.2),
        icon: Icons.schedule_rounded,
      );
    }

    try {
      final target = DateTime.parse(raw);
      final now = DateTime.now();
      final diff = target.difference(now);

      if (diff.isNegative) {
        final days = -diff.inDays;
        final hours = -diff.inHours;
        final text = days > 0 ? '$days hari terlambat' : '$hours jam terlambat';

        return _DeadlineInfo(
          label: text,
          textColor: AppTheme.danger,
          backgroundColor: const Color(0xFFFEE2E2),
          borderColor: const Color(0xFFFCA5A5),
          icon: Icons.warning_amber_rounded,
        );
      } else if (diff.inHours <= 12) {
        final hours = diff.inHours;
        final text = hours <= 1
            ? (diff.inMinutes <= 0 ? 'Segera kembali' : '${diff.inMinutes}m lagi')
            : '$hours jam lagi';

        return _DeadlineInfo(
          label: text,
          textColor: const Color(0xFFD97706),
          backgroundColor: const Color(0xFFFEF3C7),
          borderColor: const Color(0xFFFCD34D),
          icon: Icons.access_time_rounded,
        );
      } else {
        final days = diff.inDays == 0 ? 1 : diff.inDays;
        return _DeadlineInfo(
          label: '$days hari lagi',
          textColor: const Color(0xFF3B82F6),
          backgroundColor: const Color(0xFFEFF6FF),
          borderColor: const Color(0xFFBFDBFE),
          icon: Icons.schedule_rounded,
        );
      }
    } catch (_) {
      return _DeadlineInfo(
        label: raw,
        textColor: AppTheme.textMuted,
        backgroundColor: const Color(0xFFF3F4F6),
        borderColor: AppTheme.borderLight,
        icon: Icons.schedule_rounded,
      );
    }
  }
}

class _DeadlineInfo {
  final String label;
  final Color textColor;
  final Color backgroundColor;
  final Color borderColor;
  final IconData icon;

  const _DeadlineInfo({
    required this.label,
    required this.textColor,
    required this.backgroundColor,
    required this.borderColor,
    required this.icon,
  });
}
