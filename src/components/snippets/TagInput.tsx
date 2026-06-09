import TagChip from "@/components/snippets/TagChip";
import { radius, spacing, typography } from "@/constants";
import { useTheme } from "@/context/theme";
import { useTags } from "@/hooks/useTags";
import { normalizeTagName } from "@/services/tags";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const MAX_SUGGESTIONS = 6;

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
};

const TagInput = ({ value, onChange }: TagInputProps) => {
  const { colors } = useTheme();
  const { data: allTags = [] } = useTags();
  const [text, setText] = useState("");

  const query = normalizeTagName(text);

  const addTag = (raw: string) => {
    const name = normalizeTagName(raw);
    setText("");
    if (!name || value.includes(name)) return;
    onChange([...value, name]);
  };

  const removeTag = (name: string) =>
    onChange(value.filter((t) => t !== name));

  const suggestions =
    query.length === 0
      ? []
      : allTags
          .filter((t) => t.includes(query) && !value.includes(t))
          .slice(0, MAX_SUGGESTIONS);

  const canCreate =
    query.length > 0 && !allTags.includes(query) && !value.includes(query);

  const showSuggestions =
    query.length > 0 && (suggestions.length > 0 || canCreate);

  return (
    <View>
      <View
        style={[
          styles.box,
          {
            borderColor: colors.outlineVariant,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {value.map((tag) => (
          <TagChip key={tag} label={tag} onRemove={() => removeTag(tag)} />
        ))}
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => addTag(text)}
          placeholder="Add tag..."
          placeholderTextColor={colors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={false}
          style={[styles.input, { color: colors.onSurface }]}
        />
      </View>

      {showSuggestions ? (
        <View
          style={[
            styles.suggestions,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainer,
            },
          ]}
        >
          {suggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => addTag(s)}
              style={({ pressed }) => [
                styles.suggestionRow,
                {
                  backgroundColor: pressed
                    ? colors.surfaceContainerHigh
                    : "transparent",
                },
              ]}
            >
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={colors.onSurfaceVariant}
              />
              <Text style={[styles.suggestionText, { color: colors.onSurface }]}>
                #{s}
              </Text>
            </Pressable>
          ))}
          {canCreate ? (
            <Pressable
              onPress={() => addTag(query)}
              style={({ pressed }) => [
                styles.suggestionRow,
                {
                  backgroundColor: pressed
                    ? colors.surfaceContainerHigh
                    : "transparent",
                },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[styles.suggestionText, { color: colors.primary }]}>
                Add &quot;#{query}&quot;
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default TagInput;

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 52,
  },
  input: {
    ...typography.bodyLg,
    flexGrow: 1,
    minWidth: 100,
    paddingVertical: spacing.xs,
  },
  suggestions: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  suggestionText: {
    ...typography.bodyMd,
  },
});
