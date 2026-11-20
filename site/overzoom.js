// Relief au-delà de sa couverture. relief.pmtiles va jusqu'au zoom 15 en
// France seulement (zoom 12 ailleurs en Europe de l'Ouest, 6 sur le reste de
// la planète). Pour une tuile raster absente, pmtiles répond `data: null` et
// MapLibre la laisse vide pour de bon, sans se rabattre sur la tuile parente.
// Ce protocole agrandit donc la plus proche tuile ancêtre présente, en
// interpolant les altitudes (interpoler les couleurs Terrarium fausserait les
// sauts de canal vert).
//
//   const protocol = new pmtiles.Protocol();
//   maplibregl.addProtocol("pmtiles", reliefOverzoom(protocol, "https://map.juulieen.fr/relief.pmtiles"));
//
// Même code, typé, dans le site du club (RunEvent86, frontend/src/scripts/basemap.ts).
function reliefOverzoom(protocol, reliefUrl) {
  let relief = protocol.get(reliefUrl);
  if (!relief) protocol.add((relief = new pmtiles.PMTiles(reliefUrl)));
  const TILE_URL = /^pmtiles:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)$/;

  // Interpolation bicubique (Catmull-Rom) : en bilinéaire, les pentes changent
  // d'un coup à chaque pixel source et l'ombrage fait des facettes carrées.
  async function upscale(data, dz, ox, oy) {
    const image = await createImageBitmap(new Blob([data]), { premultiplyAlpha: "none", colorSpaceConversion: "none" });
    const size = image.width;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const src = ctx.getImageData(0, 0, size, size).data;
    const height = new Float32Array(size * size); // altitude + 32768
    for (let p = 0; p < height.length; p++) height[p] = src[p * 4] * 256 + src[p * 4 + 1] + src[p * 4 + 2] / 256;

    // Pour chaque ligne / colonne de sortie : 4 indices source et leurs poids.
    const span = size / (1 << dz); // côté du carré source, en pixels
    const taps = (offset) => {
      const index = new Int32Array(size * 4);
      const weight = new Float32Array(size * 4);
      for (let o = 0; o < size; o++) {
        const f = offset * span + ((o + 0.5) * span) / size - 0.5;
        const i = Math.floor(f);
        const t = f - i;
        const w = [(-t * t * t + 2 * t * t - t) / 2, (3 * t * t * t - 5 * t * t + 2) / 2, (-3 * t * t * t + 4 * t * t + t) / 2, (t * t * t - t * t) / 2];
        for (let n = 0; n < 4; n++) {
          index[o * 4 + n] = Math.min(size - 1, Math.max(0, i - 1 + n));
          weight[o * 4 + n] = w[n];
        }
      }
      return { index, weight };
    };
    const cols = taps(ox);
    const rows = taps(oy);

    const out = ctx.createImageData(size, size);
    for (let v = 0; v < size; v++) {
      for (let u = 0; u < size; u++) {
        let h = 0;
        for (let m = 0; m < 4; m++) {
          const row = rows.index[v * 4 + m] * size;
          let line = 0;
          for (let n = 0; n < 4; n++) line += cols.weight[u * 4 + n] * height[row + cols.index[u * 4 + n]];
          h += rows.weight[v * 4 + m] * line;
        }
        h = Math.max(0, h);
        const k = (v * size + u) * 4;
        out.data[k] = h >> 8;
        out.data[k + 1] = h & 255;
        out.data[k + 2] = (h % 1) * 256;
        out.data[k + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    return (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer();
  }

  return async (params, abort) => {
    const res = await protocol.tilev4(params, abort);
    const tile = res.data === null && TILE_URL.exec(params.url);
    if (!tile || tile[1] !== reliefUrl) return res;
    const [z, x, y] = [+tile[2], +tile[3], +tile[4]];
    for (let dz = 1; dz <= z; dz++) {
      const parent = await relief.getZxy(z - dz, x >> dz, y >> dz, abort.signal);
      if (parent) return { data: await upscale(parent.data, dz, x & ((1 << dz) - 1), y & ((1 << dz) - 1)) };
    }
    return res;
  };
}
