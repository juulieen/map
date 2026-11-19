// Thème « juulieen » pour les tuiles Protomaps : base `light`, terre crème,
// forêts vertes en vue large, rendu Protomaps au zoom, étiquettes lisibles.
import { layers as basemapLayers, namedFlavor } from "@protomaps/basemaps";

const base = namedFlavor("light");

// Contours de routes : le gris très clair d'origine (#e0e0e0) se perdait sur
// le fond crème ; un gris chaud les détache au zoom.
const casings = Object.fromEntries(
  Object.keys(base)
    .filter((k) => k.endsWith("_casing") || k.includes("_casing_"))
    .map((k) => [k, "#cbc2b3"]),
);

export const flavor = {
  ...base,
  ...casings,
  background: "#ece6da",
  earth: "#f2eee4",
  water: "#a9d3ea",
  landcover: {
    forest: "#b9d9a6",
    grassland: "#d8e9c0",
    farmland: "#e7eecf",
    scrub: "#dce8c3",
    barren: "#efe4c8",
    urban_area: "#e2d9cf",
    glacier: "#ffffff",
  },
  wood_a: "#cfe3c4",
  wood_b: "#86c56f",
  park_a: "#d3e6c8",
  park_b: "#8fcb7e",
  // Broussailles, prairies, pelouses : le vert menthe d'origine (#99d2bb)
  // tirait sur le turquoise. Zones industrielles : gris chaud, pas bleuté.
  scrub_a: "#dbe7c9",
  scrub_b: "#b4d39a",
  industrial: "#e0d9d0",
  zoo: "#d6e3c6",
  // Étiquettes : contour crème (le gris #e0e0e0 se confondait avec le fond)
  // et textes plus foncés, lieux-dits compris.
  city_label: "#3b3833",
  city_label_halo: "#faf8f2",
  subplace_label: "#6a645b",
  subplace_label_halo: "#faf8f2",
  state_label: "#8a8377",
  state_label_halo: "#faf8f2",
  country_label: "#857e72",
  address_label: "#6a645b",
  address_label_halo: "#faf8f2",
  roads_label_minor: "#6e665e",
  roads_label_minor_halo: "#faf8f2",
  roads_label_major: "#6a625a",
  roads_label_major_halo: "#faf8f2",
};

// Forêts plus douces à partir du zoom 12 (le vert vif faisait des aplats).
const mutedFlavor = { ...flavor, wood_b: "#a6cd95", park_b: "#aacf9b" };

const RELIEF = {
  id: "relief",
  type: "hillshade",
  source: "relief",
  paint: {
    "hillshade-exaggeration": 0.45,
    "hillshade-shadow-color": "#5a5a52",
    "hillshade-highlight-color": "#ffffff",
    "hillshade-accent-color": "#8a8a7a",
    "hillshade-illumination-direction": 315,
  },
};

// Couches du thème pour une source vectorielle Protomaps nommée `source`, avec
// l'ombrage du relief (source raster-dem `relief`) glissé sous les routes.
export function juulieenLayers(source = "protomaps", lang = "fr") {
  const layers = basemapLayers(source, flavor, { lang });
  const muted = basemapLayers(source, mutedFlavor, { lang }).find((l) => l.id === "landuse_park").paint["fill-color"];
  for (const l of layers) {
    // Contour des étiquettes un peu plus épais : elles passent sur les forêts
    // et le relief.
    if (l.type === "symbol" && l.paint?.["text-halo-width"] !== undefined) l.paint["text-halo-width"] = 1.6;
    // Protomaps garde l'occupation du sol grossière jusqu'au zoom 7 : ses
    // grandes taches ne servent ici qu'au globe et à la vue très éloignée.
    if (l.id === "landcover") l.paint["fill-opacity"] = ["interpolate", ["linear"], ["zoom"], 3, 0.8, 5.5, 0];
    if (l.id === "landuse_park") {
      // Les vraies forêts dès la vue large, discrètes ; creux aux zooms 7-8
      // (semis de petits bois) ; plafonnées à 70 % au zoom.
      l.paint["fill-opacity"] = ["interpolate", ["linear"], ["zoom"], 4, 0.35, 6, 0.45, 7, 0.36, 8, 0.38, 9, 0.6, 11, 0.7];
      l.paint["fill-color"] = ["interpolate", ["linear"], ["zoom"], 10, l.paint["fill-color"], 12, muted];
    }
  }
  const at = layers.findIndex((l) => l.id.startsWith("roads_tunnels"));
  return [...layers.slice(0, at), RELIEF, ...layers.slice(at)];
}
