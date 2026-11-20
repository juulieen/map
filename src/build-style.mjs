// Génère site/styles/juulieen.json : le style MapLibre complet du thème,
// branché sur les fichiers servis par map.juulieen.fr.
//   node src/build-style.mjs [URL de base, défaut https://map.juulieen.fr]
import { mkdirSync, writeFileSync } from "node:fs";
import { juulieenLayers } from "./flavor.mjs";

const BASE = (process.argv[2] || "https://map.juulieen.fr").replace(/\/$/, "");

const style = {
  version: 8,
  name: "juulieen",
  glyphs: `${BASE}/fonts/{fontstack}/{range}.pbf`,
  sprite: `${BASE}/sprites/v4/light`,
  sources: {
    protomaps: {
      type: "vector",
      url: `pmtiles://${BASE}/france.pmtiles`,
      attribution: '<a href="https://openstreetmap.org/copyright">© OpenStreetMap</a>',
    },
    // Altitudes Mapterhorn (codage Terrarium, tuiles webp de 512 px) : planète
    // jusqu'au zoom 6, Europe de l'Ouest du 7 au 12 (~13 m par point), France
    // du 13 au 15 (~1,7 m). Tuiles absentes : voir site/overzoom.js.
    relief: {
      type: "raster-dem",
      url: `pmtiles://${BASE}/relief.pmtiles`,
      encoding: "terrarium",
      tileSize: 512,
      attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
    },
  },
  layers: juulieenLayers("protomaps", "fr"),
};

const out = new URL("../site/styles/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("juulieen.json", out), JSON.stringify(style));
console.log(`site/styles/juulieen.json : ${style.layers.length} couches, base ${BASE}`);
