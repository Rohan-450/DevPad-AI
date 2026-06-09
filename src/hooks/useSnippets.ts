import { deleteSnippetFiles, persistDraftAttachments } from "@/services/files";
import {
  createSnippet,
  deleteSnippet,
  getSnippet,
  listSnippets,
  toggleFavorite,
  updateSnippet,
  type CreateSnippetInput,
  type ListOptions,
} from "@/services/snippets";
import { pruneUnusedTags, setSnippetTags } from "@/services/tags";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { attachmentsKeys } from "./useAttachments";
import { tagsKeys } from "./useTags";

export const snippetsKeys = {
  all: ["snippets"] as const,
  lists: () => [...snippetsKeys.all, "list"] as const,
  list: (filters: ListOptions) =>
    [...snippetsKeys.lists(), filters] as const,
  details: () => [...snippetsKeys.all, "detail"] as const,
  detail: (id: string) => [...snippetsKeys.details(), id] as const,
};

export function useSnippets(filters: ListOptions = {}) {
  return useQuery({
    queryKey: snippetsKeys.list(filters),
    queryFn: () => listSnippets(filters),
  });
}

export function useSnippet(id: string) {
  return useQuery({
    queryKey: snippetsKeys.detail(id),
    queryFn: () => getSnippet(id),
    enabled: !!id,
  });
}

export function useCreateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: CreateSnippetInput & {
        tags?: string[];
        attachments?: DraftAttachment[];
      },
    ) => {
      const { tags, attachments, ...snippetInput } = input;
      const snippet = await createSnippet(snippetInput);
      if (tags && tags.length > 0) {
        await setSnippetTags(snippet.id, tags);
      }
      if (attachments && attachments.length > 0) {
        await persistDraftAttachments(snippet.id, attachments);
      }
      return snippet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: tagsKeys.all });
      qc.invalidateQueries({ queryKey: attachmentsKeys.all });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.details() });
    },
  });
}

export function useUpdateSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: CreateSnippetInput & {
        id: string;
        tags?: string[];
        attachments?: DraftAttachment[];
      },
    ) => {
      const { id, tags, attachments, ...fields } = input;
      await updateSnippet(id, fields);
      if (tags) await setSnippetTags(id, tags);
      if (attachments && attachments.length > 0) {
        await persistDraftAttachments(id, attachments);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.details() });
      qc.invalidateQueries({ queryKey: tagsKeys.all });
      qc.invalidateQueries({ queryKey: attachmentsKeys.all });
    },
  });
}

export function useDeleteSnippet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteSnippetFiles(id);
      await deleteSnippet(id);
      await pruneUnusedTags();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: tagsKeys.all });
      qc.invalidateQueries({ queryKey: attachmentsKeys.all });
    },
  });
}
