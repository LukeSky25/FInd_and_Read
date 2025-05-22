const fs = require("fs").promises;
const path = require("path");

async function writeFiles(arquivo, nomes, pasta = "Uploads") {
  try {
    const rootDir = path.resolve(__dirname, "../Uploads", arquivo);

    const file = await fs.writeFile(
      rootDir,
      JSON.stringify(nomes, null, 4),
      "utf-8",
      (err) => {
        if (err) {
          console.log("Erro ao escrever o arquivo JSON", err);
          return;
        }
      }
    );

    console.log("Arquivo JSON criado com com sucesso");
    return file;
  } catch (err) {
    throw new Error(`Erro ao gravar arquivo ${pasta}: ${err.message}`);
  }
}

module.exports = writeFiles;
