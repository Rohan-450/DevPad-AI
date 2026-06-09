import { fonts, spacing } from "@/constants";
import { useTheme } from "@/context/theme";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import {
    atomOneDark,
    atomOneLight,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";

type Props = {
    value: string;
    onChange?: (next: string) => void;
    language: string;
    mode?: "read" | "edit";
    showLineNumbers?: boolean;
    fontSize?: number;
    placeholder?: string;
};

const CodeEditor = ({
    value,
    onChange,
    language,
    mode = "read",
    showLineNumbers = true,
    fontSize = 13,
    placeholder = "// Paste or write your code here…",
}: Props) => {
    const { colors, isDarkMode } = useTheme();
    const [visualLineCount, setVisualLineCount] = useState(1);

    // react-native-syntax-highlighter hardcodes each rendered line's box height
    // to (fontSize + 5). Match it everywhere so the gutter aligns with the
    // highlighted rows in read mode and the TextInput rows in edit mode.
    const lineHeight = fontSize + 5;
    const isEditing = mode === "edit";

    // Edit mode wraps text, so the gutter follows visual (wrapped) lines.
    // Read mode renders one highlighter row per logical line, so count those.
    const logicalLineCount = Math.max(1, value.split("\n").length);
    const lineCount = isEditing ? visualLineCount : logicalLineCount;

    const textStyle = {
        fontFamily: fonts.monoRegular,
        fontSize,
        lineHeight,
    };

    // Normalize line endings to LF so code
    // pasted from desktop editors doesn't produce phantom blank lines.
    const handleChange = (text: string) => {
        onChange?.(text.replace(/\n\n?/g, "\n"));
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.surfaceContainerLowest },
            ]}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                nestedScrollEnabled
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                >
                    {showLineNumbers ? (
                        <View
                            style={[
                                styles.gutter,
                                {
                                    backgroundColor: colors.surfaceContainerLow,
                                    borderRightColor: colors.outlineVariant,
                                },
                            ]}
                        >
                            {Array.from({ length: lineCount }, (_, i) => (
                                <Text
                                    key={i}
                                    style={[
                                        styles.lineNumber,
                                        textStyle,
                                        { color: colors.onSurfaceVariant },
                                    ]}
                                >
                                    {i + 1}
                                </Text>
                            ))}
                        </View>
                    ) : null}

                    <View style={styles.codeArea}>
                        {/* Invisible mirror, edit mode only: wraps identically to the
              TextInput so onTextLayout yields the visual (wrapped) line count. */}
                        {isEditing ? (
                            <Text
                                style={[textStyle, styles.mirror]}
                                onTextLayout={(e) =>
                                    setVisualLineCount(Math.max(1, e.nativeEvent.lines.length))
                                }
                            >
                                {value || " "}
                            </Text>
                        ) : null}

                        {isEditing ? (
                            <TextInput
                                value={value}
                                onChangeText={handleChange}
                                placeholder={placeholder}
                                placeholderTextColor={colors.onSecondaryFixedVariant}
                                multiline
                                autoCorrect={false}
                                autoCapitalize="none"
                                spellCheck={false}
                                scrollEnabled={false}
                                textAlignVertical="top"
                                style={[styles.input, textStyle, { color: colors.onSurface }]}
                            />
                        ) : value.length === 0 ? (
                            <Text
                                style={[
                                    textStyle,
                                    styles.placeholder,
                                    { color: colors.onSecondaryFixedVariant },
                                ]}
                            >
                                {placeholder}
                            </Text>
                        ) : (
                            <SyntaxHighlighter
                                language={language}
                                style={isDarkMode ? atomOneDark : atomOneLight}
                                highlighter="hljs"
                                PreTag={View}
                                CodeTag={View}
                                customStyle={{
                                    margin: 0,
                                    padding: 0,
                                    backgroundColor: "transparent",
                                }}
                                fontFamily={fonts.monoRegular}
                                fontSize={fontSize}
                            >
                                {value}
                            </SyntaxHighlighter>
                        )}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
};

export default CodeEditor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: "100%",
    },
    gutter: {
        minWidth: 36,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRightWidth: 1,
        alignItems: "flex-end",
        alignSelf: "stretch",
    },
    lineNumber: {
        textAlign: "right",
    },
    codeArea: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        position: "relative",
    },
    mirror: {
        position: "absolute",
        top: spacing.md,
        left: spacing.md,
        right: spacing.md,
        color: "transparent",
    },
    input: {
        padding: 0,
        margin: 0,
        minHeight: 24,
    },
    placeholder: {
        opacity: 0.7,
    },
});
