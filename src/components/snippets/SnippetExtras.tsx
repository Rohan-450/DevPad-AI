import AIBox from "@/components/snippets/AIBox";
import AttachmentBox, {
  type AttachmentItem,
} from "@/components/snippets/AttachmentBox";
import { spacing } from "@/constants";
import { StyleSheet, View } from "react-native";

type SnippetExtrasProps = {
  // Optional — only available on the detail/edit screen (saved snippets).
  // When omitted (e.g. on the create form), AIBox is hidden.
  snippet?: Snippet;
  onGenerated?: () => void;
  attachments: AttachmentItem[];
  onAdd: (kind: AttachmentKind) => void;
  onDelete: (item: AttachmentItem) => void;
};

const SnippetExtras = ({
  snippet,
  onGenerated,
  attachments,
  onAdd,
  onDelete,
}: SnippetExtrasProps) => {
  return (
    <View style={styles.row}>
      <AIBox snippet={snippet} onGenerated={onGenerated} />
      <AttachmentBox
        attachments={attachments}
        onAdd={onAdd}
        onDelete={onDelete}
      />
    </View>
  );
};

export default SnippetExtras;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
});
