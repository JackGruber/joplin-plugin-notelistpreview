import joplin from "api";
import { ItemFlow, OnChangeEvent } from "api/noteListType";
import * as moment from "moment";
import * as removeMd from "remove-markdown";
import { I18n } from "i18n";
import * as path from "path";
import { settings } from "./settings";
import * as naturalCompare from "string-natural-compare";
import * as fs from "fs-extra";

let i18n: any;

class Notelist {
  private settings: any;
  private msgDialog: any;
  private thumbnailCache: Record<string, string> = {};

  constructor() {}

  public async init(): Promise<void> {
    console.log("Func: init");
    await this.translate();
    await settings.register();
    await this.loadSettings();
    await this.cleanResourcePreview();
    await this.genItemTemplate();
    await this.registerRendererPreview();
    await this.createMsgDialog();
  }

  private async translate(): Promise<void> {
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

  private async loadSettings(): Promise<void> {
    console.log("Func: loadSettings");
    this.settings = {
      itemTemplate: "",
      itemSizeHeight: await joplin.settings.value("itemSizeHeight"),
      daysHumanizeDate: await joplin.settings.value("daysHumanizeDate"),
      datePositionInline: await joplin.settings.value("datePositionInline"),
      bodyExcerpt: await joplin.settings.value("bodyExcerpt"),
      firstLine: (await joplin.settings.value("firstLine")).trim(),
      lastLine: (await joplin.settings.value("lastLine")).trim(),
      dateFormatJoplin: await joplin.settings.globalValue("dateFormat"),
      timeFormatJoplin: await joplin.settings.globalValue("timeFormat"),
      cssDateOverwrite: await joplin.settings.value("cssDateOverwrite"),
      cssTagOverwrite: await joplin.settings.value("cssTagOverwrite"),
      cssFirstLineOverwrite: await joplin.settings.value(
        "cssFirstLineOverwrite"
      ),
      cssLastLineOverwrite: await joplin.settings.value("cssLastLineOverwrite"),
      dataDir: await joplin.plugins.dataDir(),
      thumbnail: await joplin.settings.value("thumbnail"),
      thumbnailSize: await joplin.settings.value("thumbnailSize"),
    };
  }

  private async genItemTemplate(): Promise<void> {
    console.log("Func: genItemTemplate");

    let firstLine = "";
    if (this.settings["firstLine"] != "") {
      firstLine = '<p class="firstLine">{{{firstLine}}}</p>';
    }

    let lastLine = "";
    if (this.settings["lastLine"] != "") {
      lastLine = '<p class="lastLine">{{{lastLine}}}</p>';
    }

    let noteBody = "{{noteBody}}";
    if (this.settings["datePositionInline"] == "begin") {
      noteBody = '<span class="date">{{noteDate}}</span> ' + noteBody;
    } else if (this.settings["datePositionInline"] == "end") {
      noteBody = noteBody + ' <span class="date">{{noteDate}}</span>';
    }

    this.settings["itemTemplate"] = `
        <div class="content {{#item.selected}}-selected{{/item.selected}} {{#completed}}-completed{{/completed}}">
          <div class="title">
            {{#note.is_todo}}<span class="checkbox"><input data-id="todoCheckboxCompleted" type="checkbox" {{#completed}}checked{{/completed}} /></span>{{/note.is_todo}}
            {{#note.isWatched}}<i class="watchedicon fa fa-share-square"></i>{{/note.isWatched}}
            <span>{{{noteTitle}}}</span>
          </div>
          ${firstLine}
          <p class="body"> 
            {{#thumbnail}}
              <img class="thumbnail" src="file://{{thumbnail}}"/>
            {{/thumbnail}}
            ${noteBody}
          </p>
          ${lastLine}
        </div>
    `;
    console.log(this.settings["itemTemplate"]);
  }

  private async getItemCss(): Promise<string> {
    const cssDateDefault = "color: var(--joplin-color4);";
    const cssTagDefault = `
      border-radius: 5px;
      background: var(--joplin-divider-color);
      padding: 2px 5px 2px 5px;
    `;

    const cssDate =
      this.settings["cssDateOverwrite"].trim() != ""
        ? this.settings["cssDateOverwrite"]
        : cssDateDefault;
    const cssTag =
      this.settings["cssTagOverwrite"].trim() != ""
        ? this.settings["cssTagOverwrite"]
        : cssTagDefault;

    const cssFirstLine =
      this.settings["cssFirstLineOverwrite"].trim() != ""
        ? this.settings["cssFirstLineOverwrite"]
        : "white-space: nowrap;";
    const cssLastLine =
      this.settings["cssLastLineOverwrite"].trim() != ""
        ? this.settings["cssLastLineOverwrite"]
        : "white-space: nowrap;";

    const thumbnailFloat =
      this.settings["thumbnail"] == "right" ? "float: right;" : "float: left;";

    const thumbnailMargin =
      this.settings["thumbnail"] == "right"
        ? "margin: 3px 3px 3px 0px;"
        : "margin: 3px 0px 3px 3px;";

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

      > .content .leftColumn {
        background-color: yellow;
        width: 50px;
        float:left;
      }

      > .content .rightColumn {
        background-color: green;
        margin-left: 50px;
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

      > .content > .body .thumbnail {
        display: flex;
        max-width: ${this.settings["thumbnailSize"]}px;
        max-height: ${this.settings["thumbnailSize"]}px;
        ${thumbnailFloat}
        ${thumbnailMargin}
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
        ${cssDate}
      }

      > .content > .firstLine {
        ${cssFirstLine}
      }

      > .content > .lastLine {
        ${cssLastLine}
      }

      > .content > .firstLine > .date {
        ${cssDate}
      }

      > .content > .lastLine > .date {
        ${cssDate}
      }

      > .content > .firstLine > .tags > .tag {
        ${cssTag}
      }

      > .content > .lastLine > .tags > .tag {
        ${cssTag}
      }

      > .content.-selected {
          background-color: var(--joplin-selected-color);
      }
    `;
  }

  private async getNoteDateFormated(noteDate: any): Promise<string> {
    let date = new Date(noteDate);
    let dateString: string =
      moment(date.getTime()).format(this.settings["dateFormatJoplin"]) +
      " " +
      moment(date.getTime()).format(this.settings["timeFormatJoplin"]);

    if (
      moment(moment()).diff(date.getTime(), "days") <=
      this.settings["daysHumanizeDate"]
    ) {
      dateString = moment
        .duration(moment(date.getTime()).diff(moment()))
        .humanize(true);
    }

    return dateString;
  }

  private async getBody(noteBody: string): Promise<string> {
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

    let bodyExcerpt = "";
    for (const word of noteBody.split(" ")) {
      if (bodyExcerpt.length + word.length > this.settings["bodyExcerpt"]) {
        break;
      }
      bodyExcerpt = bodyExcerpt + word + " ";
    }
    if (bodyExcerpt.length < noteBody.length) {
      bodyExcerpt = bodyExcerpt + " ...";
    }

    return bodyExcerpt;
  }

  private async getTags(noteTags: any): Promise<Array<string>> {
    let tags = [];
    for (const tag of noteTags) {
      tags.push(tag.title);
    }
    tags.sort((a, b) => {
      return naturalCompare(a, b, { caseInsensitive: true });
    });

    return tags;
  }

  private async registerRendererPreview(): Promise<void> {
    console.log("Func: registerRendererPreview");
    await joplin.views.noteList.registerRenderer({
      id: "previewNotelist",
      label: async () => "Preview",
      flow: ItemFlow.TopToBottom,
      itemSize: {
        width: 0,
        height: this.settings["itemSizeHeight"],
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
      itemCss: await this.getItemCss(),
      itemTemplate: this.settings["itemTemplate"],
      onRenderNote: async (props: any): Promise<any> => {
        return await this.onRenderNoteCall(props);
      },
      onChange: async (event: OnChangeEvent): Promise<void> => {
        await this.onChangeEvent(event);
      },
    });
  }

  private async onRenderNoteCall(props: any): Promise<any> {
    console.log("Func: onRenderNoteCall");
    console.log(props);
    const noteBody = await this.getBody(props.note.body);
    const dateString = await this.getNoteDateFormated(
      props.note.user_updated_time
    );
    const tags = await this.getTags(props.note.tags);

    const completed =
      props.note.is_todo == 1 && props.note.todo_completed != 0 ? true : false;

    let firstLine = this.settings["firstLine"];
    let lastLine = this.settings["lastLine"];
    const dateStringHtml = '<span class="date">' + dateString + "</span>";

    let tagString = "";
    if (tags.length > 0) {
      tagString =
        '<span class="tags"><span class="tag">' +
        tags.join('</span> <span class="tag">') +
        "</span></span>";
    }

    firstLine = firstLine.replace("{{tags}}", tagString);
    lastLine = lastLine.replace("{{tags}}", tagString);

    firstLine = firstLine.replace("{{date}}", dateStringHtml);
    lastLine = lastLine.replace("{{date}}", dateStringHtml);

    let thumbnail = null;
    if (this.settings["thumbnail"] != "no") {
      thumbnail = await this.getResourcePreview(props.note.id, props.note.body);
    }

    return {
      ...props,
      noteBody: noteBody,
      noteTitle: props.note.titleHtml,
      noteDate: dateString,
      firstLine: firstLine,
      lastLine: lastLine,
      completed: completed,
      thumbnail: thumbnail,
    };
  }

  private async onChangeEvent(event: OnChangeEvent): Promise<void> {
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

  public async settingsChanged(): Promise<void> {
    await this.loadSettings();
    await this.showMsg(i18n.__("msg.settingsChanged", "Note list (Preview)"));
  }

  private async createMsgDialog(): Promise<void> {
    this.msgDialog = await joplin.views.dialogs.create("noteListPreviewDialog");
    await joplin.views.dialogs.addScript(this.msgDialog, "webview.css");
  }

  private async showMsg(msg: string, title: string = null) {
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
    await joplin.views.dialogs.setButtons(this.msgDialog, [{ id: "ok" }]);
    await joplin.views.dialogs.setHtml(this.msgDialog, html.join("\n"));
    await joplin.views.dialogs.open(this.msgDialog);
  }

  private async getResourcePreview(
    noteId: string,
    noteBody: string
  ): Promise<string> {
    console.log("Func: getResourcePreview");

    const regExresourceId =
      /(!\[([^\]]+|)\]\(|<img([^>]+)src=["']):\/(?<resourceId>[\da-z]{32})/g;
    let resourceOrder = [];
    let regExMatch = null;
    while ((regExMatch = regExresourceId.exec(noteBody)) != null) {
      resourceOrder.push(regExMatch["groups"]["resourceId"]);
    }

    const resources = await joplin.data.get(["notes", noteId, "resources"], {
      fields: "id, title, mime, filename",
    });

    let resource = null;
    if (resourceOrder.length > 0) {
      for (const check of resourceOrder) {
        for (const resourceItem of resources.items) {
          if (check == resourceItem.id) {
            if (resourceItem.mime.includes("image/")) {
              resource = resourceItem;
            }
            break;
          }
        }
        if (resource) {
          break;
        }
      }
    }

    let thumbnailFilePath = "";
    if (resource) {
      const existingFilePath = this.thumbnailCache[resource.id];
      if (existingFilePath) {
        thumbnailFilePath = existingFilePath;
      } else {
        thumbnailFilePath = path.join(
          this.settings["dataDir"],
          "thumb_" + resource.id + ".jpg"
        );

        await this.genResourcePreviewImage(resource, thumbnailFilePath);

        this.thumbnailCache[resource.id] = thumbnailFilePath;
      }
    }
    return thumbnailFilePath;
  }

  private async genResourcePreviewImage(
    resource: any,
    filePath: string
  ): Promise<boolean> {
    console.log("Func: genResourcePreviewImage");
    const imageHandle = await joplin.imaging.createFromResource(resource.id);
    const resizedImageHandle = await joplin.imaging.resize(imageHandle, {
      width: this.settings["thumbnailSize"],
    });
    await joplin.imaging.toJpgFile(resizedImageHandle, filePath, 90);
    await joplin.imaging.free(imageHandle);
    await joplin.imaging.free(resizedImageHandle);

    return true;
  }

  private async cleanResourcePreview(): Promise<void> {
    console.log("Func: cleanResourcePreview");

    const files = fs
      .readdirSync(this.settings["dataDir"], { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
      .reverse();

    for (const file of files) {
      if (file.includes("thumb_") && file.includes(".jpg")) {
        try {
          fs.removeSync(path.join(this.settings["dataDir"], file));
        } catch (e) {
          await this.showMsg(
            i18n.__(
              "msg.error.cleanResourcePreview",
              "cleanResourcePreview",
              e.message
            )
          );
          throw e;
        }
      }
    }
  }
}

export { Notelist, i18n };
