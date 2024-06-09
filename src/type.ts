type ThumbnailCache = Record<string, Thumbnail>;

type Thumbnail = {
  path: string;
  updated_time: number;
  lastAccess: number;
  accessCount: number;
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
  fileCacheDays: number;
};

export { ThumbnailCache, Thumbnail, Settings };
