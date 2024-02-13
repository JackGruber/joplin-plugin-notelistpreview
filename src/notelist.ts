import joplin from "api";
import { ItemFlow, OnChangeEvent } from "api/noteListType";
import * as moment from "moment";
import * as removeMd from "remove-markdown";
import { I18n } from "i18n";
import * as path from "path";
import { settings } from "./settings";
import { ThumbnailCache, Thumbnail } from "./type";
import * as naturalCompare from "string-natural-compare";
import * as fs from "fs-extra";
import notelistLogging from "electron-log/main";
import { MenuItemLocation } from "api/types";
import { ModelType } from "api/types";

let i18n: any;

class Notelist {
  private settings: any;
  private msgDialog: any;
  private thumbnailCache: ThumbnailCache = {};
  private log: any;
  private logFile: any;
  private dataDir: string;

  constructor() {
    this.log = notelistLogging;
    this.setupLog();
  }

  public async init(): Promise<void> {
    this.log.verbose("Func: init");
    this.logFile = path.join(await joplin.plugins.dataDir(), "log.log");

    await this.translate();
    await settings.register(this.logFile);
    await this.loadSettings();
    await this.fileLogging(true);
    await this.logSettings();
    await this.cleanResourcePreview();
    await this.genItemTemplate();
    await this.registerRendererPreview();
    await this.createMsgDialog();
    await this.registerCommands();
  }

  private async setupLog() {
    this.log.initialize({ spyRendererConsole: true });
    const logFormat = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
    this.log.initialize();
    this.log.transports.file.level = false;
    this.log.transports.file.format = logFormat;
    this.log.transports.console.level = "verbose";
    this.log.transports.console.format = logFormat;
  }

  private async fileLogging(enable: boolean) {
    const fileLogLevel = await joplin.settings.value("fileLogLevel");

    try {
      fs.removeSync(this.logFile);
    } catch (e) {
      await this.showMsg(
        i18n.__("msg.error.deleteLogFile", "cleanResourcePreview", e.message)
      );
      throw e;
    }

    if (enable === true && fileLogLevel !== "false") {
      this.log.transports.file.resolvePathFn = () => this.logFile;
      this.log.transports.file.level = fileLogLevel;
    } else {
      this.log.transports.file.level = false;
    }
  }

  private async logSettings(): Promise<void> {
    this.log.verbose("## SETTINGS ##");
    this.log.verbose(this.settings);
    this.log.verbose("## SETTINGS ##");
  }

  private async translate(): Promise<void> {
    this.log.verbose("Func: translate");
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
    this.log.verbose("Func: loadSettings");

    this.dataDir = await joplin.plugins.dataDir();

    let confidentialTags = await joplin.settings.value("confidentialTags");
    confidentialTags = confidentialTags.trim().toLowerCase();
    if (confidentialTags.indexOf(",") != 0 && confidentialTags.length > 0) {
      confidentialTags = confidentialTags.split(/\s*,\s*/);
    } else {
      confidentialTags = [];
    }

    this.settings = {
      itemTemplate: "",
      layout: await joplin.settings.value("layout"),
      itemSizeHeight: await joplin.settings.value("itemSizeHeight"),
      daysHumanizeDate: await joplin.settings.value("daysHumanizeDate"),
      bodyExcerpt: await joplin.settings.value("bodyExcerpt"),
      firstLine: (await joplin.settings.value("firstLine")).trim(),
      noteLine: (await joplin.settings.value("noteLine")).trim(),
      lastLine: (await joplin.settings.value("lastLine")).trim(),
      dateFormatJoplin: await joplin.settings.globalValue("dateFormat"),
      timeFormatJoplin: await joplin.settings.globalValue("timeFormat"),
      thumbnail: await joplin.settings.value("thumbnail"),
      thumbnailSize: await joplin.settings.value("thumbnailSize"),
      thumbnailSquare: await joplin.settings.value("thumbnailSquare"),
      todoDueColorOpen: await joplin.settings.value("todoDueColorOpen"),
      todoDueNearHours: await joplin.settings.value("todoDueNearHours"),
      todoDueColorNear: await joplin.settings.value("todoDueColorNear"),
      todoDueColorOverdue: await joplin.settings.value("todoDueColorOverdue"),
      todoDueColorDone: await joplin.settings.value("todoDueColorDone"),
      joplinZoome: await joplin.settings.globalValue("windowContentZoomFactor"),
      confidentialTags: confidentialTags,
    };
  }

