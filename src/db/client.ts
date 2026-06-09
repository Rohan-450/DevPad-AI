import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "devsnippets.db";

export const db = SQLite.openDatabaseSync(DATABASE_NAME);
