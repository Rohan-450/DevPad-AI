import { useTheme } from "@/context/theme";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export type DividerOrientation = "horizontal" | "vertical";

export type DividerProps = {
  orientation?: DividerOrientation;
  color?: string;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
};

const Divider = ({
  orientation = "horizontal",
  color,
  thickness = StyleSheet.hairlineWidth,
  style,
}: DividerProps) => {
  const { colors } = useTheme();
  const isVertical = orientation === "vertical";

  return (
    <View
      style={[
        {
          backgroundColor: color ?? colors.outlineVariant,
          alignSelf: "stretch",
          ...(isVertical ? { width: thickness } : { height: thickness }),
        },
        style,
      ]}
    />
  );
};

export default Divider;
