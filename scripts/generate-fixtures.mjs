import sharp from "sharp";
// Ilustração sintética, criada por código, sem dados/fotos de empresas ou clientes.
// Data: 2026-11-13. @author Carla Evelyn
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600"><defs><linearGradient id="a"><stop stop-color="#dce8df"/><stop offset="1" stop-color="#82ae98"/></linearGradient></defs><rect width="2400" height="1600" fill="url(#a)"/><circle cx="1800" cy="360" r="420" fill="#c4d8bd"/><rect x="790" y="300" width="820" height="1040" rx="65" fill="#f5f1e5"/><path d="M790 550h820M1010 950h390M1010 1030h280" stroke="#17634b" stroke-width="32"/><circle cx="1200" cy="720" r="100" fill="#b44121"/></svg>`;
await sharp(Buffer.from(svg))
  .jpeg({ quality: 94 })
  .toFile(new URL("../tests/fixtures/product.jpg", import.meta.url).pathname);
console.log("Fixture JPEG genérica gerada.");
