import { fonts, radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { LANGUAGES } from "@/lib/language";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export const ALL_LANGUAGES = "all";

type LanguageTabsProps = {
  selected: string;
  onSelect: (id: string) => void;
};

const TABS = [
  { id: ALL_LANGUAGES, name: "All" },
  ...LANGUAGES.map((l) => ({ id: l.id, name: l.name })),
];

const LanguageTabs = ({ selected, onSelect }: LanguageTabsProps) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {TABS.map((tab) => {
        const active = selected === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? colors.primaryContainer
                  : colors.surfaceContainer,
                borderColor: active
                  ? colors.primaryContainer
                  : colors.outlineVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: active
                    ? colors.onPrimaryContainer
                    : colors.onSurfaceVariant,
                },
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default LanguageTabs;

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    ...typography.bodyMd,
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
  },
});
