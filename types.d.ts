type ThemeMode = "light" | "dark" | "system";
type ExportFormat = "txt" | "source" | "json";
type AttachmentKind = "image" | "file";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  hasAi: boolean;
  hasImage: boolean;
  hasFile: boolean;
}

interface SnippetRow {
  id: string;
  title: string;
  code: string;
  language: string;
  is_favorite: number;
  created_at: number;
  updated_at: number;
  // Populated by the list/detail join queries.
  tags?: string | null;
  has_ai?: number;
  has_image?: number;
  has_file?: number;
}

interface Attachment {
  id: string;
  snippetId: string;
  uri: string;
  name: string;
  kind: AttachmentKind;
  size: number;
  createdAt: number;
}

// A picked-but-not-yet-persisted attachment. Held in local state on the create
// screen (no snippet id yet); copied into storage + recorded once the snippet
// is saved.
interface DraftAttachment {
  uri: string;
  name: string;
  kind: AttachmentKind;
  size: number;
}

interface AttachmentRow {
  id: string;
  snippet_id: string;
  uri: string;
  name: string;
  kind: AttachmentKind;
  size: number;
  created_at: number;
}

// --- AI ---------------------------------------------------------------------

type AiKind = "explain" | "improve";

interface AiExplainContent {
  explanation: string;
  summary: string;
  suggestions: string[];
}

interface AiImproveContent {
  summary: string;
  improvedCode: string;
  notes: string[];
}

type AiContent = AiExplainContent | AiImproveContent;

interface AiGeneration {
  id: string;
  snippetId: string;
  kind: AiKind;
  content: AiContent;
  model: string | null;
  createdAt: number;
}

interface AiGenerationRow {
  id: string;
  snippet_id: string;
  kind: AiKind;
  content: string;
  model: string | null;
  created_at: number;
}

declare module "react-native-syntax-highlighter" {
  import { ComponentType, ReactNode } from "react";

  interface SyntaxHighlighterProps {
    language: string;
    style?: Record<string, unknown>;
    highlighter?: "hljs" | "prism";
    fontFamily?: string;
    fontSize?: number;
    customStyle?: Record<string, unknown>;
    // React 19 dropped function-component defaultProps, so the wrapper's
    // built-in PreTag/CodeTag defaults no longer apply — we must pass them.
    PreTag?: ComponentType<any>;
    CodeTag?: ComponentType<any>;
    children?: ReactNode;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/cjs/styles/hljs" {
  export const atomOneDark: Record<string, unknown>;
  export const atomOneLight: Record<string, unknown>;
}
