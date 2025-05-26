const express = require("express");
const cors = require("cors");
const findFiles = require("./modules/find");
const readFile = require("./modules/read");
const writeFiles = require("./modules/write");

const app = express();
app.use(cors());
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/escrever/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const conteudo = await readFile(nomeArquivo);
    const linhas = conteudo.split("\n").filter(Boolean);

    const nomesFormatados = linhas.map((nomeCompleto) => ({
      nome: nomeCompleto.trim(),
    }));

    const arquivoFinal = await writeFiles("test2.json", nomesFormatados);

    res.json("Arquivo criado com sucesso", arquivoFinal);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
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
