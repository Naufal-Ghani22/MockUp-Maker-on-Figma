// Mockup HP iPhone — bungkus frame layar terpilih menjadi mockup iPhone 15/16.
// Frame asli tidak diubah; plugin membuat salinan (atau instance) di dalam bingkai HP.

figma.showUI(__html__, { width: 320, height: 600, themeColors: true });

// Ukuran layar dalam pt (lebar x tinggi), radius sudut layar, ukuran Dynamic Island.
const MODELS = {
  "iphone15": { name: "iPhone 15", w: 393, h: 852, r: 55, island: [125, 37] },
  "iphone15pro": { name: "iPhone 15 Pro", w: 393, h: 852, r: 55, island: [125, 37] },
  "iphone15promax": { name: "iPhone 15 Pro Max", w: 430, h: 932, r: 55, island: [125, 37] },
  "iphone16": { name: "iPhone 16", w: 393, h: 852, r: 55, island: [125, 37] },
  "iphone16pro": { name: "iPhone 16 Pro", w: 402, h: 874, r: 62, island: [125, 37] },
  "iphone16promax": { name: "iPhone 16 Pro Max", w: 440, h: 956, r: 62, island: [125, 37] }
};

const COLORS = {
  "natural": "#BEB8AE",
  "black": "#3B3B3D",
  "white": "#EDECE8",
  "desert": "#C2A68E",
  "blue": "#3E4757",
  "midnight": "#1C1C1E"
};

function hex(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function solid(h, opacity) {
  return { type: "SOLID", color: hex(h), opacity: opacity === undefined ? 1 : opacity };
}
function shade(h, amt) {
  const c = hex(h);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * 255 + amt)));
  return "#" + [c.r, c.g, c.b].map((v) => f(v).toString(16).padStart(2, "0")).join("");
}

function buildPhone(source, opt) {
  const m = MODELS[opt.model] || MODELS.iphone15pro;
  const s = source.width / m.w; // skala mengikuti lebar frame asli
  const screenW = source.width;
  const screenH = opt.fullHeight ? source.height : Math.round(m.h * s);
  const bezel = 11 * s;
  const frameW = 4 * s; // lis logam
  const R = m.r * s;
  const body = shade(COLORS[opt.color] || COLORS.natural, 0);

  const outerW = screenW + 2 * (bezel + frameW);
  const outerH = screenH + 2 * (bezel + frameW);
  const btn = 3 * s;

  const root = figma.createFrame();
  root.name = m.name + " — " + source.name;
  root.fills = [];
  root.clipsContent = false;
  root.resize(outerW + 2 * btn, outerH);

  // Tombol samping
  const buttons = [
    { side: "L", y: 120, h: 32 }, // action button
    { side: "L", y: 178, h: 62 }, // volume +
    { side: "L", y: 250, h: 62 }, // volume -
    { side: "R", y: 205, h: 100 } // power
  ];
  if (opt.model.indexOf("16") >= 0) buttons.push({ side: "R", y: 560, h: 72 }); // camera control
  for (const b of buttons) {
    const r = figma.createRectangle();
    r.name = "Tombol";
    r.resize(btn + 2 * s, b.h * s);
    r.x = b.side === "L" ? 0 : outerW + btn - 2 * s;
    r.y = b.y * s;
    r.cornerRadius = 2 * s;
    r.fills = [solid(shade(body, -25))];
    root.appendChild(r);
  }

  // Bodi logam
  const shell = figma.createRectangle();
  shell.name = "Bodi";
  shell.resize(outerW, outerH);
  shell.x = btn;
  shell.cornerRadius = R + bezel + frameW;
  shell.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      { position: 0, color: Object.assign(hex(shade(body, 25)), { a: 1 }) },
      { position: 0.5, color: Object.assign(hex(body), { a: 1 }) },
      { position: 1, color: Object.assign(hex(shade(body, -30)), { a: 1 }) }
    ]
  }];
  if (opt.shadow) {
    shell.effects = [
      { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.22 }, offset: { x: 0, y: 30 * s }, radius: 60 * s, spread: 0, visible: true, blendMode: "NORMAL" },
      { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 6 * s }, radius: 12 * s, spread: 0, visible: true, blendMode: "NORMAL" }
    ];
  }
  root.appendChild(shell);

  // Bezel hitam
  const bz = figma.createRectangle();
  bz.name = "Bezel";
  bz.resize(outerW - 2 * frameW, outerH - 2 * frameW);
  bz.x = btn + frameW;
  bz.y = frameW;
  bz.cornerRadius = R + bezel;
  bz.fills = [solid("#000000")];
  root.appendChild(bz);

  // Layar (clip) berisi salinan frame
  const screen = figma.createFrame();
  screen.name = "Layar";
  screen.resize(screenW, screenH);
  screen.x = btn + frameW + bezel;
  screen.y = frameW + bezel;
  screen.cornerRadius = R;
  screen.clipsContent = true;
  screen.fills = [solid("#FFFFFF")];
  root.appendChild(screen);

  let content;
  if (opt.link && source.type === "COMPONENT") content = source.createInstance();
  else content = source.clone();
  content.x = 0;
  content.y = 0;
  screen.appendChild(content);

  // Dynamic Island (iPhone 15 & 16 semuanya punya)
  if (opt.island) {
    const isl = figma.createRectangle();
    isl.name = "Dynamic Island";
    isl.resize(m.island[0] * s, m.island[1] * s);
    isl.x = screen.x + (screenW - isl.width) / 2;
    isl.y = screen.y + 11 * s;
    isl.cornerRadius = isl.height / 2;
    isl.fills = [solid("#000000")];
    root.appendChild(isl);
  }

  // Kilap tipis di atas layar
  if (opt.glare) {
    const g = figma.createRectangle();
    g.name = "Kilap";
    g.resize(screenW, screenH);
    g.x = screen.x;
    g.y = screen.y;
    g.cornerRadius = R;
    g.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[0.6, 0.6, -0.1], [-0.6, 0.6, 0.5]],
      gradientStops: [
        { position: 0, color: { r: 1, g: 1, b: 1, a: 0.14 } },
        { position: 0.45, color: { r: 1, g: 1, b: 1, a: 0 } }
      ]
    }];
    root.appendChild(g);
  }

  if (opt.rotation) root.rotation = opt.rotation;
  return root;
}

