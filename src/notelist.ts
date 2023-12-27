import joplin from "api";
import { ItemFlow } from "api/noteListType";
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

    const content = document.createElement("div");
    content.setAttribute(
      "class",
      "content {{#item.selected}}-selected{{/item.selected}} {{#completed}}-completed{{/completed}}"
    );

    const title = document.createElement("p");
    title.setAttribute("class", "title");
    title.innerHTML = "{{{noteTitle}}}";

    if (noteListSettings["firstLine"] != "") {
      const firstLine = document.createElement("p");
      firstLine.setAttribute("class", "firstLine");
      firstLine.innerHTML = "{{firstLine}}";
      content.appendChild(firstLine);
    }

    content.appendChild(title);

    const dateInline = document.createElement("span");
    dateInline.setAttribute("class", "date");
    dateInline.innerHTML = "{{noteDate}}";

    const body = document.createElement("p");
    body.setAttribute("class", "body");
    if (noteListSettings["datePositionInline"] == "begin") {
      body.innerHTML = dateInline.outerHTML + " {{noteBody}}";
    } else if (noteListSettings["datePositionInline"] == "end") {
      body.innerHTML = " {{noteBody}}" + dateInline.outerHTML;
    } else {
      body.innerHTML = "{{noteBody}}";
    }

    content.appendChild(body);

    if (noteListSettings["lastLine"] != "") {
      const lastLine = document.createElement("p");
      lastLine.setAttribute("class", "lastLine");
      lastLine.innerHTML = "{{lastLine}}";
      content.appendChild(lastLine);
    }

    noteListSettings["itemTemplate"] = content.outerHTML;
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
        "item.selected",
        "note.titleHtml",
        "note.body",
        "note.user_updated_time",
        "note.tags",
      ],

      itemCss: `
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
    
                >.content > .title {
                    font-weight: bold;
                    font-family: var(--joplin-font-family);
                    font-size: var(--joplin-font-size);
                    white-space: nowrap;
                }
    
                >.content > .body {
                    opacity: 0.7;
                }

                >.content > .firstLine {
                    opacity: 0.7;
                    margin-bottom: 2px;
                }

                >.content > .lastLine {
                    opacity: 0.7;
                    margin-top: 2px;
                }

                >.content > .body > .date {
                    color: var(--joplin-color4);
                }
    
                > .content.-selected {
                    background-color: var(--joplin-selected-color);
                }
            `,

      itemTemplate: noteListSettings["itemTemplate"],

      onRenderNote: async (props: any) => {
        console.log("Func: onRenderNote");
        const noteBody = await noteList.getBody(props.note.body);
        const dateString = await noteList.getNoteDateFormated(
          props.note.user_updated_time
        );
        const tags = await noteList.getTags(props.note.tags);

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
        };
      },
    });
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
