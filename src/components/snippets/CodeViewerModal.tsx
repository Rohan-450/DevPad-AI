import CodeEditor from "@/components/core/CodeEditor";
import FullScreenViewer from "@/components/snippets/FullScreenViewer";
import { spacing } from "@/constants";
import { ScrollView, StyleSheet } from "react-native";

type CodeViewerModalProps = {
  visible: boolean;
  code: string;
  language: string;
  onClose: () => void;
};

// Read-only fullscreen code view (no add/delete, single item → no arrows).
const CodeViewerModal = ({
  visible,
  code,
  language,
  onClose,
}: CodeViewerModalProps) => {
  return (
    <FullScreenViewer
      visible={visible}
      items={[{ code, language }]}
      onClose={onClose}
      renderItem={(item) => (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CodeEditor
            value={item.code}
            language={item.language}
            mode="read"
            showLineNumbers
            fontSize={13}
          />
        </ScrollView>
      )}
    />
  );
};

export default CodeViewerModal;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
});
