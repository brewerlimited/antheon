type BrandPoint = { x: number; y: number };

export interface NavigationBrand {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  samples: BrandPoint[];
  strokes: [BrandPoint, BrandPoint][];
  clone: HTMLElement;
}

const RASTER_SCALE = 10;

function fontDeclaration(style: CSSStyleDeclaration) {
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

/** Retain the actual navigation DOM, including its browser-selected ē fallback. */
function cloneWithStyles(source: HTMLElement) {
  const clone = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const copies = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  originals.forEach((original, index) => {
    const copy = copies[index];
    const style = getComputedStyle(original);
    // Computed values also resolve next/font's generated family and inherited colour.
    for (let property = 0; property < style.length; property++) {
      const name = style.item(property);
      copy.style.setProperty(name, style.getPropertyValue(name));
    }
    for (const attribute of Array.from(copy.attributes)) {
      if (/^on/i.test(attribute.name) || ["id", "href", "target", "rel", "tabindex", "aria-label", "aria-labelledby", "aria-describedby", "contenteditable"].includes(attribute.name)) {
        copy.removeAttribute(attribute.name);
      }
    }
    copy.style.setProperty("animation", "none");
    copy.style.setProperty("transition", "none");
    copy.style.setProperty("pointer-events", "none");
    copy.style.setProperty("visibility", "visible");
  });
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  Object.assign(clone.style, {
    position: "relative", margin: "0", inset: "auto", transform: "none",
    translate: "none", rotate: "none", scale: "none", opacity: "1",
    visibility: "visible", pointerEvents: "none", userSelect: "none",
    transformOrigin: "0 0",
  });
  return clone;
}

type TextRun = {
  text: string;
  node: Text;
  style: CSSStyleDeclaration;
  x: number;
  baseline: number;
};

function applyTextStyle(context: CanvasRenderingContext2D, style: CSSStyleDeclaration) {
  context.font = fontDeclaration(style);
  context.fillStyle = style.color;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.direction = style.direction === "rtl" ? "rtl" : "ltr";
  context.fontKerning = style.fontKerning as CanvasFontKerning;
  if ("textRendering" in context) context.textRendering = style.textRendering as CanvasTextRendering;
  if ("letterSpacing" in context) context.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  if ("wordSpacing" in context) context.wordSpacing = style.wordSpacing === "normal" ? "0px" : style.wordSpacing;
}

/**
 * Samples the live nav identity instead of drawing a substitute wordmark.
 * Keep the returned DOM clone at its native size and transform its wrapper:
 * its final scale of one exactly matches the original navigation element.
 */
export async function sampleNavigationBrand(element: HTMLElement): Promise<NavigationBrand> {
  const elements = [element, ...element.querySelectorAll<HTMLElement>("*")];
  await Promise.all(elements.map((node) => document.fonts.load(fontDeclaration(getComputedStyle(node)), node.textContent || " ")));

  const bounds = element.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  if (!width || !height) throw new Error("The navigation identity must be laid out before sampling.");

  const clone = cloneWithStyles(element);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = "0";
  clone.style.maxWidth = "none";
  clone.style.minHeight = "0";
  clone.style.maxHeight = "none";

  // A temporary, invisible copy supplies real browser baselines. Font ascent
  // approximations drift when a glyph (notably the existing precomposed ē)
  // comes from a fallback font, so do not infer this from a nominal font size.
  const measurement = clone.cloneNode(true) as HTMLElement;
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed", left: "-10000px", top: "0", width: `${width}px`,
    height: `${height}px`, visibility: "hidden", pointerEvents: "none",
    contain: "layout style", zIndex: "-1",
  });
  host.setAttribute("aria-hidden", "true");
  host.append(measurement);
  document.body.append(host);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * RASTER_SCALE);
  canvas.height = Math.ceil(height * RASTER_SCALE);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) { host.remove(); throw new Error("The navigation identity canvas is unavailable."); }
  context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);

  try {
    const walker = document.createTreeWalker(measurement, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.trim()) nodes.push(walker.currentNode as Text);
    }
    const runs: TextRun[] = [];
    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent) continue;
      const style = getComputedStyle(parent);
      const range = document.createRange();
      range.selectNodeContents(node);
      const textBounds = range.getBoundingClientRect();
      const marker = document.createElement("span");
      // This zero-size inline box ends precisely at the text line's baseline.
      marker.style.cssText = "display:inline-block!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;font-size:0!important;line-height:0!important;vertical-align:baseline!important;position:static!important;transform:none!important;";
      parent.insertBefore(marker, node.nextSibling);
      const origin = measurement.getBoundingClientRect();
      const baseline = marker.getBoundingClientRect().top - origin.top;
      marker.remove();
      runs.push({ text: node.data, node, style, x: textBounds.left - origin.left, baseline });
    }

    const supportsTracking = typeof Reflect.get(context, "letterSpacing") === "string";
    for (const run of runs) {
      applyTextStyle(context, run.style);
      if (supportsTracking) {
        // Preserve the exact precomposed text and the browser's normal shaping.
        context.fillText(run.text, run.x, run.baseline);
      } else {
        // Older canvases cannot express tracking. The DOM has already shaped
        // the string, so read each actual character's advance from its Range.
        const range = document.createRange();
        const origin = measurement.getBoundingClientRect();
        let offset = 0;
        for (const character of run.text) {
          range.setStart(run.node, offset);
          offset += character.length;
          range.setEnd(run.node, offset);
          context.fillText(character, range.getBoundingClientRect().left - origin.left, run.baseline);
        }
      }
    }
  } finally {
    host.remove();
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const normalize = (x: number, y: number): BrandPoint => ({
    x: x / canvas.width - .5,
    y: (.5 - y / canvas.height) * (height / width),
  });
  const samples: BrandPoint[] = [];
  for (let y = 1; y < canvas.height; y += 2) {
    for (let x = 1; x < canvas.width; x += 2) {
      if (pixels[(y * canvas.width + x) * 4 + 3] > 180) samples.push(normalize(x, y));
    }
  }
  if (samples.length < 100) throw new Error("The navigation identity could not be sampled.");

  const strokes: [BrandPoint, BrandPoint][] = [];
  const crossSectionStep = Math.round(RASTER_SCALE * 1.5);
  for (let y = Math.floor(crossSectionStep / 2); y < canvas.height; y += crossSectionStep) {
    let start = -1;
    for (let x = 0; x <= canvas.width; x++) {
      const solid = x < canvas.width && pixels[(y * canvas.width + x) * 4 + 3] > 180;
      if (solid && start < 0) start = x;
      if (!solid && start >= 0) {
        if (x - start >= 3) strokes.push([normalize(start, y), normalize(x, y)]);
        start = -1;
      }
    }
  }
  return { canvas, width, height, samples, strokes, clone };
}
