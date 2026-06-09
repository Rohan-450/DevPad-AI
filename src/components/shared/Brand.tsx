import { darkColors, spacing, typography } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const Brand = () => {
  return (
    <View style={styles.brand}>
      <MaterialIcons
        name="text-snippet"
        size={24}
        color={darkColors.primaryContainer}
      />
      <Text style={[styles.brandText, { color: darkColors.primaryContainer }]}>
        DevPad AI
      </Text>
    </View>
  );
};

export default Brand;

const styles = StyleSheet.create({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  brandText: {
    ...typography.headlineMd,
  },
});
