# map.juulieen.fr

Thème **juulieen** pour les tuiles vectorielles [Protomaps](https://protomaps.com)
et page d'exploration de [map.juulieen.fr](https://map.juulieen.fr).

- Vue large : terre crème, forêts vertes discrètes, relief.
- Au zoom : le rendu Protomaps, forêts adoucies, routes bordées de gris chaud,
  étiquettes à contour crème pour rester lisibles sur les forêts.

## Utiliser le style

```html
<script src="https://unpkg.com/pmtiles@4.5.0/dist/pmtiles.js"></script>
<script src="https://map.juulieen.fr/overzoom.js"></script>
<script>
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", reliefOverzoom(protocol, "https://map.juulieen.fr/relief.pmtiles"));
  new maplibregl.Map({ container: "map", style: "https://map.juulieen.fr/styles/juulieen.json" });
</script>
```

Le style pointe vers les fichiers servis par `map.juulieen.fr` (CORS ouvert) :
`france.pmtiles` (planète du zoom 0 au 6, Europe de l'Ouest du zoom 7 au 15),
les polices et les icônes Protomaps, et `relief.pmtiles`, les altitudes
[Mapterhorn](https://mapterhorn.com) (codage Terrarium) : planète du zoom 0 au
6, Europe de l'Ouest du 7 au 12 (environ 13 m par point), France du 13 au 15
(environ 1,7 m par point, relevés IGN).

`reliefOverzoom` (`site/overzoom.js`) comble les tuiles de relief absentes
(hors de France au-delà du zoom 12) en agrandissant la tuile ancêtre la plus
proche. Avec le seul `new Protocol().tile`, MapLibre laisse ces tuiles vides :
pas de relief en Espagne ou en Suisse au-delà du zoom 12.

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
(ODbL), relief © [Mapterhorn](https://mapterhorn.com/attribution).
