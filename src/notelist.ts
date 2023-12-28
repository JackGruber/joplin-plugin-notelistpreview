import joplin from "api";
import { ItemFlow, OnChangeEvent } from "api/noteListType";
import * as moment from "moment";
import * as removeMd from "remove-markdown";
import { I18n } from "i18n";
import * as path from "path";
import { settings } from "./settings";
import * as naturalCompare from "string-natural-compare";

let i18n: any;
let noteListSettings = {};
let msgDialog: any;

namespace noteList {
  export async function init() {
    console.log("Func: init");
    await noteList.translate();
    await settings.register();
    await noteList.loadSettings();
    await noteList.genItemTemplate();
    await noteList.registerRendererPreview();
    await noteList.createMsgDialog();
  }

  export async function translate() {
    console.log("Func: translate");
    const joplinLocale = await joplin.settings.globalValue("locale");
    const installationDir = await joplin.plugins.installationDir();

    i18n = new I18n({
      locales: ["en_US", "de_DE"],
      defaultLocale: "en_US",
      fallbacks: { "en_*": "en_US" },
      updateFiles: false,
      retryInDefaultLocale: true,
      syncFiles: false,
      objectNotation: true,
      directory: path.join(installationDir, "locales"),
    });
    i18n.setLocale(joplinLocale);
    moment.locale(joplinLocale);
  }

  export async function loadSettings() {
    console.log("Func: loadSettings");
    noteListSettings = {
      itemTemplate: "",
      itemSizeHeight: await joplin.settings.value("itemSizeHeight"),
      daysHumanizeDate: await joplin.settings.value("daysHumanizeDate"),
      datePositionInline: await joplin.settings.value("datePositionInline"),
      bodyExcerpt: await joplin.settings.value("bodyExcerpt"),
      firstLine: (await joplin.settings.value("firstLine")).trim(),
      lastLine: (await joplin.settings.value("lastLine")).trim(),
      dateFormatJoplin: await joplin.settings.globalValue("dateFormat"),
      timeFormatJoplin: await joplin.settings.globalValue("timeFormat"),
    };
  }

  export async function genItemTemplate() {
    console.log("Func: genItemTemplate");

    let firstLine = "";
    if (noteListSettings["firstLine"] != "") {
      firstLine = '<p class="firstLine">{{firstLine}}</p>';
    }

    let lastLine = "";
    if (noteListSettings["lastLine"] != "") {
      lastLine = '<p class="lastLine">{{lastLine}}</p>';
    }

    let noteBody = "{{noteBody}}";
    if (noteListSettings["datePositionInline"] == "begin") {
      noteBody = '<span class="date">{{noteDate}}</span> ' + noteBody;
    } else if (noteListSettings["datePositionInline"] == "end") {
      noteBody = noteBody + ' <span class="date">{{noteDate}}</span>';
    }

    noteListSettings["itemTemplate"] = `
        <div class="content {{#item.selected}}-selected{{/item.selected}} {{#completed}}-completed{{/completed}}">
          <div class="title">
            {{#note.is_todo}}<span class="checkbox"><input data-id="todoCheckboxCompleted" type="checkbox" {{#completed}}checked{{/completed}} /></span>{{/note.is_todo}}
            {{#note.isWatched}}<i class="watchedicon fa fa-share-square"></i>{{/note.isWatched}}
            <span>{{{noteTitle}}}</span>
          </div>
          ${firstLine}
          <p class="body"> 
            ${noteBody}
          </p>
          ${lastLine}
        </div>
    `;
    console.log(noteListSettings["itemTemplate"]);
  }

  export async function getItemCss() {
    return `
      > .content {
          width: 100%;
          box-sizing: border-box;
          padding-left: 10px;
          padding-right: 10px;
          padding-top: 5px;
          padding-bottom: 5px;
          overflow: hidden;
          color: var(--joplin-color);
      }

      > .content p {
          margin-bottom: 5px;
      }

      > .content > .title {
          font-weight: bold;
          font-family: var(--joplin-font-family);
          font-size: var(--joplin-font-size);
          white-space: nowrap;
          display: flex;
          align-items: center;
      }

      > .content > .title > .checkbox {
        padding-right: 4px;
      }

      > .content > .title > .checkbox input {
        margin: 3px 3px 3px 0px;
      }

      > .content > .title > .watchedicon {
        padding-right: 4px;
        padding-left: 1px;
      }

      > .content > .body {
          opacity: 0.7;
      }

      > .content > .firstLine {
          opacity: 0.7;
          margin-bottom: 2px;
      }

      > .content > .lastLine {
          opacity: 0.7;
          margin-top: 2px;
      }

      > .content > .body > .date {
          color: var(--joplin-color4);
      }

      > .content.-selected {
          background-color: var(--joplin-selected-color);
      }
    `;
  }

