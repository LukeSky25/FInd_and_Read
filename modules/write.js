const fs = require("fs").promises;
const path = require("path");

async function writeFiles(arquivo, conteudo, pasta = "uploads") {
  try {
    // Resolve o caminho do arquivo

    const rootDir = path.resolve(__dirname, "../uploads", arquivo);

    // Cria o conteúdo

    let data;

    // Verifica o tipo de escrita: json ou string

    if (typeof conteudo === "string") {
      // Conteúdo já está formatado como texto
      data = conteudo;
    } else {
      // Conteúdo será salvo como JSON
      data = JSON.stringify(conteudo, null, 4);
    }

    // Escreve o texto ou json no arquivo

    await fs.writeFile(rootDir, data, "utf-8");

    // Retorna para o usuário

    console.log(`Arquivo ${arquivo} criado com sucesso`);
    return data;
  } catch (err) {
    // Em caso de erro retorna para o usuário
    throw new Error(`Erro ao gravar arquivo ${pasta}: ${err.message}`);
  }
}

module.exports = writeFiles;
