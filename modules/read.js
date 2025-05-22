const fs = require("fs").promises;
const path = require("path");

async function readFile(fileName, pasta = "uploads") {
  try {
    const filePath = path.resolve(__dirname, "../", pasta, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (err) {
    throw new Error(`Erro ao ler o arquivo "${fileName}": ${err.message}`);
  }
}

module.exports = readFile;
