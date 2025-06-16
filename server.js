const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const findFiles = require("./modules/find");
const readFile = require("./modules/read");
const writeFiles = require("./modules/write");

const app = express();

let StyleConfig = {
  title: "Edição Nº - Restaurante: ",
  color: "#000000",
  logo: "/uploads/logo.png",
  backgroundType: "color",
  backgroundValue: "#40e0d0",
};

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.get("/reset/:nome", async (req, res) => {
  try {
    const nomeArquivo = req.params.nome;
    const conteudo = await readFile(nomeArquivo);
    const linhas = conteudo.split("\n").filter(Boolean);

    const nomesFormatados = linhas.map((nomeCompleto) => ({
      nome: nomeCompleto.trim(),
      list: false,
    }));

    const arquivoFinal = await writeFiles("nomes.json", nomesFormatados);

    const nomesZerados = await writeFiles("nomes-sorteados.txt", "");

    res.json("Arquivo criado com sucesso", arquivoFinal);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
  }
});

app.post("/escrever/:nome", async (req, res) => {
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

app.post("/relatorio/escrever", async (req, res) => {
  try {
    const nomeArquivo = "nomes-sorteados.txt";
    const nomes = req.body;

    if (!Array.isArray(nomes) || nomes.length === 0) {
      return res
        .status(400)
        .json({ erro: "Envie um array de nomes no corpo da requisição" });
    }

    const texto = nomes.join("\n") + "\n";
    const caminhoArquivo = path.join(
      __dirname,
      "uploads",
      nomeArquivo.endsWith(".txt") ? nomeArquivo : `${nomeArquivo}.txt`
    );

    await fs.promises.appendFile(caminhoArquivo, texto, "utf8");

    res.json({
      mensagem: "Nomes adicionados com sucesso!",
      arquivo: caminhoArquivo,
    });
  } catch (error) {
    console.error("Erro ao escrever nomes:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.get("/relatorio", async (req, res) => {
  try {
    const conteudo = await readFile("nomes-sorteados.txt");

    const linhas = conteudo.split("\n").filter(Boolean);

    res.json(linhas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(error);
  }
});

app.get("/relatorio/download", async (req, res) => {
  const txtFilePath = path.join(__dirname, "uploads", "nomes-sorteados.txt");

  if (!fs.existsSync(txtFilePath)) {
    return res.status(404).send("Arquivo não encontrado");
  }

  try {
    const content = await fs.promises.readFile(txtFilePath, "utf-8");
    const linhas = content.split("\n").filter(Boolean);

    const conteudo = await readFile("lista.txt");

    const nomes = conteudo.split("\n").filter(Boolean);

    const data = new Date();
    const dataHora = data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    if (linhas.length === 0) {
      doc.fontSize(16).text("Arquivo vazio", { align: "center" });
    } else {
      // 1. Título
      doc
        .fontSize(18)
        .font("Times-Bold")
        .text("Relatorio: El Uruguayo", { align: "center" });

      // 2. Data e hora
      if (linhas[1]) {
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font("Times-Italic")
          .text(dataHora, { align: "center" });
      }

      // 3. Totais
      if (linhas[2]) {
        doc.moveDown(1);
        doc.font("Times-Roman").text(`Total de Participantes: ${nomes.length}`);
      }
      if (linhas[3]) {
        doc.text(`Total de Sorteados: ${linhas.length}`);
      }

      if (linhas[4]) {
        doc.text("Nomes Sorteados: ");
        doc.moveDown(0.5);
      }

      // 4. Nomes sorteados
      let iniciouLista = false;
      for (let i = 0; i !== linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!iniciouLista && linha.toLowerCase().includes("nomes sorteados")) {
          doc.moveDown();
          doc.font("Times-Bold").text(linha, { underline: true });
          doc.moveDown(0.5);
          iniciouLista = true;
        } else {
          doc.font("Times-Roman").text(`- ${linha}`);
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).send("Erro ao gerar PDF");
  }
});

app.get("/style", (req, res) => {
  res.json(StyleConfig);
});

app.post("/style", (req, res) => {
  StyleConfig = req.body;
  res.json({ message: "Configuração atualizada com sucesso!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("API rodando em http://localhost:3001");
});
