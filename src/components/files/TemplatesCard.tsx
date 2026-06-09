import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Compact, non-functional placeholder for a future Templates feature.
const TemplatesCard = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <Ionicons
        name="albums-outline"
        size={20}
        color={colors.onSurfaceVariant}
      />
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          No templates yet
        </Text>
        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
          Save snippet collections as templates.
        </Text>
      </View>
      <View style={[styles.btn, { backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="add" size={16} color={colors.onPrimaryContainer} />
      </View>
    </View>
  );
};

export default TemplatesCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyLg,
  },
  sub: {
    ...typography.bodyMd,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
