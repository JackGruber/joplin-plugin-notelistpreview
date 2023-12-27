import joplin from "api";
import { SettingItemType } from "api/types";
import { i18n } from "./notelist";

export namespace settings {
  export async function register() {
    await joplin.settings.registerSection("noteListPreview", {
      label: "Notel ist preview",
      iconName: "far fa-list-alt",
    });

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
        firstLine: {
          value: "",
          type: SettingItemType.String,
          section: "noteListPreview",
          public: true,
          advanced: true,
          label: i18n.__("settings.firstLine.label"),
          description: i18n.__("settings.firstLine.description", {
            field_tags: "{{tags}}",
            field_date: "{{date}}",
          }),
        },
        lastLine: {
          value: "",
          type: SettingItemType.String,
          section: "noteListPreview",
          public: true,
          advanced: true,
          label: i18n.__("settings.lastLine.label"),
          description: i18n.__("settings.lastLine.description", {
            field_tags: "{{tags}}",
            field_date: "{{date}}",
          }),
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
          value: 130,
          minimum: 1,
          maximum: 9999,
          type: SettingItemType.Int,
          section: "noteListPreview",
          public: true,
          advanced: true,
          label: i18n.__("settings.bodyExcerpt.label"),
          description: i18n.__("settings.bodyExcerpt.description"),
      },
    });
  }
}