async function buildBoard(phones, opt, anchor) {
  const board = figma.createFrame();
  board.name = opt.title ? "Showcase — " + opt.title : "Showcase Mockup";
  board.layoutMode = "VERTICAL";
  board.primaryAxisSizingMode = "AUTO";
  board.counterAxisSizingMode = "AUTO";
  board.counterAxisAlignItems = "CENTER";
  board.itemSpacing = 64;
  board.paddingTop = board.paddingBottom = 120;
  board.paddingLeft = board.paddingRight = 140;
  board.cornerRadius = opt.boardRadius ? 32 : 0;
  board.fills = opt.bg2
    ? [{
        type: "GRADIENT_LINEAR",
        gradientTransform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]],
        gradientStops: [
          { position: 0, color: Object.assign(hex(opt.bg1), { a: 1 }) },
          { position: 1, color: Object.assign(hex(opt.bg2), { a: 1 }) }
        ]
      }]
    : [solid(opt.bg1)];

  if (opt.title || opt.subtitle) {
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const head = figma.createFrame();
    head.name = "Judul";
    head.fills = [];
    head.layoutMode = "VERTICAL";
    head.primaryAxisSizingMode = "AUTO";
    head.counterAxisSizingMode = "AUTO";
    head.counterAxisAlignItems = "CENTER";
    head.itemSpacing = 12;
    const txtColor = opt.darkText ? "#13336E" : "#FFFFFF";
    if (opt.title) {
      const t = figma.createText();
      t.fontName = { family: "Inter", style: "Bold" };
      t.characters = opt.title;
      t.fontSize = 56;
      t.fills = [solid(txtColor)];
      head.appendChild(t);
    }
    if (opt.subtitle) {
      const t = figma.createText();
      t.fontName = { family: "Inter", style: "Regular" };
      t.characters = opt.subtitle;
      t.fontSize = 26;
      t.fills = [solid(txtColor, 0.8)];
      head.appendChild(t);
    }
    board.appendChild(head);
  }

  const row = figma.createFrame();
  row.name = "Deretan HP";
  row.fills = [];
  row.clipsContent = false;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.counterAxisAlignItems = "CENTER";
  row.itemSpacing = opt.gap;
  for (const p of phones) row.appendChild(p);
  board.appendChild(row);

  board.x = anchor.x;
  board.y = anchor.y;
  return board;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "build") return;
  const opt = msg.options;
  const sel = figma.currentPage.selection.filter(
    (n) => n.type === "FRAME" || n.type === "COMPONENT" || n.type === "INSTANCE" || n.type === "GROUP"
  );
  if (!sel.length) {
    figma.notify("Pilih minimal satu frame layar dulu.", { error: true });
    return;
  }
  sel.sort((a, b) => a.x - b.x || a.y - b.y);

  const right = Math.max.apply(null, sel.map((n) => n.x + n.width));
  const top = Math.min.apply(null, sel.map((n) => n.y));
  const anchor = { x: right + 200, y: top };

  try {
    const phones = sel.map((n) => buildPhone(n, opt));
    let result;
    if (opt.board) {
      result = [await buildBoard(phones, opt, anchor)];
    } else {
      let x = anchor.x;
      for (const p of phones) {
        p.x = x;
        p.y = anchor.y;
        x += p.width + opt.gap;
      }
      result = phones;
    }
    figma.currentPage.selection = result;
    figma.viewport.scrollAndZoomIntoView(result);
    figma.notify(phones.length + " mockup dibuat ✓");
  } catch (e) {
    figma.notify("Gagal: " + e.message, { error: true });
  }
};
