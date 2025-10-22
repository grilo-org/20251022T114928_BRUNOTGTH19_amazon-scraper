import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

// Substitua pela sua chave da ScraperAPI
const SCRAPERAPI_KEY = "79358ac32fafc604400a82f3127a02bd";

// Middleware para parsear JSON
app.use(express.json());

// CORS mais robusto
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Endpoint de busca melhorado
app.get("/api/scrape", async (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ 
      error: "Informe uma palavra-chave válida",
      example: "/api/scrape?keyword=iphone"
    });
  }

  try {
    // URL mais robusta com tratamento de erros
    const amazonUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`;
    const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(amazonUrl)}&render=true`;

    const response = await axios.get(scraperUrl, {
      timeout: 30000, // 30 segundos timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // Tratamento mais seguro dos dados
    let products = [];
    if (response.data && Array.isArray(response.data.products)) {
      products = response.data.products;
    }

    // Formatação mais consistente dos produtos
    const formattedProducts = products.map(p => ({
      title: p.title || "Título não disponível",
      price: p.price?.current_price ? `R$ ${parseFloat(p.price.current_price).toFixed(2)}` : "Preço indisponível",
      link: p.link || "#",
      image: p.image || "https://via.placeholder.com/150?text=Sem+Imagem"
    }));

    res.json({
      keyword,
      count: formattedProducts.length,
      results: formattedProducts
    });

  } catch (error) {
    console.error("Erro na requisição:", error.message);
    res.status(500).json({ 
      error: "Erro ao buscar produtos",
      details: error.response?.data || error.message
    });
  }
});

// Rota de saúde do servidor
app.get("/health", (req, res) => {
  res.status(200).json({ status: "online", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});