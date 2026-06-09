import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { fileExtension, formatFileSize } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AttachmentTileProps = {
  kind: AttachmentKind;
  uri: string;
  name: string;
  size: number;
  onView: () => void;
  onOpenSnippet: () => void;
};

const AttachmentTile = ({
  kind,
  uri,
  name,
  size,
  onView,
  onOpenSnippet,
}: AttachmentTileProps) => {
  const { colors } = useTheme();
  const isImage = kind === "image";

  return (
    <Pressable
      onPress={onView}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.preview,
          { backgroundColor: colors.surfaceContainerLowest },
        ]}
      >
        {isImage ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons
            name="document-text-outline"
            size={36}
            color={colors.primary}
          />
        )}
        <View style={[styles.badge, { backgroundColor: colors.black }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {isImage ? "IMG" : fileExtension(name).toUpperCase() || "FILE"}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text
          style={[styles.name, { color: colors.onSurface }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <View style={styles.subRow}>
          <Text style={[styles.size, { color: colors.onSurfaceVariant }]}>
            {formatFileSize(size)}
          </Text>
          <Pressable
            onPress={onOpenSnippet}
            hitSlop={8}
            style={({ pressed }) => [
              styles.snippetBtn,
              {
                backgroundColor: colors.surfaceContainerHigh,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name="code-slash-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.snippetBtnText, { color: colors.primary }]}>
              SNIPPET
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export default AttachmentTile;

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  preview: {
    aspectRatio: 4 / 3,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.badge,
  },
  meta: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    ...typography.bodyMd,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  size: {
    ...typography.labelCaps,
  },
  snippetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  snippetBtnText: {
    ...typography.badge,
  },
});
