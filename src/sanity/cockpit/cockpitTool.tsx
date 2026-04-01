import { definePlugin } from "sanity"
import { DashboardIcon } from "@sanity/icons"
import { CockpitScreen } from "./CockpitScreen"

export const cockpitTool = definePlugin(() => ({
  name: "cockpit-tool",
  tools: [
    {
      name: "cockpit",
      title: "Cockpit",
      icon: DashboardIcon,
      component: CockpitScreen,
    },
  ],
}))