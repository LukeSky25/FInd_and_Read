const fs = require("fs").promises;
const path = require("path");

async function findFiles(pasta = "uploads") {
  try {
    const rootDir = path.resolve(__dirname, "../", pasta);
    const files = await fs.readdir(rootDir);
    return files;
  } catch (err) {
    throw new Error(`Erro ao ler arquivos da pasta ${pasta}: ${err.message}`);
  }
}

module.exports = findFiles;
