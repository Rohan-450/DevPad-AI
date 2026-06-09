import FileContentView from "@/components/snippets/FileContentView";
import FullScreenViewer from "@/components/snippets/FullScreenViewer";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type AttachmentItem = {
  id?: string;
  uri: string;
  name?: string;
  kind: AttachmentKind;
};

type AttachmentBoxProps = {
  attachments: AttachmentItem[];
  onAdd: (kind: AttachmentKind) => void;
  onDelete: (item: AttachmentItem) => void;
};

const CountBadge = ({
  count,
  style,
}: {
  count: number;
  style?: StyleProp<ViewStyle>;
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.badge, { backgroundColor: colors.primaryContainer }, style]}
    >
      <Text style={[styles.badgeText, { color: colors.onPrimaryContainer }]}>
        {count}
      </Text>
    </View>
  );
};

const AttachmentBox = ({ attachments, onAdd, onDelete }: AttachmentBoxProps) => {
  const { colors } = useTheme();
  const [viewer, setViewer] = useState<null | "image" | "file">(null);

  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind === "file");

  return (
    <View style={styles.stack}>
      {/* Images — clip lives on the outer wrap, not the image's parent */}
      <View style={styles.imageWrap}>
        {images.length > 0 ? (
          <Pressable
            style={[styles.imageFill, { backgroundColor: colors.surfaceContainerLowest }]}
            onPress={() => setViewer("image")}
          >
            <Image
              source={{ uri: images[0].uri }}
              style={styles.preview}
              contentFit="cover"
            />
            {images.length > 1 ? (
              <CountBadge count={images.length} style={styles.badgeFloat} />
            ) : null}
            <View style={styles.previewLabel}>
              <Text style={[styles.previewLabelText, { color: colors.primary }]}>
                PREVIEW
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.imageFill,
              styles.placeholder,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLowest,
              },
            ]}
            onPress={() => onAdd("image")}
          >
            <MaterialIcons name="add-a-photo" size={26} color={colors.primary} />
            <Text style={[styles.placeholderLabel, { color: colors.onSurface }]}>
              ADD SCREENSHOT
            </Text>
          </Pressable>
        )}
      </View>

      {/* Files */}
      {files.length > 0 ? (
        <Pressable
          style={[
            styles.fileBox,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
          onPress={() => setViewer("file")}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={colors.primary}
          />
          <Text
            style={[styles.fileName, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {files[0].name ?? "File"}
          </Text>
          {files.length > 1 ? <CountBadge count={files.length} /> : null}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
      ) : (
        <Pressable
          style={[
            styles.fileBox,
            styles.placeholder,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
          onPress={() => onAdd("file")}
        >
          <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
          <Text style={[styles.placeholderLabel, { color: colors.onSurface }]}>
            ADD FILE
          </Text>
        </Pressable>
      )}

      <FullScreenViewer
        visible={viewer === "image"}
        items={images}
        onClose={() => setViewer(null)}
        onAdd={() => onAdd("image")}
        onDelete={(i) => onDelete(images[i])}
        renderItem={(img) => (
          <Image
            source={{ uri: img.uri }}
            style={styles.fullImage}
            contentFit="contain"
          />
        )}
      />

      <FullScreenViewer
        visible={viewer === "file"}
        items={files}
        onClose={() => setViewer(null)}
        onAdd={() => onAdd("file")}
        onDelete={(i) => onDelete(files[i])}
        renderItem={(file) => (
          <FileContentView uri={file.uri} name={file.name} />
        )}
      />
    </View>
  );
};

export default AttachmentBox;

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    gap: spacing.md,
  },
  imageWrap: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  imageFill: {
    flex: 1,
  },
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  placeholderLabel: {
    ...typography.labelCaps,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFloat: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  badgeText: {
    ...typography.badge,
  },
  previewLabel: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
  },
  previewLabelText: {
    ...typography.labelCaps,
  },
  fileName: {
    ...typography.bodyMd,
    flex: 1,
  },
});
