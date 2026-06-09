import Divider from "@/components/core/Divider";
import { darkColors, spacing, typography } from "@/constants";
import { StyleSheet, Text, View } from "react-native";

type SectionHeaderProps = {
  title: string;
};

const SectionHeader = ({ title }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: darkColors.primaryContainer }]}>
        {title}
      </Text>
      <Divider />
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    marginBottom: spacing.sm,
  },
});
