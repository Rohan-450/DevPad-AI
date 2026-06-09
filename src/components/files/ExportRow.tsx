import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { fileExtension, formatFileSize } from "@/lib/format";
import { getLanguageColor, languageFromFileName } from "@/lib/language";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ExportRowProps = {
  name: string;
  size: number;
  onPress: () => void;
  onDelete: () => void;
};

const ExportRow = ({ name, size, onPress, onDelete }: ExportRowProps) => {
  const { colors } = useTheme();
  const ext = fileExtension(name).toUpperCase();
  const tint =
    getLanguageColor(languageFromFileName(name)) ?? colors.surfaceTint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.typeBox, { borderColor: tint }]}>
        <Text style={[styles.typeText, { color: tint }]}>{ext}</Text>
      </View>
      <View style={styles.meta}>
        <Text
          style={[styles.name, { color: colors.onSurface }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
          {formatFileSize(size)} · {ext}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        hitSlop={8}
        style={({ pressed }) => [
          styles.deleteBtn,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </Pressable>
    </Pressable>
  );
};

export default ExportRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  typeBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeText: {
    ...typography.badge,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyLg,
  },
  sub: {
    ...typography.labelCaps,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
