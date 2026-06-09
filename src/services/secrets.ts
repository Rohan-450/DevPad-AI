import * as SecureStore from "expo-secure-store";

// Per-user OpenRouter API key. Lives in the OS keychain via SecureStore — not
// in zustand/AsyncStorage, which is unencrypted plaintext on disk.
const OPENROUTER_KEY = "ai.openrouter.key";

export async function getOpenRouterKey(): Promise<string | null> {
  return SecureStore.getItemAsync(OPENROUTER_KEY);
}

export async function setOpenRouterKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(OPENROUTER_KEY, key.trim());
}

export async function clearOpenRouterKey(): Promise<void> {
  await SecureStore.deleteItemAsync(OPENROUTER_KEY);
}
