const express = require("express");
const cors = require("cors");
const findFiles = require("./modules/find");
const readFile = require("./modules/read");
const writeFiles = require("./modules/write");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", async (req, res) => res.json("Olá Mundo"));

app.get("/files", async (req, res) => {
  try {
    const arquivos = await findFiles();

    res.json(arquivos);
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

app.get("/escrever/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const conteudo = await readFile(nomeArquivo);
    const linhas = conteudo.split("\n").filter(Boolean);

    const nomesFormatados = linhas.map((nomeCompleto) => ({
      nome: nomeCompleto.trim(),
      list: false,
    }));

    const arquivoFinal = await writeFiles("nomes.json", nomesFormatados);

    res.json("Arquivo criado com sucesso", arquivoFinal);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
  }
});

app.post("/lista/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const dados = req.body;

    const textoOriginal = dados.join("\n");

    const arquivoFinal = await writeFiles(nomeArquivo, textoOriginal);

    res.json("Lista feita com sucesso", arquivoFinal);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
  }
});

app.get("/lista", async (req, res) => {
  try {
    const conteudo = await readFile("lista.txt");

    const linhas = conteudo.split("\n").filter(Boolean);

    res.json(linhas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
  }
});

app.get("/sortear/:nome/:quantidade", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const quantidade = parseInt(req.params.quantidade, 10);

    const conteudo = await readFile(nomeArquivo);
    const nomes = JSON.parse(conteudo);

    const candidatos = nomes.filter((p) => p.list === false);

    if (candidatos.length === 0) {
      return res.status(400).json({
        mensagem: "Nenhum nome disponível para sorteio.",
      });
    }

    const sorteados = [];
    const usados = new Set();

    while (sorteados.length < quantidade && usados.size < candidatos.length) {
      const i = Math.floor(Math.random() * candidatos.length);
      if (!usados.has(i)) {
        usados.add(i);
        sorteados.push(candidatos[i]);
      }
    }

    nomes.forEach((pessoa) => {
      if (sorteados.includes(pessoa)) {
        pessoa.list = true;
      }
    });

    await writeFiles(nomeArquivo, nomes);

    res.json({
      mensagem: "Sorteio realizado com sucesso",
      sorteados: sorteados.map((p) => p.nome),
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// app.get("/relatorio", async (req, res) => {

// });

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001");
});
