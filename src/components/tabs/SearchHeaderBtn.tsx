import { useTheme } from "@/context/theme";
import { Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

const SearchHeaderButton = () => {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      hitSlop={8}
      onPress={() => router.push("/search")}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Octicons name="codescan" size={24} color={colors.primary} />
    </Pressable>
  );
};

export default SearchHeaderButton;
