const CARTO_KEY =
  import.meta.env.VITE_CARTO_API_KEY || "cb1_4e0g_1_dca65906abf9db9a020bd36c";

export const CARTO_VOYAGER_TILE_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${
  CARTO_KEY ? `?key=${CARTO_KEY}` : ""
}`;
