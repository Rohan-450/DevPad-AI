import Brand from "@/components/shared/Brand";
import AddTabButton from "@/components/tabs/AddBtn";
import SearchHeaderButton from "@/components/tabs/SearchHeaderBtn";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { tabs } from "../../constants/data";

export default function TabsLayout() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        headerTitle: () => <Brand />,
        headerStyle: {
          backgroundColor: isDarkMode ? colors.black : colors.white,
        },
        headerRightContainerStyle: { paddingRight: spacing.lg },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.outlineVariant,
          height: 68,
        },
        tabBarActiveTintColor: colors.onSurface,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: typography.labelCaps.fontFamily,
          fontSize: 11,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerRight: tab.showHeaderSearch
              ? () => <SearchHeaderButton />
              : undefined,
            tabBarIcon: tab.isAddButton
              ? () => null
              : ({ focused, color }) => (
                  <View style={styles.iconSlot}>
                    <View
                      style={[
                        styles.indicator,
                        {
                          backgroundColor: focused
                            ? colors.primaryContainer
                            : "transparent",
                        },
                      ]}
                    />
                    <Ionicons
                      name={focused ? tab.iconActive : tab.icon}
                      size={20}
                      color={color}
                    />
                  </View>
                ),
            tabBarButton: tab.isAddButton
              ? () => (
                  <AddTabButton onPress={() => router.push("/snippets/new")} />
                )
              : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    top: -spacing.sm,
    width: 36,
    height: 3,
    borderRadius: radius.full,
  },
});
