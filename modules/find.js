const fs = require("fs").promises;
const path = require("path");

async function findFiles(pasta = "uploads") {
  try {
    // Resolve o caminho do diretorio

    const rootDir = path.resolve(__dirname, "../", pasta);

    // Lê o conteúdo do diretório

    const files = await fs.readdir(rootDir);

    // Retorna os arquivos dentro do diretorio

    return files;
  } catch (err) {
    // Em caso de erro retorna para o usuário
    throw new Error(`Erro ao ler arquivos da pasta ${pasta}: ${err.message}`);
  }
}

module.exports = findFiles;
