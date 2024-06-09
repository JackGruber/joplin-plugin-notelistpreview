import joplin from "api";
import { SettingItemType } from "api/types";
import { i18n } from "./notelist";

export namespace settings {
  export async function register(logFile: string) {
    await joplin.settings.registerSection("noteListPreview", {
      label: "Note list (Preview)",
      iconName: "far fa-list-alt",
    });

    const availableVariables = [
      "{{updatedTime}}",
      "{{createdTime}}",
      "{{tags}}",
      "{{url}}",
      "{{todoDate}}",
      "{{noteText}}",
    ];

    await joplin.settings.registerSettings({
      layout: {
        value: "layout1",
        type: SettingItemType.String,
        section: "noteListPreview",
        isEnum: true,
        public: true,
        options: {
          layout1: i18n.__("settings.layout.values.layout1"),
          layout2: i18n.__("settings.layout.values.layout2"),
        },
        label: i18n.__("settings.layout.label"),
        description: i18n.__("settings.layout.description"),
      },
      firstLine: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        label: i18n.__("settings.firstLine.label"),
        description: i18n.__(
          "settings.firstLine.description",
          availableVariables.join(", ")
        ),
      },
      noteLine: {
        value: "{{updatedTime}} {{noteText}}",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        label: i18n.__("settings.noteLine.label"),
        description: i18n.__(
          "settings.noteLine.description",
          availableVariables.join(", ")
        ),
      },
      lastLine: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        label: i18n.__("settings.lastLine.label"),
        description: i18n.__(
          "settings.lastLine.description",
          availableVariables.join(", ")
        ),
      },
      thumbnail: {
        value: "no",
        type: SettingItemType.String,
        section: "noteListPreview",
        isEnum: true,
        public: true,
        options: {
          no: i18n.__("settings.thumbnail.values.no"),
          left: i18n.__("settings.thumbnail.values.left"),
          right: i18n.__("settings.thumbnail.values.right"),
        },
        label: i18n.__("settings.thumbnail.label"),
        description: i18n.__("settings.thumbnail.description"),
      },
      daysHumanizeDate: {
        value: 7,
        minimum: -1,
        maximum: 999,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        label: i18n.__("settings.daysHumanizeDate.label"),
        description: i18n.__("settings.daysHumanizeDate.description"),
      },
      itemSizeHeight: {
        value: 100,
        minimum: 1,
        maximum: 999,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.itemSizeHeight.label"),
        description: i18n.__("settings.itemSizeHeight.description"),
      },
      bodyExcerpt: {
        value: 150,
        minimum: 1,
        maximum: 9999,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.bodyExcerpt.label"),
        description: i18n.__("settings.bodyExcerpt.description"),
      },
      thumbnailSize: {
        value: 70,
        minimum: 1,
        maximum: 200,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.thumbnailSize.label"),
        description: i18n.__("settings.thumbnailSize.description"),
      },
      thumbnailSquare: {
        value: false,
        type: SettingItemType.Bool,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.thumbnailSquare.label"),
        description: i18n.__("settings.thumbnailSquare.description"),
      },
      todoDueColorOpen: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.todoDueColorOpen.label"),
        description: i18n.__("settings.todoDueColorOpen.description"),
      },
      todoDueNearHours: {
        value: 48,
        minimum: 1,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.todoDueNearHours.label"),
        description: i18n.__("settings.todoDueNearHours.description"),
      },
      todoDueColorNear: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.todoDueColorNear.label"),
        description: i18n.__("settings.todoDueColorNear.description"),
      },
      todoDueColorOverdue: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.todoDueColorOverdue.label"),
        description: i18n.__("settings.todoDueColorOverdue.description"),
      },
      todoDueColorDone: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.todoDueColorDone.label"),
        description: i18n.__("settings.todoDueColorDone.description"),
      },
      confidentialTags: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.confidentialTags.label"),
        description: i18n.__("settings.confidentialTags.description"),
      },
      fileLogLevel: {
        value: "warn",
        type: SettingItemType.String,
        section: "noteListPreview",
        isEnum: true,
        public: true,
        advanced: true,
        label: i18n.__("settings.fileLogLevel.label"),
        description: i18n.__("settings.fileLogLevel.description", logFile),
        options: {
          false: "Off",
          verbose: "Verbose",
          info: "Info",
          warn: "Warning",
          error: "Error",
        },
      },
      fileCacheDays: {
        value: 30,
        minimum: 0,
        type: SettingItemType.Int,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.fileCacheDays.label"),
        description: i18n.__("settings.fileCacheDays.description"),
      },
    });
  }
}
