import joplin from "api";
import { noteList } from "./notelist";

joplin.plugins.register({
  onStart: async function () {
    await noteList.init();

    joplin.settings.onChange(async (event: any) => {
      console.log("Settings changed");
      await noteList.settingsChanged();
    });
  },
});
