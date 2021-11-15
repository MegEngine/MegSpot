import path from 'path';

export const DELIMITER = path.sep;
export const DIRECTION_LEFT = 'direction_left';
export const DIRECTION_RIGHT = 'direction_right';
export const DIRECTION_BOTTOM = 'direction_bottom';
export const DIRECTION_TOP = 'direction_top';

export const LAYOUT_1X1 = '1x1';
export const LAYOUT_2X1 = '2x1';
export const LAYOUT_3X1 = '3x1';
export const LAYOUT_4X1 = '4x1';
export const LAYOUT_2X2 = '2x2';
export const LAYOUT_3X2 = '3x2';

export const SCALE_CONSTANTS = 1 / 6;
export const DRAG_CONSTANTS = 1 / 4;

export const VIEWER_DEFAULT_CMD_TEMPLATE =
  '/usr/local/bin/python3 ${viewer} ${config}';
export const VIEWER_DEFAULT_OUTPUT_PATH = '${viewerPath}';

export const NO_CACHE_FILE_PROTOCOL = 'no-cache-file';
