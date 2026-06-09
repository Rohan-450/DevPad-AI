import {
  attachDocument,
  attachImageFromLibrary,
  captureImage,
  deleteAttachment,
  deleteManagedFile,
  listAllAttachments,
  listAttachments,
  listExports,
  readTextFile,
} from "@/services/files";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { snippetsKeys } from "./useSnippets";

export const attachmentsKeys = {
  all: ["attachments"] as const,
  snippet: (id: string) => [...attachmentsKeys.all, "snippet", id] as const,
  manager: () => [...attachmentsKeys.all, "manager"] as const,
  exports: () => ["exports"] as const,
};

export function useAttachments(snippetId: string) {
  return useQuery({
    queryKey: attachmentsKeys.snippet(snippetId),
    queryFn: () => listAttachments(snippetId),
    enabled: !!snippetId,
  });
}

export function useAllAttachments() {
  return useQuery({
    queryKey: attachmentsKeys.manager(),
    queryFn: listAllAttachments,
  });
}

export function useExports() {
  return useQuery({
    queryKey: attachmentsKeys.exports(),
    queryFn: listExports,
  });
}

export function useFileText(uri: string | null) {
  return useQuery({
    queryKey: ["fileText", uri],
    queryFn: () => readTextFile(uri!),
    enabled: !!uri,
  });
}

type ImageSource = "library" | "camera";

export function useAddImageAttachment(snippetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (source: ImageSource = "library") =>
      source === "camera"
        ? captureImage(snippetId)
        : attachImageFromLibrary(snippetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentsKeys.snippet(snippetId) });
      qc.invalidateQueries({ queryKey: attachmentsKeys.manager() });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(snippetId) });
    },
  });
}

export function useAddDocumentAttachment(snippetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => attachDocument(snippetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentsKeys.snippet(snippetId) });
      qc.invalidateQueries({ queryKey: attachmentsKeys.manager() });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(snippetId) });
    },
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; snippetId: string }) =>
      deleteAttachment(id),
    onSuccess: (_data, { snippetId }) => {
      qc.invalidateQueries({ queryKey: attachmentsKeys.snippet(snippetId) });
      qc.invalidateQueries({ queryKey: attachmentsKeys.manager() });
      qc.invalidateQueries({ queryKey: snippetsKeys.lists() });
      qc.invalidateQueries({ queryKey: snippetsKeys.detail(snippetId) });
    },
  });
}

export function useDeleteManagedFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => deleteManagedFile(uri),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attachmentsKeys.exports() });
    },
  });
}