  export async function getNoteDateFormated(noteDate: any): Promise<string> {
    let date = new Date(noteDate);
    let dateString: string =
      moment(date.getTime()).format(noteListSettings["dateFormatJoplin"]) +
      " " +
      moment(date.getTime()).format(noteListSettings["timeFormatJoplin"]);

    if (
      moment(moment()).diff(date.getTime(), "days") <=
      noteListSettings["daysHumanizeDate"]
    ) {
      dateString = moment
        .duration(moment(date.getTime()).diff(moment()))
        .humanize(true);
    }

    return dateString;
  }

  export async function getBody(noteBody: string): Promise<string> {
    noteBody = removeMd(noteBody, {
      stripListLeaders: true, // strip list leaders (default: true)
      listUnicodeChar: "", // char to insert instead of stripped list leaders (default: '')
      gfm: true, // support GitHub-Flavored Markdown (default: true)
      useImgAltText: false, // replace images with alt-text, if present (default: true)
    });

    // Remove some other MD formats
    noteBody = noteBody.replace(/(\s\\?~~|~~\s)/g, " ");
    noteBody = noteBody.replace(/(\s\\?==|==\s)/g, " ");
    noteBody = noteBody.replace(/(\s\\?\+\+|\+\+\s)/g, " ");

    noteBody = noteBody.substring(0, noteListSettings["bodyExcerpt"]);

    return noteBody;
  }

  export async function getTags(noteTags: any): Promise<Array<string>> {
    let tags = [];
    for (const tag of noteTags) {
      tags.push(tag.title);
    }
    tags.sort((a, b) => {
      return naturalCompare(a, b, { caseInsensitive: true });
    });

    return tags;
  }

  export async function registerRendererPreview() {
    console.log("Func: registerRendererPreview");
    await joplin.views.noteList.registerRenderer({
      id: "previewNotelist",
      label: async () => "Preview",
      flow: ItemFlow.TopToBottom,
      itemSize: {
        width: 0,
        height: noteListSettings["itemSizeHeight"],
      },
      dependencies: [
        "note.id",
        "item.selected",
        "note.titleHtml",
        "note.body",
        "note.user_updated_time",
        "note.tags",
        "note.is_todo",
        "note.todo_completed",
        "note.isWatched",
      ],
      itemCss: await noteList.getItemCss(),
      itemTemplate: noteListSettings["itemTemplate"],
      onRenderNote: async (props: any): Promise<any> => {
        return await noteList.onRenderNoteCall(props);
      },
      onChange: async (event: OnChangeEvent): Promise<void> => {
        await noteList.onChangeEvent(event);
      },
    });
  }

  export async function onRenderNoteCall(props: any): Promise<any> {
    console.log("Func: onRenderNoteCall");
    console.log(props);
    const noteBody = await noteList.getBody(props.note.body);
    const dateString = await noteList.getNoteDateFormated(
      props.note.user_updated_time
    );
    const tags = await noteList.getTags(props.note.tags);

    const completed =
      props.note.is_todo == 1 && props.note.todo_completed != 0 ? true : false;

    let firstLine = noteListSettings["firstLine"];
    let lastLine = noteListSettings["lastLine"];

    firstLine = firstLine.replace("{{tags}}", tags.join(", "));
    lastLine = lastLine.replace("{{tags}}", tags.join(", "));

    firstLine = firstLine.replace("{{date}}", dateString);
    lastLine = lastLine.replace("{{date}}", dateString);

    return {
      ...props,
      noteBody: noteBody,
      noteTitle: props.note.titleHtml,
      noteDate: dateString,
      firstLine: firstLine,
      lastLine: lastLine,
      completed: completed,
    };
  }

  export async function onChangeEvent(event: OnChangeEvent): Promise<void> {
    console.log("Func: onChangeEvent");
    console.log(event);
    if (event.elementId === "todoCheckboxCompleted") {
      if (event.value) {
        await joplin.data.put(["notes", event.noteId], null, {
          todo_completed: Date.now(),
        });
      } else {
        await joplin.data.put(["notes", event.noteId], null, {
          todo_completed: 0,
        });
      }
    }
  }

  export async function settingsChanged() {
    await noteList.loadSettings();
    await noteList.showMsg(
      i18n.__("msg.settingsChanged", "Note list (Preview)")
    );
  }

  export async function createMsgDialog() {
    msgDialog = await joplin.views.dialogs.create("noteListPreviewDialog");
    await joplin.views.dialogs.addScript(msgDialog, "webview.css");
  }

  export async function showMsg(msg: string, title: string = null) {
    const html = [];

    if (title !== null) {
      console.log(`${title}: ${msg}`);
    } else {
      console.log(`${msg}`);
    }

    html.push('<div id="notelist" style="notelistmsg">');
    html.push(`<h3>Note list (Preview) plugin</h3>`);
    if (title) {
      html.push(`<p>${title}</p>`);
    }
    html.push(`<div id="msg">${msg}`);
    html.push("</div>");
    await joplin.views.dialogs.setButtons(msgDialog, [{ id: "ok" }]);
    await joplin.views.dialogs.setHtml(msgDialog, html.join("\n"));
    await joplin.views.dialogs.open(msgDialog);
  }
}

export { noteList, i18n };
