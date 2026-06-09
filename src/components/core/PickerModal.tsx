import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type PickerOption<T extends string | number> = {
  value: T;
  label: string;
  tint?: string;
};

type Props<T extends string | number> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

const PickerModal = <T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props<T>) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      backdropColor={"rbga(0,0,0,0.5)"}
    >
      <Pressable style={[styles.backdrop]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceContainer,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle}>
            <View
              style={[
                styles.handleBar,
                { backgroundColor: colors.outlineVariant },
              ]}
            />
          </View>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>

          {options.map((opt) => {
            const isSelected = opt.value === selected;
            return (
              <Pressable
                key={String(opt.value)}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed
                      ? colors.surfaceContainerHigh
                      : "transparent",
                  },
                ]}
              >
                {opt.tint ? (
                  <View style={[styles.chip, { borderColor: opt.tint }]}>
                    <Text style={[styles.chipText, { color: opt.tint }]}>
                      {opt.label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.label, { color: colors.onSurface }]}>
                    {opt.label}
                  </Text>
                )}
                <View style={styles.spacer} />
                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PickerModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  handle: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
  },
  title: {
    ...typography.headlineMd,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    minHeight: 48,
  },
  label: {
    ...typography.bodyLg,
  },
  spacer: {
    flex: 1,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipText: {
    ...typography.bodyMd,
  },
});
