// src/scripts/xml2json.js
// Executar: node src/scripts/xml2json.js
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const dataDir = path.join(__dirname, "..", "data");
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, explicitRoot: false });

// função que transforma a árvore xml2js em um array de livros com chapters arrays
function transform(parsed) {
  // parsed.book pode ser array ou objeto
  const books = Array.isArray(parsed.book) ? parsed.book : [parsed.book];

  return books.map((b) => {
    const bookName = b.name || b["$"]?.name || b.title || "Unknown";
    const abbrev = b.abbrev || b["$"]?.abbrev || bookName;
    // capítulo: b.c pode ser array ou objeto; cada c tem v (versos)
    const chapters = [];
    const cs = Array.isArray(b.c) ? b.c : (b.c ? [b.c] : []);
    cs.forEach((c) => {
      // cada verso: c.v pode ser array ou único
      const vs = Array.isArray(c.v) ? c.v : (c.v ? [c.v] : []);
      // cada v pode ter text content directly or _ property depending parser
      const verses = vs.map((vv) => {
        if (typeof vv === "string") return vv;
        if (vv._) return vv._;
        // vv may have text as property (xml2js sometimes uses '#text')
        if (vv['#text']) return vv['#text'];
        return (vv && typeof vv === 'object') ? (vv._ || vv.text || '') : String(vv || '');
      });
      chapters.push(verses);
    });

    return {
      name: bookName,
      abbrev,
      chapters
    };
  });
}

async function convertFile(filePath) {
  const xml = fs.readFileSync(filePath, "utf8");
  const parsed = await parser.parseStringPromise(xml);
  const booksArray = transform(parsed);
  return booksArray;
}

async function main() {
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".xml"));
  for (const f of files) {
    const full = path.join(dataDir, f);
    console.log("Converting", f);
    try {
      const books = await convertFile(full);
      // gravar arquivo JSON com o mesmo prefixo
      const outName = f.replace(".min.xml", ".json").replace(".xml", ".json");
      fs.writeFileSync(path.join(dataDir, outName), JSON.stringify(books, null, 2), "utf8");
      console.log("Wrote", outName);
    } catch (err) {
      console.error("Error converting", f, err);
    }
  }
}

main();
