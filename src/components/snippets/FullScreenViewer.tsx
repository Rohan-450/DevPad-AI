import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FullScreenViewerProps<T> = {
  visible: boolean;
  items: T[];
  initialIndex?: number;
  onClose: () => void;
  onAdd?: () => void;
  onDelete?: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
};

// Shared fullscreen modal shell: paging arrows, counter, optional add/delete.
// Content for the current item is supplied via renderItem.
function FullScreenViewer<T>({
  visible,
  items,
  initialIndex = 0,
  onClose,
  onAdd,
  onDelete,
  renderItem,
}: FullScreenViewerProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  // Close once the last item is removed so the viewer never shows blank.
  useEffect(() => {
    if (visible && items.length === 0) onClose();
  }, [visible, items.length, onClose]);

  const safeIndex = Math.min(index, Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const atStart = safeIndex === 0;
  const atEnd = safeIndex === items.length - 1;
  const showActions = Boolean(onAdd || onDelete);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.backdrop,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={styles.counter}>
            {items.length > 1 ? `${safeIndex + 1} / ${items.length}` : ""}
          </Text>
          <Pressable hitSlop={8} onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {current != null ? renderItem(current, safeIndex) : null}

          {items.length > 1 ? (
            <>
              <Pressable
                style={[styles.arrow, styles.arrowLeft]}
                onPress={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={atStart}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color="#FFFFFF"
                  style={{ opacity: atStart ? 0.3 : 1 }}
                />
              </Pressable>
              <Pressable
                style={[styles.arrow, styles.arrowRight]}
                onPress={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
                disabled={atEnd}
              >
                <Ionicons
                  name="chevron-forward"
                  size={28}
                  color="#FFFFFF"
                  style={{ opacity: atEnd ? 0.3 : 1 }}
                />
              </Pressable>
            </>
          ) : null}
        </View>

        {showActions ? (
          <View style={styles.bottomBar}>
            {onAdd ? (
              <Pressable style={styles.bottomBtn} onPress={onAdd}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
                <Text style={styles.bottomLabel}>Add</Text>
              </Pressable>
            ) : null}
            {onDelete && current != null ? (
              <Pressable
                style={styles.bottomBtn}
                onPress={() => onDelete(safeIndex)}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.bottomLabel, { color: colors.error }]}>
                  Delete
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export default FullScreenViewer;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  counter: {
    ...typography.labelCaps,
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  arrowLeft: {
    left: spacing.md,
  },
  arrowRight: {
    right: spacing.md,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl,
    paddingTop: spacing.lg,
  },
  bottomBtn: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  bottomLabel: {
    ...typography.labelCaps,
    color: "#FFFFFF",
  },
});
