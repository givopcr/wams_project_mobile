import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import 'skeleton_loader.dart';

class ToolThumbnail extends StatelessWidget {
  final String? imageUrl;
  final String? toolName;
  final double size;
  final double borderRadius;
  final String? heroTag;

  const ToolThumbnail({
    super.key,
    this.imageUrl,
    this.toolName,
    this.size = 52,
    this.borderRadius = 12,
    this.heroTag,
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
    final resolvedUrl = ApiConstants.resolveImageUrl(imageUrl);

    Widget content = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: AppTheme.borderLight, width: 0.8),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: resolvedUrl != null && resolvedUrl.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: resolvedUrl,
                fit: BoxFit.contain,
                memCacheWidth: (size * 3).toInt().clamp(120, 600),
                memCacheHeight: (size * 3).toInt().clamp(120, 600),
                placeholder: (context, url) => const WamsShimmer(
                  child: ColoredBox(color: Colors.white),
                ),
                errorWidget: (context, url, error) => _buildPlaceholder(),
              )
            : _buildPlaceholder(),
      ),
    );

    if (heroTag != null && heroTag!.isNotEmpty) {
      return Hero(
        tag: heroTag!,
        child: Material(
          type: MaterialType.transparency,
          child: content,
        ),
      );
    }

    return content;
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
