import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabItem = {
  name: string;
  title: string;
  icon: IoniconName;
  iconActive: IoniconName;
  showHeaderSearch?: boolean;
  isAddButton?: boolean;
};

export const tabs: TabItem[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    iconActive: "home-sharp",
    showHeaderSearch: true,
  },
  {
    name: "favorites",
    title: "Favorites",
    icon: "star-outline",
    iconActive: "star-sharp",
  },
  {
    name: "add",
    title: "",
    icon: "add",
    iconActive: "add",
    isAddButton: true,
  },
  {
    name: "files",
    title: "Files",
    icon: "folder-outline",
    iconActive: "folder-sharp",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings-outline",
    iconActive: "settings-sharp",
  },
];
