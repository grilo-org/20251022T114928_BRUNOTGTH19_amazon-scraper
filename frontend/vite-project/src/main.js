const BACKEND_URL = "http://localhost:3000";

const searchBtn = document.getElementById("searchBtn");
const keywordInput = document.getElementById("keyword");
const resultsDiv = document.getElementById("results");

// Função para exibir erro formatado
function showError(message) {
  resultsDiv.innerHTML = `
    <div class="error">
      <p>${message}</p>
      <small>Tente novamente ou verifique sua conexão</small>
    </div>
  `;
}

// Função para formatar o preço
function formatPrice(price) {
  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }
  return price;
}

async function searchProducts() {
  const keyword = keywordInput.value.trim();
  if (!keyword) {
    showError("Digite uma palavra-chave para buscar!");
    return;
  }

  resultsDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Buscando produtos para "${keyword}"...</p>
    </div>
  `;

  try {
    const response = await fetch(`${BACKEND_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = `
        <div class="no-results">
          <p>Nenhum produto encontrado para "${keyword}"</p>
          <small>Tente usar termos diferentes ou mais genéricos</small>
        </div>
      `;
      return;
    }

    resultsDiv.innerHTML = `
      <div class="search-info">
        <h2>Resultados para "${keyword}"</h2>
        <p>${data.count} produtos encontrados</p>
      </div>
      <div class="products-grid">
        ${data.results.map(product => `
          <div class="product-card">
            <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/150?text=Imagem+Indisponível'">
            <div class="product-info">
              <h3>${product.title}</h3>
              <p class="price">${product.price}</p>
              <a href="${product.link}" target="_blank" rel="noopener noreferrer" class="amazon-link">
                Ver na Amazon
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    `;

  } catch (error) {
    console.error("Erro na busca:", error);
    showError("Ocorreu um erro ao buscar os produtos. Por favor, tente novamente mais tarde.");
  }
}

// Event listeners melhorados
searchBtn.addEventListener("click", searchProducts);
keywordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchProducts();
});