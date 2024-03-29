type ThumbnailCache = Record<string, Thumbnail>;

type Thumbnail = {
  path: string;
  updated_time: number;
};

type Settings = {
  itemTemplate: string;
  layout: string;
  itemSizeHeight: number;
  daysHumanizeDate: number;
  bodyExcerpt: number;
  firstLine: string;
  noteLine: string;
  lastLine: string;
  dateFormatJoplin: string;
  timeFormatJoplin: string;
  thumbnail: string;
  thumbnailSize: number;
  thumbnailSquare: boolean;
  todoDueColorOpen: string;
  todoDueNearHours: number;
  todoDueColorNear: string;
  todoDueColorOverdue: string;
  todoDueColorDone: string;
  joplinZoome: number;
  confidentialTags: string[];
};

export { ThumbnailCache, Thumbnail, Settings };
