import joplin from "api";
import { SettingItemType } from "api/types";
import { i18n } from "./notelist";

export namespace settings {
  export async function register() {
    await joplin.settings.registerSection("noteListPreview", {
      label: "Note list preview",
      iconName: "far fa-list-alt",
    });

    const availableVariables = [
      "{{updatedTime}}",
      "{{createdTime}}",
      "{{tags}}",
      "{{url}}",
    ];

    await joplin.settings.registerSettings({
      datePositionInline: {
        value: "begin",
        type: SettingItemType.String,
        section: "noteListPreview",
        isEnum: true,
        public: true,
        options: {
          no: i18n.__("settings.datePositionInline.values.no"),
          begin: i18n.__("settings.datePositionInline.values.begin"),
          end: i18n.__("settings.datePositionInline.values.end"),
        },
        label: i18n.__("settings.datePositionInline.label"),
        description: i18n.__("settings.datePositionInline.description"),
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
      firstLine: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.firstLine.label"),
        description: i18n.__(
          "settings.firstLine.description",
          availableVariables.join(", ")
        ),
      },
      lastLine: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.lastLine.label"),
        description: i18n.__(
          "settings.lastLine.description",
          availableVariables.join(", ")
        ),
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
        value: 75,
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
      cssFirstLineOverwrite: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.cssFirstLineOverwrite.label"),
        description: i18n.__(
          "settings.cssFirstLineOverwrite.description",
          ".firstLine"
        ),
      },
      cssLastLineOverwrite: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.cssLastLineOverwrite.label"),
        description: i18n.__(
          "settings.cssLastLineOverwrite.description",
          ".lastLine"
        ),
      },
      cssDateOverwrite: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.cssDateOverwrite.label"),
        description: i18n.__("settings.cssDateOverwrite.description", ".date"),
      },
      cssTagOverwrite: {
        value: "",
        type: SettingItemType.String,
        section: "noteListPreview",
        public: true,
        advanced: true,
        label: i18n.__("settings.cssTagOverwrite.label"),
        description: i18n.__("settings.cssTagOverwrite.description", ".tags"),
      },
      fileLogLevel: {
        value: "warn",
        type: SettingItemType.String,
        section: "noteListPreview",
        isEnum: true,
        public: true,
        advanced: true,
        label: i18n.__("settings.fileLogLevel.label"),
        description: i18n.__("settings.fileLogLevel.description"),
        options: {
          false: "Off",
          verbose: "Verbose",
          info: "Info",
          warn: "Warning",
          error: "Error",
        },
      },
    });
  }
}
