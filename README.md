# map.juulieen.fr

Thème **juulieen** pour les tuiles vectorielles [Protomaps](https://protomaps.com)
et page d'exploration de [map.juulieen.fr](https://map.juulieen.fr).

- Vue large : terre crème, forêts vertes discrètes, relief.
- Au zoom : le rendu Protomaps, forêts adoucies, routes bordées de gris chaud,
  étiquettes à contour crème pour rester lisibles sur les forêts.

## Utiliser le style

```js
import { Protocol } from "pmtiles";
maplibregl.addProtocol("pmtiles", new Protocol().tile);
new maplibregl.Map({ container: "map", style: "https://map.juulieen.fr/styles/juulieen.json" });
```

Le style pointe vers les fichiers servis par `map.juulieen.fr` (CORS ouvert) :
`france.pmtiles` (planète du zoom 0 au 6, Europe de l'Ouest du zoom 7 au 15),
les polices et les icônes Protomaps. Le relief vient des tuiles d'altitude
ouvertes Terrarium (AWS Open Data).

## Thème seul, avec vos propres tuiles

`src/flavor.mjs` exporte `flavor` (les couleurs, à passer à
`@protomaps/basemaps`) et `juulieenLayers(source, lang)` (les couches, avec les
réglages de zoom et l'ombrage du relief, qui attend une source `raster-dem`
nommée `relief`).

## Régénérer le style

```bash
npm install
npm run build        # écrit site/styles/juulieen.json
```

`site/` est publié tel quel à la racine de `map.juulieen.fr`.

## Licence et données

Code sous licence BSD-3-Clause (voir `LICENSE`), dérivé de
[`@protomaps/basemaps`](https://github.com/protomaps/basemaps) (BSD-3-Clause).
Données cartographiques © [OpenStreetMap](https://www.openstreetmap.org/copyright)
(ODbL), relief © Mapzen Terrarium.
