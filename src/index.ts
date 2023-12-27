import joplin from 'api';
import { noteList } from "./notelist";

joplin.plugins.register({
	onStart: async function() {
		await noteList.init()
	},
});
