import 'package:flutter/material.dart';
import '../core/theme.dart';

class ToolThumbnail extends StatelessWidget {
  final String? imageUrl;
  final String? toolName;
  final double size;
  final double borderRadius;

  const ToolThumbnail({
    super.key,
    this.imageUrl,
    this.toolName,
    this.size = 52,
    this.borderRadius = 12,
  });

  IconData _getIconForTool(String? name) {
    final n = (name ?? '').toLowerCase();
    if (n.contains('bor')) return Icons.handyman;
    if (n.contains('multimeter') || n.contains('listrik') || n.contains('elektronik')) return Icons.bolt;
    if (n.contains('obeng')) return Icons.hardware;
    if (n.contains('kunci')) return Icons.build;
    if (n.contains('tang')) return Icons.precision_manufacturing;
    if (n.contains('meteran')) return Icons.straighten;
    if (n.contains('komponen') || n.contains('chip')) return Icons.memory;
    return Icons.build_circle_outlined;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: AppTheme.borderLight, width: 0.8),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? Image.network(
                imageUrl!,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => _buildPlaceholder(),
              )
            : _buildPlaceholder(),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Center(
      child: Icon(
        _getIconForTool(toolName),
        color: AppTheme.primary,
        size: size * 0.55,
      ),
    );
  }
}