  private async registerCommands() {
    await joplin.commands.register({
      name: "toggleConfidential",
      label: i18n.__("cmd.toggleConfidential"),
      execute: async () => {
        await this.toggleConfidential();
      },
    });

    await joplin.views.menuItems.create(
      "ToolsToggleConfidential",
      "toggleConfidential",
      MenuItemLocation.Tools
    );
    await joplin.views.menuItems.create(
      "NoteListContextMenuToggleConfidential",
      "toggleConfidential",
      MenuItemLocation.NoteListContextMenu
    );
  }

  private async toggleConfidential() {
    const ids = await joplin.workspace.selectedNoteIds();
    if (ids.length > 0) {
      for (const noteId of ids) {
        const confidential = await joplin.data.userDataGet(
          ModelType.Note,
          noteId,
          "confidential"
        );

        let confidentialNew = true;
        if (confidential) {
          confidentialNew = false;
        }

        await joplin.data.userDataSet(
          ModelType.Note,
          noteId,
          "confidential",
          confidentialNew
        );

        this.log.verbose(
          "Toggle confidential of note " + noteId + " to " + confidential
        );
      }
    }
  }

  private async genItemTemplate(): Promise<void> {
    this.log.verbose("Func: genItemTemplate");

    switch (this.settings["layout"]) {
      case "layout1":
        this.settings["itemTemplate"] = await this.getItemTemplateLayout1();
        break;
      case "layout2":
        this.settings["itemTemplate"] = await this.getItemTemplateLayout2();
        break;
    }

    this.log.verbose(this.settings["itemTemplate"]);
  }

  private async getItemTemplateLayout1(): Promise<string> {
    this.log.verbose("Func: getItemTemplateLayout1");

    const title = `
      <div class="title"> 
        {{#note.is_todo}}<span class="checkbox"><input data-id="todoCheckboxCompleted" type="checkbox" {{#completed}}checked{{/completed}} /></span>{{/note.is_todo}}
        {{#note.isWatched}}<i class="watchedicon fa fa-share-square"></i>{{/note.isWatched}}
        <span>{{{noteTitle}}}</span>
      </div>
    `;

    let firstLine = "";
    if (this.settings["firstLine"] != "") {
      firstLine = '<p class="firstLine">{{{firstLine}}}</p>';
    }

    let lastLine = "";
    if (this.settings["lastLine"] != "") {
      lastLine = '<p class="lastLine">{{{lastLine}}}</p>';
    }

    return `
      <div class="content {{#item.selected}}-selected{{/item.selected}} {{#completed}}-completed{{/completed}}">
        ${title}
        ${firstLine}
        <p class="body"> 
          {{#thumbnail}}
            <img class="thumbnail" src="file://{{thumbnail}}"/>
          {{/thumbnail}}
          {{{noteTextLeft}}}
          {{#noteBody}}<span class="excerpt">{{noteBody}}</span>{{/noteBody}}
          {{{noteTextRight}}}
        </p>
        ${lastLine}
      </div>
    `;
  }

  private async getItemTemplateLayout2(): Promise<string> {
    this.log.verbose("Func: getItemTemplateLayout2");

    const title = `
      <div class="title"> 
        {{#note.is_todo}}<span class="checkbox"><input data-id="todoCheckboxCompleted" type="checkbox" {{#completed}}checked{{/completed}} /></span>{{/note.is_todo}}
        {{#note.isWatched}}<i class="watchedicon fa fa-share-square"></i>{{/note.isWatched}}
        <span>{{{noteTitle}}}</span>
      </div>
    `;

    let firstLine = "";
    if (this.settings["firstLine"] != "") {
      firstLine = '<p class="firstLine">{{{firstLine}}}</p>';
    }

    let lastLine = "";
    if (this.settings["lastLine"] != "") {
      lastLine = '<p class="lastLine">{{{lastLine}}}</p>';
    }

    return `
        <div class="content {{#item.selected}}-selected{{/item.selected}} {{#completed}}-completed{{/completed}}">
          {{#thumbnail}}
            <img class="thumbnail" src="file://{{thumbnail}}"/>
          {{/thumbnail}}
          ${title}
          ${firstLine}
          <p class="body">
            {{{noteTextLeft}}}
            {{#noteBody}}<span class="excerpt">{{noteBody}}</span>{{/noteBody}}
            {{{noteTextRight}}}
          </p>
          ${lastLine}
        </div>
    `;
  }

