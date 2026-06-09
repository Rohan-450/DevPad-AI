import { db } from "@/db/client";
import { normalizeTagName, TAG_SEPARATOR } from "@/services/tags";
import * as Crypto from "expo-crypto";

export type CreateSnippetInput = {
  title: string;
  code: string;
  language: string;
  isFavorite?: boolean;
};

export type UpdateSnippetInput = Partial<CreateSnippetInput>;

export type ListOptions = {
  favoritesOnly?: boolean;
  search?: string;
  language?: string;
  tag?: string;
};

// Aggregates tags into one column and adds boolean-ish flags for whether the
// snippet has any AI generations / image / file attachments (for card icons).
const SELECT_WITH_TAGS = `
  SELECT s.*,
    GROUP_CONCAT(t.name, char(31)) AS tags,
    EXISTS(SELECT 1 FROM ai_generations g WHERE g.snippet_id = s.id)                    AS has_ai,
    EXISTS(SELECT 1 FROM attachments a   WHERE a.snippet_id = s.id AND a.kind = 'image') AS has_image,
    EXISTS(SELECT 1 FROM attachments a   WHERE a.snippet_id = s.id AND a.kind = 'file')  AS has_file
  FROM snippets s
  LEFT JOIN snippet_tags st ON st.snippet_id = s.id
  LEFT JOIN tags t ON t.id = st.tag_id
`;

const rowToSnippet = (row: SnippetRow): Snippet => ({
  id: row.id,
  title: row.title,
  code: row.code,
  language: row.language,
  isFavorite: row.is_favorite === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tags: row.tags ? row.tags.split(TAG_SEPARATOR) : [],
  hasAi: row.has_ai === 1,
  hasImage: row.has_image === 1,
  hasFile: row.has_file === 1,
});

export async function createSnippet(
  input: CreateSnippetInput,
): Promise<Snippet> {
  const now = Date.now();
  const snippet: Snippet = {
    id: Crypto.randomUUID(),
    title: input.title,
    code: input.code,
    language: input.language,
    isFavorite: input.isFavorite ?? false,
    createdAt: now,
    updatedAt: now,
    tags: [],
    hasAi: false,
    hasImage: false,
    hasFile: false,
  };

  await db.runAsync(
    `INSERT INTO snippets (id, title, code, language, is_favorite, created_at, updated_at)
     VALUES ($id, $title, $code, $language, $isFavorite, $createdAt, $updatedAt)`,
    {
      $id: snippet.id,
      $title: snippet.title,
      $code: snippet.code,
      $language: snippet.language,
      $isFavorite: snippet.isFavorite ? 1 : 0,
      $createdAt: snippet.createdAt,
      $updatedAt: snippet.updatedAt,
    },
  );

  return snippet;
}

export async function updateSnippet(
  id: string,
  input: UpdateSnippetInput,
): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, string | number> = { $id: id };

  if (input.title !== undefined) {
    fields.push("title = $title");
    params.$title = input.title;
  }
  if (input.code !== undefined) {
    fields.push("code = $code");
    params.$code = input.code;
  }
  if (input.language !== undefined) {
    fields.push("language = $language");
    params.$language = input.language;
  }
  if (input.isFavorite !== undefined) {
    fields.push("is_favorite = $isFavorite");
    params.$isFavorite = input.isFavorite ? 1 : 0;
  }

  if (fields.length === 0) return;

  fields.push("updated_at = $updatedAt");
  params.$updatedAt = Date.now();

  await db.runAsync(
    `UPDATE snippets SET ${fields.join(", ")} WHERE id = $id`,
    params,
  );
}

export async function deleteSnippet(id: string): Promise<void> {
  await db.runAsync("DELETE FROM snippets WHERE id = $id", { $id: id });
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const row = await db.getFirstAsync<SnippetRow>(
    `${SELECT_WITH_TAGS} WHERE s.id = $id GROUP BY s.id`,
    { $id: id },
  );
  return row ? rowToSnippet(row) : null;
}

export async function listSnippets(
  options: ListOptions = {},
): Promise<Snippet[]> {
  const where: string[] = [];
  const params: Record<string, string | number> = {};

  if (options.favoritesOnly) {
    where.push("s.is_favorite = 1");
  }
  if (options.language) {
    where.push("s.language = $language");
    params.$language = options.language;
  }
  if (options.search && options.search.trim().length > 0) {
    where.push("(s.title LIKE $search OR s.code LIKE $search)");
    params.$search = `%${options.search.trim()}%`;
  }
  if (options.tag) {
    // Subquery (not a join filter) so the snippet's full tag list still
    // aggregates — we only use the tag to decide which snippets qualify.
    where.push(
      `s.id IN (
        SELECT st2.snippet_id FROM snippet_tags st2
        JOIN tags t2 ON t2.id = st2.tag_id
        WHERE t2.name = $tag
      )`,
    );
    params.$tag = normalizeTagName(options.tag);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.getAllAsync<SnippetRow>(
    `${SELECT_WITH_TAGS} ${whereClause}
     GROUP BY s.id
     ORDER BY s.updated_at DESC`,
    params,
  );

  return rows.map(rowToSnippet);
}

export async function toggleFavorite(id: string): Promise<void> {
  await db.runAsync(
    `UPDATE snippets
     SET is_favorite = CASE is_favorite WHEN 1 THEN 0 ELSE 1 END,
         updated_at = $updatedAt
     WHERE id = $id`,
    { $id: id, $updatedAt: Date.now() },
  );
}

export async function countSnippets(): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM snippets",
  );
  return row?.count ?? 0;
}
