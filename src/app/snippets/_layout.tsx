import { useTheme } from "@/context/theme";
import { Stack } from "expo-router";

const SnippetsLayout = () => {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
};

export default SnippetsLayout;
