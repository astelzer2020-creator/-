/**
 * חומרים משותפים + טקסטורות פרוצדורליות (Canvas) — בלי נכסים חיצוניים.
 */
import * as THREE from 'three';

function canvasTexture(size, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function woodTexture() {
  return canvasTexture(256, (ctx, s) => {
    ctx.fillStyle = '#c8a97c';
    ctx.fillRect(0, 0, s, s);
    for (let p = 0; p < 8; p++) {
      const y = (s / 8) * p;
      const shade = 190 + Math.round(28 * Math.sin(p * 3.7));
      ctx.fillStyle = `rgb(${shade},${shade - 42},${shade - 85})`;
      ctx.fillRect(0, y + 1, s, s / 8 - 2);
      ctx.strokeStyle = 'rgba(90,60,30,0.35)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
      // סיבי עץ עדינים
      ctx.strokeStyle = 'rgba(120,85,45,0.18)';
      for (let g = 0; g < 5; g++) {
        const gy = y + 3 + g * (s / 44);
        ctx.beginPath(); ctx.moveTo(0, gy);
        for (let x = 0; x <= s; x += 16) ctx.lineTo(x, gy + Math.sin((x + p * 31 + g * 17) * 0.05) * 1.5);
        ctx.stroke();
      }
    }
  }, [3, 3]);
}

function tileTexture() {
  return canvasTexture(256, (ctx, s) => {
    ctx.fillStyle = '#d7d9d4';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#b3b6b0';
    ctx.lineWidth = 3;
    const n = 4;
    for (let i = 0; i <= n; i++) {
      ctx.beginPath(); ctx.moveTo((s / n) * i, 0); ctx.lineTo((s / n) * i, s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (s / n) * i); ctx.lineTo(s, (s / n) * i); ctx.stroke();
    }
    for (let i = 0; i < n * n; i++) {
      const x = (i % n) * (s / n), y = Math.floor(i / n) * (s / n);
      ctx.fillStyle = `rgba(120,124,118,${0.05 + (i * 7 % 10) / 90})`;
      ctx.fillRect(x + 2, y + 2, s / n - 4, s / n - 4);
    }
  }, [4, 4]);
}

function plasterTexture() {
  return canvasTexture(128, (ctx, s) => {
    ctx.fillStyle = '#e9e6df';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      const v = 222 + ((i * 37) % 20);
      ctx.fillStyle = `rgba(${v},${v - 2},${v - 8},0.5)`;
      ctx.fillRect((i * 53) % s, (i * 29) % s, 2, 2);
    }
  }, [4, 4]);
}

function grassTexture() {
  return canvasTexture(128, (ctx, s) => {
    ctx.fillStyle = '#5c7f43';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 600; i++) {
      const g = 100 + ((i * 31) % 70);
      ctx.fillStyle = `rgba(${g - 55},${g},${g - 62},0.55)`;
      ctx.fillRect((i * 47) % s, (i * 71) % s, 2, 3);
    }
  }, [24, 24]);
}

export function createMaterials() {
  const std = (params) => new THREE.MeshStandardMaterial(params);
  const M = {
    extWall: std({ color: 0xded8cc, roughness: 0.92, map: plasterTexture() }),
    intWall: std({ color: 0xf0ede6, roughness: 0.95 }),
    slab: std({ color: 0xefece5, roughness: 0.95 }),
    stone: std({ color: 0xb9b4a8, roughness: 0.85 }),
    floorWood: std({ color: 0xffffff, roughness: 0.55, map: woodTexture() }),
    floorTile: std({ color: 0xffffff, roughness: 0.35, map: tileTexture() }),
    frame: std({ color: 0x3a3f46, roughness: 0.5, metalness: 0.4 }),
    glass: std({ color: 0xcfe6ee, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.22, side: THREE.DoubleSide, emissive: 0xffdf9e, emissiveIntensity: 0 }),
    roofFlat: std({ color: 0x8a8578, roughness: 0.95 }),
    metal: std({ color: 0x6a7076, roughness: 0.35, metalness: 0.75 }),
    woodDark: std({ color: 0x5d4632, roughness: 0.75 }),
    doorLeaf: std({ color: 0xf4f1ea, roughness: 0.6 }),
    woodLight: std({ color: 0xc9a878, roughness: 0.7 }),
    fabric: std({ color: 0xcfc7ba, roughness: 1 }),
    fabricDark: std({ color: 0x707a82, roughness: 1 }),
    rug: std({ color: 0xb9aFA0, roughness: 1 }),
    kcab: std({ color: 0x4e5a52, roughness: 0.6 }),
    kisland: std({ color: 0x3d4640, roughness: 0.6 }),
    marble: std({ color: 0xe8e6e1, roughness: 0.25 }),
    ceramic: std({ color: 0xf4f4f2, roughness: 0.2 }),
    mirror: std({ color: 0xd0dde4, roughness: 0.05, metalness: 0.9 }),
    tv: std({ color: 0x14161a, roughness: 0.3, metalness: 0.2 }),
    pot: std({ color: 0x8d6a52, roughness: 0.9 }),
    plant: std({ color: 0x4a7040, roughness: 0.95 }),
    lampshade: std({ color: 0xf3e8d2, roughness: 0.8, emissive: 0xffdf9e, emissiveIntensity: 0 }),
    bedframe: std({ color: 0x8a7358, roughness: 0.8 }),
    bedding: std({ color: 0xdcd6cc, roughness: 1 }),
    bedding2: std({ color: 0x9fb3c8, roughness: 1 }),
    bedding3: std({ color: 0xc9b7a5, roughness: 1 }),
    pillow: std({ color: 0xf1ede6, roughness: 1 }),
    shower: std({ color: 0xdadedf, roughness: 0.3 }),
    bathwater: std({ color: 0xbcd8dd, roughness: 0.1, transparent: true, opacity: 0.8 }),
    art: std({ color: 0x9a8f7f, roughness: 0.9 }),
    grass: std({ color: 0xffffff, roughness: 1, map: grassTexture() }),
    path: std({ color: 0xb6b0a2, roughness: 0.9 }),
    trunk: std({ color: 0x5c4632, roughness: 1 }),
    leaves: std({ color: 0x4d7a3e, roughness: 0.95 }),
    fence: std({ color: 0x7c828a, roughness: 0.6, metalness: 0.4 }),
  };
  return M;
}

export function disposeMaterials(M) {
  for (const m of Object.values(M)) {
    if (m.map) m.map.dispose();
    m.dispose();
  }
}
