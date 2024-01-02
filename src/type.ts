type ThumbnailCache = Record<string, Thumbnail>;

type Thumbnail = {
  path: string;
  updated_time: number;
};

export { ThumbnailCache, Thumbnail };
