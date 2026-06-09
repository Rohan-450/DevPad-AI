import SnippetForm, {
    type SnippetFormValues,
} from "@/components/snippets/SnippetForm";
import { useCreateSnippet } from "@/hooks/useSnippets";
import { useRouter } from "expo-router";

export default function NewSnippet() {
  const router = useRouter();
  const { mutateAsync: create, isPending } = useCreateSnippet();

  const handleSubmit = async (values: SnippetFormValues) => {
    await create(values);
    router.replace("/");
  };

  return (
    <SnippetForm
      headerTitle="New Snippet"
      submitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
