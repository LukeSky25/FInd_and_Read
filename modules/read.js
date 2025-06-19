const fs = require("fs").promises;
const path = require("path");

async function readFile(fileName, pasta = "uploads") {
  try {
    // Resolve o caminho do arquivo

    const filePath = path.resolve(__dirname, "../", pasta, fileName);

    // Lê o conteúdo do arquivo

    const content = await fs.readFile(filePath, "utf-8");

    // Retorna o conteúdo

    return content;
  } catch (err) {
    // Em caso de erro retorna para o usuário
    throw new Error(`Erro ao ler o arquivo "${fileName}": ${err.message}`);
  }
}

module.exports = readFile;
