import { db } from "@/db/client";

// Tag names in the join query are concatenated with the ASCII unit separator
// (code 31) instead of a comma, so commas inside a tag can't corrupt the split.
export const TAG_SEPARATOR = String.fromCharCode(31);

export function normalizeTagName(name: string): string {
  return name
    .trim()
    .replace(/^#+/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function getOrCreateTag(name: string): Promise<number> {
  const normalized = normalizeTagName(name);
  await db.runAsync("INSERT OR IGNORE INTO tags (name) VALUES ($n)", {
    $n: normalized,
  });
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM tags WHERE name = $n",
    { $n: normalized },
  );
  return row!.id;
}

export async function listTags(): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM tags ORDER BY name",
  );
  return rows.map((r) => r.name);
}

export async function getSnippetTags(snippetId: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT t.name
     FROM tags t
     JOIN snippet_tags st ON st.tag_id = t.id
     WHERE st.snippet_id = $id
     ORDER BY t.name`,
    { $id: snippetId },
  );
  return rows.map((r) => r.name);
}

// Replaces a snippet's tags wholesale. Creates missing tags, links them,
// then prunes any tag left with no snippets. Used by both create and edit.
export async function setSnippetTags(
  snippetId: string,
  names: string[],
): Promise<void> {
  const normalized = Array.from(
    new Set(names.map(normalizeTagName).filter((n) => n.length > 0)),
  );

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM snippet_tags WHERE snippet_id = $id", {
      $id: snippetId,
    });

    for (const name of normalized) {
      const tagId = await getOrCreateTag(name);
      await db.runAsync(
        "INSERT OR IGNORE INTO snippet_tags (snippet_id, tag_id) VALUES ($s, $t)",
        { $s: snippetId, $t: tagId },
      );
    }

    await db.runAsync(
      "DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM snippet_tags)",
    );
  });
}

// Exposed for flows that remove links outside setSnippetTags (e.g. deleting a
// snippet, whose links cascade away — call this afterward to drop orphans).
export async function pruneUnusedTags(): Promise<void> {
  await db.runAsync(
    "DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM snippet_tags)",
  );
}
