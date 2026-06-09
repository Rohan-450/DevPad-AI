import { getSnippetTags, listTags } from "@/services/tags";
import { useQuery } from "@tanstack/react-query";

export const tagsKeys = {
  all: ["tags"] as const,
  lists: () => [...tagsKeys.all, "list"] as const,
  snippet: (id: string) => [...tagsKeys.all, "snippet", id] as const,
};

// All tag names, cached. Filter this in-memory for autocomplete.
export function useTags() {
  return useQuery({
    queryKey: tagsKeys.lists(),
    queryFn: listTags,
  });
}

export function useSnippetTags(snippetId: string) {
  return useQuery({
    queryKey: tagsKeys.snippet(snippetId),
    queryFn: () => getSnippetTags(snippetId),
    enabled: !!snippetId,
  });
}
