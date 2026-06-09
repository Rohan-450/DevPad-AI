import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { getLanguage } from "@/lib/language";
import { StyleSheet, Text, View } from "react-native";

// ~15% opacity fill expressed as an 8-digit hex alpha suffix.
const FILL_ALPHA = "26";

type LanguageBadgeProps = {
  language: string;
};

const LanguageBadge = ({ language }: LanguageBadgeProps) => {
  const { colors } = useTheme();
  const lang = getLanguage(language);
  const color = lang?.color ?? colors.outline;
  const name = (lang?.name ?? language).toUpperCase();

  return (
    <View
      style={[
        styles.badge,
        { borderColor: color, backgroundColor: `${color}${FILL_ALPHA}` },
      ]}
    >
      <Text style={[styles.text, { color }]}>{name}</Text>
    </View>
  );
};

export default LanguageBadge;

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  text: {
    ...typography.badge,
  },
});
