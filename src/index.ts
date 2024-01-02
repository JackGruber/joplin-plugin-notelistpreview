import joplin from "api";
import { Notelist } from "./notelist";

const notelist = new Notelist();

joplin.plugins.register({
  onStart: async function () {
    await notelist.init();

    joplin.settings.onChange(async (event: any) => {
      console.log("Settings changed");
      await notelist.settingsChanged();
    });
  },
});
