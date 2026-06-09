import {
  deleteGeneration,
  generate,
  latestGeneration,
  listGenerations,
  validateOpenRouterKey,
} from "@/services/ai";
import {
  clearOpenRouterKey,
  getOpenRouterKey,
  setOpenRouterKey,
} from "@/services/secrets";
import { updateSnippet } from "@/services/snippets";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { snippetsKeys } from "./useSnippets";

export const aiKeys = {
  all: ["ai"] as const,
  history: (snippetId: string) =>
    [...aiKeys.all, "history", snippetId] as const,
  latest: (snippetId: string, kind: AiKind) =>
    [...aiKeys.all, "latest", snippetId, kind] as const,
  apiKey: () => [...aiKeys.all, "key"] as const,
};

// --- API key -------------------------------------------------------------

export function useApiKey() {
  return useQuery({
    queryKey: aiKeys.apiKey(),
    queryFn: getOpenRouterKey,
    staleTime: Infinity,
  });
}

export function useSaveApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setOpenRouterKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.apiKey() });
    },
  });
}

export function useClearApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearOpenRouterKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.apiKey() });
    },
  });
}

// Returns a boolean — the Settings "Validate" button uses this.
export function useValidateApiKey() {
  return useMutation({
    mutationFn: validateOpenRouterKey,
  });
}

// --- generation history --------------------------------------------------

export function useLatestGeneration(snippetId: string, kind: AiKind) {
  return useQuery({
    queryKey: aiKeys.latest(snippetId, kind),
    queryFn: () => latestGeneration(snippetId, kind),
    enabled: !!snippetId,
  });
}

export function useGenerationHistory(snippetId: string) {
  return useQuery({
    queryKey: aiKeys.history(snippetId),
    queryFn: () => listGenerations(snippetId),
    enabled: !!snippetId,
  });
}

// --- generate (explain / improve) ----------------------------------------

export function useGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      snippet,
      kind,
    }: {
      snippet: Snippet;
      kind: AiKind;
    }) => generate(snippet, kind),
    onSuccess: (gen) => {
      qc.invalidateQueries({
        queryKey: aiKeys.latest(gen.snippetId, gen.kind),
      });
      qc.invalidateQueries({ queryKey: aiKeys.history(gen.snippetId) });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(gen.snippetId) });
    },
  });
}

export function useDeleteGeneration(snippetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGeneration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.history(snippetId) });
      qc.invalidateQueries({
        queryKey: aiKeys.latest(snippetId, "explain"),
      });
      qc.invalidateQueries({
        queryKey: aiKeys.latest(snippetId, "improve"),
      });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(snippetId) });
    },
  });
}

// --- apply an improvement (replace the snippet's code) -------------------

export function useApplyImprovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      snippetId,
      improvedCode,
    }: {
      snippetId: string;
      improvedCode: string;
    }) => {
      await updateSnippet(snippetId, { code: improvedCode });
    },
    onSuccess: (_data, { snippetId }) => {
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(snippetId) });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
    },
  });
}
