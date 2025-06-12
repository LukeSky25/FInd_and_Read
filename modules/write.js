const fs = require("fs").promises;
const path = require("path");

async function writeFiles(arquivo, conteudo, pasta = "uploads") {
  try {
    const rootDir = path.resolve(__dirname, "../uploads", arquivo);

    let data;
    if (typeof conteudo === "string") {
      // Conteúdo já está formatado como texto
      data = conteudo;
    } else {
      // Conteúdo será salvo como JSON
      data = JSON.stringify(conteudo, null, 4);
    }

    await fs.writeFile(rootDir, data, "utf-8");

    console.log(`Arquivo ${arquivo} criado com sucesso`);
    return data;
  } catch (err) {
    throw new Error(`Erro ao gravar arquivo ${pasta}: ${err.message}`);
  }
}

module.exports = writeFiles;
