import { radius, spacing } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";

const AddTabButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New snippet"
      onPress={onPress}
      style={({ pressed }) => [
        styles.addBtnWrap,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <LinearGradient
        colors={[colors.aiGradientStart, colors.aiGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.addBtnGradient}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
};

export default AddTabButton;

const styles = StyleSheet.create({
  addBtnWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    position: "relative",
    bottom: 25,
  },
  addBtnGradient: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});
