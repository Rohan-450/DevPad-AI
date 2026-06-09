import { db } from "@/db/client";
import { extensionForLanguage } from "@/lib/language";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";

export type ManagedFile = {
  uri: string;
  name: string;
  size: number;
  modifiedAt: number | null;
};

const rowToAttachment = (r: AttachmentRow): Attachment => ({
  id: r.id,
  snippetId: r.snippet_id,
  uri: r.uri,
  name: r.name,
  kind: r.kind,
  size: r.size,
  createdAt: r.created_at,
});

// --- directory helpers ---------------------------------------------------

function snippetAttachmentsDir(snippetId: string): Directory {
  const dir = new Directory(Paths.document, "attachments", snippetId);
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function ensureExportsDir(): Directory {
  const dir = new Directory(Paths.document, "exports");
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function sanitizeFileName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "snippet"
  );
}

// Copies a picked file into the snippet's attachment folder and records a row.
async function saveAttachment(
  snippetId: string,
  sourceUri: string,
  originalName: string | null,
  kind: AttachmentKind,
): Promise<Attachment> {
  const dir = snippetAttachmentsDir(snippetId);
  const source = new File(sourceUri);
  const id = Crypto.randomUUID();
  const ext = source.extension || (kind === "image" ? ".jpg" : "");
  const dest = new File(dir, `${id}${ext}`);
  source.copy(dest);

  const attachment: Attachment = {
    id,
    snippetId,
    uri: dest.uri,
    name: originalName ?? `${id}${ext}`,
    kind,
    size: dest.size ?? 0,
    createdAt: Date.now(),
  };

  await db.runAsync(
    `INSERT INTO attachments (id, snippet_id, uri, name, kind, size, created_at)
     VALUES ($id, $sid, $uri, $name, $kind, $size, $created)`,
    {
      $id: attachment.id,
      $sid: snippetId,
      $uri: attachment.uri,
      $name: attachment.name,
      $kind: kind,
      $size: attachment.size,
      $created: attachment.createdAt,
    },
  );

  return attachment;
}

// --- pick (returns a draft; null if cancelled or permission denied) ------
// Drafts reference the picker's cache URI. Use these on the create screen
// where there's no snippet id yet, then persist once the snippet exists.

export async function pickImageFromLibrary(): Promise<DraftAttachment | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;

  const a = result.assets[0];
  return {
    uri: a.uri,
    name: a.fileName ?? "image.jpg",
    kind: "image",
    size: a.fileSize ?? 0,
  };
}

export async function captureImageDraft(): Promise<DraftAttachment | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;

  const a = result.assets[0];
  return {
    uri: a.uri,
    name: a.fileName ?? "photo.jpg",
    kind: "image",
    size: a.fileSize ?? 0,
  };
}

export async function pickDocument(): Promise<DraftAttachment | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    // Documents only — images belong in the image attachment box.
    type: ["text/*", "application/*"],
  });
  if (result.canceled || !result.assets?.length) return null;

  const a = result.assets[0];
  // Guard for platforms where the type filter doesn't exclude images.
  if (a.mimeType?.startsWith("image/")) return null;

  return { uri: a.uri, name: a.name ?? "file", kind: "file", size: a.size ?? 0 };
}

// Persist staged drafts onto a snippet that now has an id (create-screen save).
export async function persistDraftAttachments(
  snippetId: string,
  drafts: DraftAttachment[],
): Promise<void> {
  for (const d of drafts) {
    await saveAttachment(snippetId, d.uri, d.name, d.kind);
  }
}

// --- pick + persist in one call (edit/detail flow — snippet already exists)

export async function attachImageFromLibrary(
  snippetId: string,
): Promise<Attachment | null> {
  const draft = await pickImageFromLibrary();
  return draft
    ? saveAttachment(snippetId, draft.uri, draft.name, draft.kind)
    : null;
}

export async function captureImage(
  snippetId: string,
): Promise<Attachment | null> {
  const draft = await captureImageDraft();
  return draft
    ? saveAttachment(snippetId, draft.uri, draft.name, draft.kind)
    : null;
}

export async function attachDocument(
  snippetId: string,
): Promise<Attachment | null> {
  const draft = await pickDocument();
  return draft
    ? saveAttachment(snippetId, draft.uri, draft.name, draft.kind)
    : null;
}

// --- read ----------------------------------------------------------------

export async function listAttachments(
  snippetId: string,
): Promise<Attachment[]> {
  const rows = await db.getAllAsync<AttachmentRow>(
    "SELECT * FROM attachments WHERE snippet_id = $id ORDER BY created_at DESC",
    { $id: snippetId },
  );
  return rows.map(rowToAttachment);
}

export async function listAllAttachments(): Promise<Attachment[]> {
  const rows = await db.getAllAsync<AttachmentRow>(
    "SELECT * FROM attachments ORDER BY created_at DESC",
  );
  return rows.map(rowToAttachment);
}

export async function listExports(): Promise<ManagedFile[]> {
  const dir = ensureExportsDir();
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .map((f) => ({
      uri: f.uri,
      name: f.name,
      size: f.size ?? 0,
      modifiedAt: f.modificationTime,
    }))
    .sort((a, b) => (b.modifiedAt ?? 0) - (a.modifiedAt ?? 0));
}

// --- delete --------------------------------------------------------------

export async function deleteAttachment(id: string): Promise<void> {
  const row = await db.getFirstAsync<AttachmentRow>(
    "SELECT * FROM attachments WHERE id = $id",
    { $id: id },
  );
  if (!row) return;

  const file = new File(row.uri);
  if (file.exists) file.delete();
  await db.runAsync("DELETE FROM attachments WHERE id = $id", { $id: id });
}

// Removes a snippet's attachment files. The DB rows cascade via the FK; this
// deletes the physical folder. Call before/around deleteSnippet.
export async function deleteSnippetFiles(snippetId: string): Promise<void> {
  const dir = new Directory(Paths.document, "attachments", snippetId);
  if (dir.exists) dir.delete();
}

export async function deleteManagedFile(uri: string): Promise<void> {
  const file = new File(uri);
  if (file.exists) file.delete();
}

// --- export & share ------------------------------------------------------

export async function exportSnippet(
  snippet: Snippet,
  format: ExportFormat,
): Promise<File> {
  const dir = ensureExportsDir();
  const ext =
    format === "source" ? extensionForLanguage(snippet.language) : format;
  const file = new File(dir, `${sanitizeFileName(snippet.title)}.${ext}`);

  const content =
    format === "json"
      ? JSON.stringify(
          {
            title: snippet.title,
            language: snippet.language,
            tags: snippet.tags,
            code: snippet.code,
          },
          null,
          2,
        )
      : snippet.code;

  file.write(content);
  return file;
}

// Reads a file's content as text. Only call for text-ish files
// (see isTextFileName) — binary files would return garbage.
export async function readTextFile(uri: string): Promise<string> {
  const file = new File(uri);
  if (!file.exists) return "";
  return file.text();
}

export async function shareFile(
  uri: string,
  mimeType?: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
}

export async function exportAndShareSnippet(
  snippet: Snippet,
  format: ExportFormat,
): Promise<void> {
  const file = await exportSnippet(snippet, format);
  // A concrete MIME type makes the OS share sheet surface file targets
  // (Save to Files / Drive) rather than only messaging apps.
  const mimeType = format === "json" ? "application/json" : "text/plain";
  await shareFile(file.uri, mimeType);
}
