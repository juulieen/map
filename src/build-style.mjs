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
    // Altitudes ouvertes (Terrarium, AWS Open Data), sans clé.
    relief: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 12,
      attribution: "Relief : Mapzen Terrarium",
    },
  },
  layers: juulieenLayers("protomaps", "fr"),
};

const out = new URL("../site/styles/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("juulieen.json", out), JSON.stringify(style));
console.log(`site/styles/juulieen.json : ${style.layers.length} couches, base ${BASE}`);
