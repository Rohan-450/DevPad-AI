import AttachmentTile from "@/components/files/AttachmentTile";
import ExportRow from "@/components/files/ExportRow";
import TemplatesCard from "@/components/files/TemplatesCard";
import FileContentView from "@/components/snippets/FileContentView";
import FullScreenViewer from "@/components/snippets/FullScreenViewer";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import {
    useAllAttachments,
    useDeleteManagedFile,
    useExports,
} from "@/hooks/useAttachments";
import { fileExtension } from "@/lib/format";
import { shareFile } from "@/services/files";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function Files() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: attachments = [] } = useAllAttachments();
  const { data: exportFiles = [] } = useExports();
  const { mutate: deleteExportFile } = useDeleteManagedFile();
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Attachment | null>(null);

  const q = query.trim().toLowerCase();
  const match = (name: string, extra = "") =>
    !q ||
    name.toLowerCase().includes(q) ||
    fileExtension(name).includes(q) ||
    extra.includes(q);

  const filteredAttachments = attachments.filter((a) => match(a.name, a.kind));
  const filteredExports = exportFiles.filter((f) => match(f.name));

  const confirmDeleteExport = (uri: string, name: string) => {
    Alert.alert("Delete file?", `"${name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteExportFile(uri),
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Search */}
      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search files by name or type..."
          placeholderTextColor={colors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.searchInput, { color: colors.onSurface }]}
        />
      </View>

      {/* Attachments */}
      <SectionHeading title="Attachments" count={filteredAttachments.length} />
      {filteredAttachments.length > 0 ? (
        <View style={styles.grid}>
          {filteredAttachments.map((a) => (
            <AttachmentTile
              key={a.id}
              kind={a.kind}
              uri={a.uri}
              name={a.name}
              size={a.size}
              onView={() => setViewing(a)}
              onOpenSnippet={() =>
                router.push({
                  pathname: "/snippets/[id]",
                  params: { id: a.snippetId },
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyLine text="No attachments yet." />
      )}

      {/* Exports */}
      <SectionHeading title="Exports" count={filteredExports.length} />
      {filteredExports.length > 0 ? (
        filteredExports.map((f) => (
          <ExportRow
            key={f.uri}
            name={f.name}
            size={f.size}
            onPress={() => shareFile(f.uri)}
            onDelete={() => confirmDeleteExport(f.uri, f.name)}
          />
        ))
      ) : (
        <EmptyLine text="No exports yet." />
      )}

      {/* Templates — compact placeholder, non-functional */}
      <SectionHeading title="Templates" />
      <TemplatesCard />

      {/* Fullscreen attachment viewer (read-only — no add/delete) */}
      <FullScreenViewer
        visible={!!viewing}
        items={viewing ? [viewing] : []}
        onClose={() => setViewing(null)}
        renderItem={(item) =>
          item.kind === "image" ? (
            <Image
              source={{ uri: item.uri }}
              style={styles.viewerImage}
              contentFit="contain"
            />
          ) : (
            <FileContentView uri={item.uri} name={item.name} />
          )
        }
      />
    </ScrollView>
  );
}

const SectionHeading = ({
  title,
  count,
}: {
  title: string;
  count?: number;
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {title}
      </Text>
      {count !== undefined ? (
        <Text style={[styles.sectionCount, { color: colors.onSurfaceVariant }]}>
          {count} ITEM{count === 1 ? "" : "S"}
        </Text>
      ) : null}
    </View>
  );
};

const EmptyLine = ({ text }: { text: string }) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.emptyLine, { color: colors.onSurfaceVariant }]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },

  // Search
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyLg,
    paddingVertical: spacing.xs,
  },

  // Section heading
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineMd,
  },
  sectionCount: {
    ...typography.labelCaps,
  },

  // Attachments grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  emptyLine: {
    ...typography.bodyMd,
    paddingVertical: spacing.sm,
  },

  // Viewer
  viewerImage: {
    width: "100%",
    height: "100%",
  },
});