  private async getItemCss(): Promise<string> {
    const todoOpen =
      this.settings["todoDueColorOpen"].trim() != ""
        ? "color: " + this.settings["todoDueColorOpen"]
        : "color: var(--joplin-color-correct);";
    const todoNearDue =
      this.settings["todoDueColorNear"].trim() != ""
        ? "color: " + this.settings["todoDueColorNear"]
        : "color: var(--joplin-color-warn3);";
    const todoOverdue =
      this.settings["todoDueColorOverdue"].trim() != ""
        ? "color: " + this.settings["todoDueColorOverdue"]
        : "color: var(--joplin-color-error);";
    const todoDone =
      this.settings["todoDueColorDone"].trim() != ""
        ? "color: " + this.settings["todoDueColorDone"]
        : "color: var(--joplin-color4);";

    const thumbnailFloat =
      this.settings["thumbnail"] == "right" ? "float: right;" : "float: left;";

    const thumbnailMarginLayout1 =
      this.settings["thumbnail"] == "right"
        ? "margin: 3px 0px 3px 3px;"
        : "margin: 3px 3px 3px 0px;";

    const thumbnailMarginLayout2 =
      this.settings["thumbnail"] == "right"
        ? "margin: 0px 0px 0px 3px;"
        : "margin: 0px 3px 0px 0px;";

    const thumbnailMargin =
      this.settings["layout"] == "layout2"
        ? thumbnailMarginLayout2
        : thumbnailMarginLayout1;

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

      > .content .title {
          font-weight: bold;
          font-family: var(--joplin-font-family);
          font-size: var(--joplin-font-size);
          white-space: nowrap;
          display: flex;
          align-items: center;
          overflow: hidden;
      }

      > .content .checkbox {
        padding-right: 4px;
      }

      > .content .checkbox input {
        margin: 3px 3px 3px 0px;
      }

      > .content .watchedicon {
        padding-right: 4px;
        padding-left: 1px;
        letter-spacing: .03em;
      }

      > .content .excerpt {
        opacity: 0.7;
      }

      > .content .thumbnail {
        display: flex;
        max-width: ${this.settings["thumbnailSize"]}px;
        max-height: ${this.settings["thumbnailSize"]}px;
        ${thumbnailFloat}
        ${thumbnailMargin}
        border-radius: 5px;
      }

      > .content .date {
        color: var(--joplin-color4);
      }

      > .content > .firstLine {
        white-space: nowrap;
        overflow: hidden;
        margin-bottom: 2px;
      }

      > .content > .lastLine {
        white-space: nowrap;
        overflow: hidden;
        margin-bottom: 2px;
      }

      > .content .tags > .tag {
        border-radius: 1em;
        background: var(--joplin-divider-color);
        padding: 1px 5px;
        color: var(--joplin-color);
        font-family: var(--joplin-font-family);
        opacity: 0.7;
        font-size: 12px;
      }

      > .content.-selected {
          background-color: var(--joplin-selected-color);
      }

      > .content > .left {
        float:left;
        width: ${this.settings["thumbnailSize"]}px;
      }
      > .content > .right {
        margin-left: ${this.settings["thumbnailSize"] + 3}px;
      }

      > .content .todoopen {
        ${todoOpen}
      }

      > .content .todoneardue {
        ${todoNearDue}
      }

      > .content .todooverdue {
        ${todoOverdue}
      }

      > .content .tododone {
        ${todoDone}
      }
    `;
  }

  private async getNoteDateFormated(noteDate: any): Promise<string> {
    let date = new Date(noteDate);
    const now = new Date(Date.now());
    let dateString: string =
      moment(date.getTime()).format(this.settings["dateFormatJoplin"]) +
      " " +
      moment(date.getTime()).format(this.settings["timeFormatJoplin"]);

    if (
      moment(now.getTime()).diff(date.getTime(), "days") <=
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
    noteBody = noteBody.replace(/(\r\n|\n)/g, " ");
    noteBody = noteBody.replace(/\s+/g, " ");
    for (const word of noteBody.split(" ")) {
      if (bodyExcerpt.length + word.length > this.settings["bodyExcerpt"]) {
        break;
      }
      bodyExcerpt = bodyExcerpt + word + " ";
    }
    if (bodyExcerpt.length < noteBody.length) {
      bodyExcerpt = bodyExcerpt + "...";
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
    this.log.verbose("Func: registerRendererPreview");
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
        "note.user_created_time",
        "note.tags",
        "note.is_todo",
        "note.todo_due",
        "note.todo_completed",
        "note.isWatched",
        "note.title",
        "note.source_url",
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

  private async getDueDateColorClass(
    todo_due: number,
    todo_completed: number
  ): Promise<string> {
    const now = new Date();

    if (todo_due === 0 && todo_completed === 0) {
      // ToDo open no due date
      return "todoopen";
    } else if (todo_due === 0 && todo_completed !== 0) {
      // ToDo done no due date
      return "todoopen";
    } else if (
      todo_due > now.getTime() &&
      todo_completed === 0 &&
      this.settings["todoDueNearHours"] !== 0 &&
      todo_due - 3600 * this.settings["todoDueNearHours"] * 1000 < now.getTime()
    ) {
      // ToDo near due date
      return "todoneardue";
    } else if (todo_due > now.getTime() && todo_completed === 0) {
      // ToDo open in time
      return "todoopen";
    } else if (todo_due < now.getTime() && todo_completed === 0) {
      // ToDo open over time
      return "todooverdue";
    } else if (todo_due > todo_completed) {
      // ToDo done in time
      return "tododone";
    } else if (todo_due < todo_completed) {
      // ToDo done over time
      return "tododone";
    } else {
      return "";
    }
  }

  private async getFieldValue(
    field: string,
    props: any,
    confidential: boolean
  ): Promise<string> {
    let value = " ";
    switch (field.toLowerCase()) {
      case "createdtime":
        value = await this.getNoteDateFormated(props.note.user_created_time);
        value = '<span class="date">' + value + "</span>";
        break;
      case "date":
      case "updatedtime":
        value = await this.getNoteDateFormated(props.note.user_updated_time);
        value = '<span class="date">' + value + "</span>";
        break;
      case "tododate":
        if (props.note.todo_due == 0) {
          value = "";
        } else {
          const colorClass = await this.getDueDateColorClass(
            props.note.todo_due,
            props.note.todo_completed
          );

          if (props.note.todo_completed != 0) {
            value = await this.getNoteDateFormated(props.note.todo_completed);
          } else {
            value = await this.getNoteDateFormated(props.note.todo_due);
          }

          value = '<span class="' + colorClass + '">' + value + "</span>";
        }
        break;
      case "tododuedate":
        if (props.note.todo_due == 0) {
          value = "";
        } else {
          const colorClass = await this.getDueDateColorClass(
            props.note.todo_due,
            props.note.todo_completed
          );
          value = await this.getNoteDateFormated(props.note.todo_due);
          value = '<span class="' + colorClass + '">' + value + "</span>";
        }
        break;
      case "todocompleteddate":
        if (props.note.todo_completed == 0) {
          value = "";
        } else {
          const colorClass = await this.getDueDateColorClass(
            props.note.todo_due,
            props.note.todo_completed
          );
          value = await this.getNoteDateFormated(props.note.todo_completed);
          value = '<span class="' + colorClass + '">' + value + "</span>";
        }
        break;
      case "notetext":
        if (confidential) {
          value = "{{noteBody}}";
        } else {
          value = "{{noteBody}}";
        }
        break;
      case "url":
        value = '<span class="url">' + props.note.source_url + "</span>";
        break;
      case "tags":
        const tags = await this.getTags(props.note.tags);
        if (!confidential && tags.length > 0) {
          value =
            '<span class="tags"><span class="tag">' +
            tags.join('</span> <span class="tag">') +
            "</span></span>";
        } else {
          value = "";
        }
        break;
      default:
        value = props[field];
    }

    return value;
  }

  private async replaceFieldPlaceholder(
    text: string,
    noteFields: string[],
    confidential: boolean
  ): Promise<string> {
    // asyncStringReplace copied from https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
    const asyncStringReplace = async (
      str: string,
      regex: RegExp,
      aReplacer: any
    ) => {
      const substrs = [];
      let match;
      let i = 0;
      while ((match = regex.exec(str)) !== null) {
        substrs.push(str.slice(i, match.index));
        substrs.push(aReplacer(...match));
        i = regex.lastIndex;
      }
      substrs.push(str.slice(i));
      return (await Promise.all(substrs)).join("");
    };

    try {
      return await asyncStringReplace(
        text,
        /{{([^}]+)}}/g,
        async (match, groups) => {
          return await this.getFieldValue(groups, noteFields, confidential);
        }
      );
    } catch (error) {
      this.log.error(error.message);
      await this.showMsg("", error.message);
      throw error;
    }
  }

  private async getBodyLineParts(bodyLine: string): Promise<any> {
    let returnValue = {
      noteTextLeft: "",
      noteTextRight: "",
      noteText: false,
    };

    if (bodyLine.includes("{{noteText}}")) {
      let tmp = bodyLine.split("{{noteText}}");
      returnValue["noteTextLeft"] = tmp[0];
      returnValue["noteTextRight"] = tmp[1];
      returnValue["noteText"] = true;
    } else {
      returnValue["noteTextLeft"] = bodyLine;
    }
    return returnValue;
  }

  private async isNoteConfidential(
    noteId: string,
    tags: any
  ): Promise<boolean> {
    const confidential = await joplin.data.userDataGet(
      ModelType.Note,
      noteId,
      "confidential"
    );

    if (confidential) {
      return true;
    }

    if (this.settings["confidentialTags"].length > 0) {
      for (const tag of tags) {
        if (
          this.settings["confidentialTags"].indexOf(tag.title.toLowerCase()) !==
          -1
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private async onRenderNoteCall(props: any): Promise<any> {
    this.log.verbose("Func: onRenderNoteCall " + props.note.id);
    const start = performance.now();

    const completed =
      props.note.is_todo == 1 && props.note.todo_completed != 0 ? true : false;

    const confidential = await this.isNoteConfidential(
      props.note.id,
      props.note.tags
    );
    let noteLine = this.settings["noteLine"];
    let firstLine = this.settings["firstLine"];
    let lastLine = this.settings["lastLine"];
    let noteTextParts = await this.getBodyLineParts(noteLine);

    let noteTextLeft = await this.replaceFieldPlaceholder(
      noteTextParts["noteTextLeft"],
      props,
      confidential
    );
    let noteTextRight = await this.replaceFieldPlaceholder(
      noteTextParts["noteTextRight"],
      props,
      confidential
    );
    let noteBody = "";
    if (!confidential && noteTextParts["noteText"] == true) {
      noteBody = await this.getBody(props.note.body);
    } else if (confidential) {
      noteBody = i18n.__("confidentialNotetext");
    }

    firstLine = await this.replaceFieldPlaceholder(
      firstLine,
      props,
      confidential
    );
    lastLine = await this.replaceFieldPlaceholder(
      lastLine,
      props,
      confidential
    );

    let thumbnail = null;
    if (!confidential && this.settings["thumbnail"] != "no") {
      thumbnail = await this.getResourcePreview(props.note.id, props.note.body);
    }

    const stop = performance.now();
    const inSeconds = (stop - start) / 1000;
    const rounded = Number(inSeconds).toFixed(3);
    this.log.verbose(
      "onRenderNoteCall " + props.note.id + " time: " + rounded + "s"
    );

    return {
      ...props,
      noteBody: noteBody,
      noteTitle: props.note.titleHtml,
      noteDate: await this.getNoteDateFormated(props.note.user_updated_time),
      firstLine: firstLine,
      lastLine: lastLine,
      noteTextLeft: noteTextLeft,
      noteTextRight: noteTextRight,
      completed: completed,
      thumbnail: thumbnail,
    };
  }

  private async onChangeEvent(event: OnChangeEvent): Promise<void> {
    this.log.verbose("Func: onChangeEvent");
    this.log.verbose(event);
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
      this.log.verbose(`${title}: ${msg}`);
    } else {
      this.log.verbose(`${msg}`);
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

  private async getThumbnailFromCache(resource: any): Promise<string> {
    this.log.verbose("Get thumbnail " + resource.id + " from cache");

    const thumbnail = this.thumbnailCache[resource.id];
    if (thumbnail && thumbnail.updated_time == resource.updated_time) {
      this.log.verbose("Use cache for " + resource.id);
      return thumbnail.path;
    }
    return "";
  }

  private async storeThumbnailInCache(
    resource: any,
    thumbnailFilePath: string
  ): Promise<void> {
    this.log.verbose("Update cache for: " + resource.id);
    this.thumbnailCache[resource.id] = {
      path: thumbnailFilePath,
      updated_time: resource.updated_time,
    };
  }

  private async getResourceOrder(noteBody: string): Promise<any> {
    const regExresourceId = /:\/(?<resourceId>[\da-z]{32})/g;
    let resourceOrder = [];
    let regExMatch = null;
    while ((regExMatch = regExresourceId.exec(noteBody)) != null) {
      resourceOrder.push(regExMatch["groups"]["resourceId"]);
    }
    return resourceOrder;
  }

  private async getResourcePreview(
    noteId: string,
    noteBody: string
  ): Promise<string> {
    this.log.verbose("Func: getResourcePreview" + noteId);

    const resourceOrder = await this.getResourceOrder(noteBody);

    const resources = await joplin.data.get(["notes", noteId, "resources"], {
      fields: "id, title, mime, filename, updated_time",
    });

    if (resourceOrder.length == 0) {
      return "";
    }

    for (const check of resourceOrder) {
      for (const resourceItem of resources.items) {
        if (check != resourceItem.id) {
          continue;
        }
        this.log.verbose(
          "Use resource " + resourceItem.id + " for note " + noteId
        );

        let thumbnailPath = await this.getThumbnailFromCache(resourceItem);
        if (thumbnailPath != "") {
          return thumbnailPath;
        }

        let thumbnailFilePath = path.join(
          this.dataDir,
          "thumb_" + resourceItem.id + ".jpg"
        );

        if (
          resourceItem.mime.includes("image/png") ||
          resourceItem.mime.includes("image/jpeg")
        ) {
          thumbnailPath = await this.genResourcePreviewImage(
            resourceItem,
            thumbnailFilePath
          );
        }

        if (thumbnailPath == "") {
          continue;
        }

        await this.storeThumbnailInCache(resourceItem, thumbnailPath);

        return thumbnailPath;
      }
    }
  }

  private async genResourcePreviewImage(
    resource: any,
    filePath: string
  ): Promise<string> {
    this.log.verbose("Func: genResourcePreviewImage " + resource.id);
    try {
      const imageHandle = await joplin.imaging.createFromResource(resource.id);
      let processImageHandle = imageHandle;

      if (this.settings["thumbnailSquare"]) {
        const imageSize = await joplin.imaging.getSize(imageHandle);

        let cropSettings = {
          x: 0,
          y: 0,
          size: 0,
        };

        if (imageSize.width > imageSize.height) {
          cropSettings["size"] = imageSize.height;
          cropSettings["x"] = Math.round(
            imageSize.width / 2 - cropSettings["size"] / 2
          );
        } else {
          cropSettings["size"] = imageSize.width;
          cropSettings["y"] = Math.round(
            imageSize.height / 2 - cropSettings["size"] / 2
          );
        }

        processImageHandle = await joplin.imaging.crop(imageHandle, {
          height: cropSettings["size"],
          width: cropSettings["size"],
          x: cropSettings["x"],
          y: cropSettings["y"],
        });
      }

      const resizedImageHandle = await joplin.imaging.resize(
        processImageHandle,
        {
          width:
            this.settings["thumbnailSize"] *
            2 *
            (this.settings["joplinZoome"] / 100),
        }
      );

      await joplin.imaging.toJpgFile(resizedImageHandle, filePath, 90);
      await joplin.imaging.free(imageHandle);
      await joplin.imaging.free(resizedImageHandle);
    } catch (e) {
      if (e.message.includes("Could not load resource path")) {
        this.log.warn("Resource file " + resource.id + " is not available");
      } else {
        this.log.error("Func: genResourcePreviewImage " + resource.id);
        this.log.error(e.message);
      }

      return "";
    }

    return filePath;
  }

  private async cleanResourcePreview(): Promise<void> {
    this.log.verbose("Func: cleanResourcePreview");

    const files = fs
      .readdirSync(this.dataDir, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
      .reverse();

    for (const file of files) {
      if (file.includes("thumb_") && file.includes(".jpg")) {
        try {
          fs.removeSync(path.join(this.dataDir, file));
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
