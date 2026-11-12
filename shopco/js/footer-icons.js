// Иконки футера: pay.svg и communication.svg состоят из нескольких <svg> подряд,
// поэтому как обычные картинки они не открываются. Режем файл на отдельные иконки.
document.addEventListener("DOMContentLoaded", () => {
  // убираем комментарии и <?xml ?> (регулярки собраны из частей, чтобы редактор не путался)
  const COMMENTS = new RegExp("<" + "!--[\\s\\S]*?--" + ">", "g");
  const XML_HEAD = new RegExp("<" + "\\?xml[\\s\\S]*?\\?" + ">", "gi");
  const SVG_TAGS = new RegExp("<svg(?=[\\s>/])|<" + "/svg\\s*>", "gi");

  // делит текст файла на отдельные svg (учитывает вложенные и незакрытый последний)
  const splitSvgs = (raw) => {
    const text = raw.replace(COMMENTS, "").replace(XML_HEAD, "");
    const chunks = [];
    let depth = 0;
    let start = -1;
    for (const m of text.matchAll(SVG_TAGS)) {
      if (m[0][1] !== "/") {
        if (depth === 0) start = m.index;
        depth++;
      } else if (depth > 0) {
        depth--;
        if (depth === 0) chunks.push(text.slice(start, m.index + m[0].length));
      }
    }
    if (depth > 0 && start >= 0)
      chunks.push(text.slice(start) + "</svg>".repeat(depth));
    return chunks;
  };

  // каждая иконка — отдельная картинка: id и стили разных иконок не пересекаются
  const makeIcon = (chunk) => {
    const tag = chunk.match(/^<svg[^>]*>/i)[0];
    if (!/xmlns=/.test(tag))
      chunk = chunk.replace(
        /^<svg/i,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    const vb = tag.match(
      /viewBox="[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/i,
    );
    const w = (tag.match(/\swidth="([\d.]+)/i) || vb || [])[1];
    const h = (tag.match(/\sheight="([\d.]+)/i) || vb || [])[vb ? 2 : 1];

    const img = new Image();
    img.alt = "";
    if (w) img.width = Math.round(w);
    if (h) img.height = Math.round(h);
    img.src = URL.createObjectURL(new Blob([chunk], { type: "image/svg+xml" }));
    img.onerror = () => {
      const tpl = document.createElement("template");
      tpl.innerHTML = chunk.trim();
      if (tpl.content.firstElementChild)
        img.replaceWith(tpl.content.firstElementChild);
    };
    return img;
  };

  document.querySelectorAll("[data-svg]").forEach(async (box) => {
    try {
      const res = await fetch(box.dataset.svg);
      if (!res.ok) return;
      // data-count — сколько иконок брать из файла (остальные добавлены в HTML вручную)
      const limit = Number(box.dataset.count) || Infinity;
      const chunks = splitSvgs(await res.text()).slice(0, limit);
      console.info(
        "[иконки]",
        box.dataset.svg,
        "взято из файла:",
        chunks.length,
      );

      const names = (box.dataset.links || "").split(",");
      const nodes = chunks.map((chunk, i) => {
        const icon = makeIcon(chunk);
        if (!box.dataset.links) return icon;
        const a = document.createElement("a");
        a.href = "#";
        a.className = "footer__social-link";
        a.setAttribute("aria-label", names[i] || "Соцсеть");
        a.append(icon);
        return a;
      });
      box.prepend(...nodes); // иконки из файла идут перед теми, что прописаны в HTML
    } catch (e) {
      console.warn("Не удалось загрузить", box.dataset.svg, e);
    }
  });
});
