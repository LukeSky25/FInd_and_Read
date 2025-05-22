const express = require("express");
const cors = require("cors");
const findFiles = require("./modules/find");
const readFile = require("./modules/read");
const writeFiles = require("./modules/write");

const app = express();
app.use(cors());

app.get("/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const conteudo = await readFile(nomeArquivo);

    trataTexto(conteudo);

    async function trataTexto(texto) {
      const regexNomes =
        /\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+\b/g;
      const nomes = texto.match(regexNomes) || [];

      const nomesFormatados = nomes.map((nomeCompleto) => ({
        nome: nomeCompleto.trim(),
      }));

      const file = await writeFiles("test2.json", nomesFormatados);

      res.json(file);
    }
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get("/arquivo/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const conteudo = await readFile(nomeArquivo);

    const Json_data = JSON.parse(conteudo);
    res.json(Json_data);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get("/files", async (req, res) => {
  try {
    const arquivos = await findFiles();

    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001");
});
