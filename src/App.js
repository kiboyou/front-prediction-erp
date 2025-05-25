import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Import custom CSS
import SelectWithSearch from './components/SelectWithSearch';

// API Base URL
const API_BASE_URL = "http://localhost:8000"; // Ajustez selon votre configuration


// SVG Icons Components
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const PredictionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LoadingSpinner = () => (
  <div className="loading-spinner"></div>
);

// Composant pour afficher une prédiction complète (produit + quantité)
const FullPredictionDisplay = ({ result }) => (
  <div className="custom-prediction-display">
    <div className="prediction-item">
      <div className="prediction-icon">🛍️</div>
      <div className="prediction-details">
        <h4>Produit recommandé</h4>
        <p className="prediction-value">{result.PredictedProduct}</p>
      </div>
    </div>
    <div className="prediction-item">
      <div className="prediction-icon">📦</div>
      <div className="prediction-details">
        <h4>Quantité optimale</h4>
        <p className="prediction-value">{result.PredictedQuantity} unités</p>
      </div>
    </div>
  </div>
);

// Composant pour afficher une prédiction de produit
const ProductPredictionDisplay = ({ result }) => (
  <div className="custom-prediction-display">
    <div className="prediction-item featured">
      <div className="prediction-icon">🏆</div>
      <div className="prediction-details">
        <h4>Produit recommandé</h4>
        <p className="prediction-value">{result.PredictedProduct}</p>
        <p className="prediction-description">Basé sur l'analyse des préférences client</p>
      </div>
    </div>
  </div>
);

// Composant pour afficher une prédiction de quantité
const QuantityPredictionDisplay = ({ result }) => (
  <div className="custom-prediction-display">
    <div className="prediction-item featured">
      <div className="prediction-icon">📊</div>
      <div className="prediction-details">
        <h4>Quantité optimale</h4>
        <p className="prediction-value">{result.PredictedQuantity} unités</p>
        <p className="prediction-description">Optimisée pour maximiser les ventes</p>
      </div>
    </div>
  </div>
);

// Composant pour afficher les prédictions de tous les clients
const AllClientsPredictionDisplay = ({ result }) => (
  <div className="all-clients-prediction">
    <div className="prediction-summary">
      <div className="summary-item">
        <span className="summary-label">Total clients analysés</span>
        <span className="summary-value">{result.length}</span>
      </div>
    </div>
    <div className="clients-grid">
      {result.map((client, index) => (
        <div key={index} className="client-prediction-card">
          <div className="client-info">
            <h5>{client.CustomerName}</h5>
          </div>
          <div className="client-predictions">
            <div className="prediction-mini">
              <span className="mini-label">Produit</span>
              <span className="mini-value">{client.PredictedProduct}</span>
            </div>
            <div className="prediction-mini">
              <span className="mini-label">Quantité</span>
              <span className="mini-value">{client.PredictedQuantity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    
  </div>
);

// Composant pour formater l'affichage dans l'historique
const HistoryResultDisplay = ({ result, type }) => {
  // Si c'est un tableau, c'est une prédiction pour tous les clients
  if (Array.isArray(result)) {
    return (
      <div className="history-result">
        <div className="history-summary">
          <span className="history-count">{result.length} clients analysés</span>
        </div>
        <div className="history-preview">
          {result.slice(0, 3).map((client, index) => (
            <div key={index} className="history-client">
              <strong>{client.CustomerName}:</strong> {client.PredictedProduct} ({client.PredictedQuantity} unités)
            </div>
          ))}
          {result.length > 3 && <div className="history-more">... et {result.length - 3} autres</div>}
        </div>
      </div>
    );
  }

  // Affichage selon le type de prédiction
  if (result.PredictedProduct && result.PredictedQuantity) {
    return (
      <div className="history-result">
        <div className="history-prediction">
          <span className="history-product">📦 {result.PredictedProduct}</span>
          <span className="history-quantity">🔢 {result.PredictedQuantity} unités</span>
        </div>
      </div>
    );
  } else if (result.PredictedProduct) {
    return (
      <div className="history-result">
        <div className="history-prediction">
          <span className="history-product">🏆 {result.PredictedProduct}</span>
        </div>
      </div>
    );
  } else if (result.PredictedQuantity) {
    return (
      <div className="history-result">
        <div className="history-prediction">
          <span className="history-quantity">📊 {result.PredictedQuantity} unités</span>
        </div>
      </div>
    );
  }

  // Fallback au JSON si le format n'est pas reconnu
  return <pre>{JSON.stringify(result, null, 2)}</pre>;
};

// Composant principal pour afficher les résultats de prédiction
const PredictionResult = ({ result, title, isLoading, type }) => {
  if (isLoading) {
    return (
      <div className="prediction-result loading">
        <div className="result-header">
          <h3>🔄 Prédiction en cours...</h3>
        </div>
        <div className="result-content">
          <Skeleton height={120} />
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const renderCustomContent = () => {
    if (Array.isArray(result)) {
      return <AllClientsPredictionDisplay result={result} />;
    } else if (result.PredictedProduct && result.PredictedQuantity) {
      return <FullPredictionDisplay result={result} />;
    } else if (result.PredictedProduct) {
      return <ProductPredictionDisplay result={result} />;
    } else if (result.PredictedQuantity) {
      return <QuantityPredictionDisplay result={result} />;
    }
    return <pre>{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className="prediction-result success">
      <div className="result-header">
        <h3>✅ {title}</h3>
        <span className="timestamp">
          {new Date().toLocaleString('fr-FR')}
        </span>
      </div>
      <div className="result-content">
        {renderCustomContent()}
      </div>
      <div className="result-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
            toast.success("Résultat copié dans le presse-papiers !");
          }}
        >
          📋 Copier
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            const dataStr = JSON.stringify(result, null, 2);
            const dataBlob = new Blob([dataStr], {type:'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prediction-${Date.now()}.json`;
            link.click();
          }}
        >
          💾 Télécharger
        </button>
      </div>
    </div>
  );
};

function App() {
  // États pour formulaires & résultats
  const [fullRequest, setFullRequest] = useState({
    CustomerName: "",
    CategoryName: "",
    Price: "",
    Cost: "",
    FavoriteCategory: "",
  });
  const [productRequest, setProductRequest] = useState({
    CustomerName: "",
    CategoryName: "",
    Price: "",
    Cost: "",
    FavoriteCategory: "",
  });
  const [quantityRequest, setQuantityRequest] = useState({
    ProductName: "",
    CustomerName: "",
    CategoryName: "",
    Price: "",
    Cost: "",
    FavoriteCategory: "",
  });

  // États de l'interface
  const [activeSection, setActiveSection] = useState("predict-full");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [predictionCount, setPredictionCount] = useState(2); // Valeur par défaut de 2
  const [error, setError] = useState(null);
  
  // États de chargement séparés pour chaque prédiction
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isLoadingQuantity, setIsLoadingQuantity] = useState(false);
  const [isLoadingAllClients, setIsLoadingAllClients] = useState(false);
  
  // États pour les options des selects
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [fullPredictionResult, setFullPredictionResult] = useState(null);
  const [productPredictionResult, setProductPredictionResult] = useState(null);
  const [quantityPredictionResult, setQuantityPredictionResult] = useState(null);
  const [allClientsPredictionResult, setAllClientsPredictionResult] = useState(null);

  
  // Charger les prédictions récentes au démarrage
  useEffect(() => {
    fetchHistory();
    fetchOptionsData(); // Charger les données pour les selects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Récupérer l'historique des prédictions
  async function fetchHistory() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/predictions`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erreur inconnue");
      }
      const data = await res.json();
      // Ajouter à l'historique
      setResults(prev => {
        // Créer une copie pour éviter la mutation
        const updatedResults = [...prev];
        // Ajouter une nouvelle entrée au début
        updatedResults.unshift({
          id: Date.now(),
          type: "history",
          title: "Historique des prédictions",
          data: data
        });
        return updatedResults;
      });
      toast.info("Historique des prédictions actualisé");
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur lors du chargement de l'historique: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Fonction pour récupérer les données des options des selects
  async function fetchOptionsData() {
    setIsLoadingOptions(true);
    try {
      // Helper function
      async function getData(url = "") {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Erreur inconnue");
        }
        return response.json();
      }

      // Récupération des clients
      const clientsRes = await getData(`${API_BASE_URL}/customers`);
      setClients(clientsRes.customers);
      
      // Récupération des catégories
      const categoriesRes = await getData(`${API_BASE_URL}/categories`);
      setCategories(categoriesRes.categories);
      
      // Récupération des produits
      const productsRes = await getData(`${API_BASE_URL}/products`);
      setProducts(productsRes.products);

      
    } catch (err) {
      console.error("Erreur lors du chargement des options:", err);
      toast.error("Impossible de charger certaines données. Veuillez réessayer.");
      // S'assurer que les états restent des tableaux même en cas d'erreur
      setClients([]);
      setCategories([]);
      setProducts([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }

  // Handle form input changes
  function handleChange(e, setRequest) {
    const { name, value } = e.target;
    setRequest(prev => ({ ...prev, [name]: value }));
  }

  // Helper fetch functions
  async function getData(url = "") {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Erreur inconnue");
    }
    return response.json();
  }

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Erreur inconnue");
    }
    return response.json();
  }

  // Ajouter un résultat
  function addResult(type, title, data) {
    // Incrémenter le compteur de prédictions
    setPredictionCount(prevCount => prevCount + 1);
    
    setResults(prev => {
      const updatedResults = [...prev];
      updatedResults.unshift({
        id: Date.now(),
        type,
        title,
        data
      });
      return updatedResults;
    });
  }

  // Predict full (product + quantity)
  async function handleFullPredict(e) {
    e.preventDefault();
    setIsLoadingFull(true);
    setError(null);
    
    try {
      const res = await postData(`${API_BASE_URL}/predict`, fullRequest);
      setFullPredictionResult(res); // Stocker le résultat spécifique
      addResult("full", `Prédiction produit + quantité: ${fullRequest.CustomerName}`, res);
      toast.success("Prédiction complète réalisée avec succès !");
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoadingFull(false);
    }
  }

  // Predict product only
  async function handleProductPredict(e) {
    e.preventDefault();
    setIsLoadingProduct(true);
    setError(null);
    
    try {
      const res = await postData(`${API_BASE_URL}/predict_product`, productRequest);
      setProductPredictionResult(res); // Stocker le résultat spécifique
      addResult("product", `Prédiction produit: ${productRequest.CustomerName}`, res);
      toast.success("Prédiction de produit réalisée avec succès !");
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoadingProduct(false);
    }
  }

  // Predict quantity only
  async function handleQuantityPredict(e) {
    e.preventDefault();
    setIsLoadingQuantity(true);
    setError(null);
    
    try {
      const res = await postData(`${API_BASE_URL}/predict_quantity`, quantityRequest);
      setQuantityPredictionResult(res); // Stocker le résultat spécifique
      addResult("quantity", `Prédiction quantité: ${quantityRequest.ProductName}`, res);
      toast.success("Prédiction de quantité réalisée avec succès !");
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoadingQuantity(false);
    }
  }

  // Prédiction de tous les clients
  async function handlePredictAllClients() {
    setIsLoadingAllClients(true);
    setError(null);
    
    try {
      const toastId = toast.info("Traitement en cours pour tous les clients...", { autoClose: false });
      const res = await getData(`${API_BASE_URL}/predict_all`);
      setAllClientsPredictionResult(res); // Stocker le résultat spécifique
      addResult("all-clients", "Prédiction pour tous les clients", res);
      toast.update(toastId, { 
        render: "Prédictions pour tous les clients terminées avec succès !", 
        
});
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsLoadingAllClients(false);
    }
  }

  // Réinitialiser les formulaires
  function handleReset() {
    setFullRequest({
      CustomerName: "",
      CategoryName: "",
      Price: "",
      Cost: "",
      FavoriteCategory: "",
    });
    setProductRequest({
      CustomerName: "",
      CategoryName: "",
      Price: "",
      Cost: "",
      FavoriteCategory: "",
    });
    setQuantityRequest({
      ProductName: "",
      CustomerName: "",
      CategoryName: "",
      Price: "",
      Cost: "",
      FavoriteCategory: "",
    });
    // Réinitialiser aussi les résultats
    setFullPredictionResult(null);
    setProductPredictionResult(null);
    setQuantityPredictionResult(null);
    setAllClientsPredictionResult(null);
  }

  // Rendu du formulaire complet (produit + quantité)
  const renderFullPredictionForm = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          Prédiction complète pour un client spécifique, incluant le produit recommandé et la quantité optimale.
        </h2>
      </div>
      <div className="card-body">
  
        <form onSubmit={handleFullPredict}>
          <div className="grid">
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Nom du client</label>
                <SelectWithSearch
                  options={clients}
                  placeholder="Rechercher un client"
                  value={fullRequest.CustomerName}
                  onChange={e => handleChange(e, setFullRequest)}
                  isLoading={isLoadingOptions}
                  name="CustomerName"
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie"
                  value={fullRequest.CategoryName}
                  onChange={e => handleChange(e, setFullRequest)}
                  isLoading={isLoadingOptions}
                  name="CategoryName"
                  required
                />
              </div>
            </div>
            
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie préférée</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie préférée"
                  value={fullRequest.FavoriteCategory}
                  onChange={e => handleChange(e, setFullRequest)}
                  isLoading={isLoadingOptions}
                  name="FavoriteCategory"
                  required
                />
              </div>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={isLoadingFull}>
              {isLoadingFull ? <LoadingSpinner /> : null}
              Lancer la prédiction
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Affichage du résultat de prédiction */}
        <PredictionResult 
          result={fullPredictionResult}
          title="Résultat de la prédiction complète"
          isLoading={isLoadingFull}
        />
      </div>
    </div>
  );

  // Rendu du formulaire de prédiction produit
  const renderProductPredictionForm = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          Prédiction du produit recommandé pour un client spécifique.
        </h2>
      </div>
      <div className="card-body">
    
        <form onSubmit={handleProductPredict}>
          <div className="grid">
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Nom du client</label>
                <SelectWithSearch
                  options={clients}
                  placeholder="Rechercher un client"
                  value={productRequest.CustomerName}
                  onChange={e => handleChange(e, setProductRequest)}
                  isLoading={isLoadingOptions}
                  name="CustomerName"
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie"
                  value={productRequest.CategoryName}
                  onChange={e => handleChange(e, setProductRequest)}
                  isLoading={isLoadingOptions}
                  name="CategoryName"
                  required
                />
              </div>
            </div>

            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie préférée</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie préférée"
                  value={productRequest.FavoriteCategory}
                  onChange={e => handleChange(e, setProductRequest)}
                  isLoading={isLoadingOptions}
                  name="FavoriteCategory"
                  required
                />
              </div>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={isLoadingProduct}>
              {isLoadingProduct ? <LoadingSpinner /> : null}
              Prédire le produit
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Affichage du résultat de prédiction produit */}
        <PredictionResult 
          result={productPredictionResult}
          title="Résultat de la prédiction produit"
          isLoading={isLoadingProduct}
        />
      </div>
    </div>
  );

  // Rendu du formulaire de prédiction quantité
  const renderQuantityPredictionForm = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          Prédiction de la quantité optimale pour un produit et un client spécifiques.

        </h2>
      </div>
      <div className="card-body">
 
        <form onSubmit={handleQuantityPredict}>
          <div className="grid">
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Nom du produit</label>
                <SelectWithSearch
                  options={products}
                  placeholder="Rechercher un produit"
                  value={quantityRequest.ProductName}
                  onChange={e => handleChange(e, setQuantityRequest)}
                  isLoading={isLoadingOptions}
                  name="ProductName"
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Nom du client</label>
                <SelectWithSearch
                  options={clients}
                  placeholder="Rechercher un client"
                  value={quantityRequest.CustomerName}
                  onChange={e => handleChange(e, setQuantityRequest)}
                  isLoading={isLoadingOptions}
                  name="CustomerName"
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie"
                  value={quantityRequest.CategoryName}
                  onChange={e => handleChange(e, setQuantityRequest)}
                  isLoading={isLoadingOptions}
                  name="CategoryName"
                  required
                />
              </div>
            </div>
            
            
            <div className="col-6">
              <div className="form-group">
                <label className="form-label">Catégorie préférée</label>
                <SelectWithSearch
                  options={categories}
                  placeholder="Rechercher une catégorie préférée"
                  value={quantityRequest.FavoriteCategory}
                  onChange={e => handleChange(e, setQuantityRequest)}
                  isLoading={isLoadingOptions}
                  name="FavoriteCategory"
                  required
                />
              </div>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={isLoadingQuantity}>
              {isLoadingQuantity ? <LoadingSpinner /> : null}
              Prédire la quantité
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Affichage du résultat de prédiction quantité */}
        <PredictionResult 
          result={quantityPredictionResult}
          title="Résultat de la prédiction quantité"
          isLoading={isLoadingQuantity}
        />
      </div>
    </div>
  );

  // Rendu du formulaire de prédiction pour tous les clients
  const renderAllClientsPredictionForm = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Prédiction pour tous les clients</h2>
      </div>
      <div className="card-body">
        <div className="card-description">
          Lancer une prédiction pour tous les clients dans la base de données. Cette opération peut prendre du temps.
        </div>
        <div className="btn-group">
          <button
            onClick={handlePredictAllClients}
            className="btn btn-primary"
            disabled={isLoadingAllClients}
          >
            {isLoadingAllClients ? <LoadingSpinner /> : null}
            Lancer la prédiction globale
          </button>
        </div>

        {/* Affichage du résultat de prédiction pour tous les clients */}
        <PredictionResult 
          result={allClientsPredictionResult}
          title="Résultat de la prédiction globale"
          isLoading={isLoadingAllClients}
        />
      </div>
    </div>
  );

  // Rendu des résultats
  const renderResults = () => (
    <div className="results-container">
      {isLoading ? (
        // Afficher des squelettes de chargement
        Array(3).fill().map((_, index) => (
          <div key={`skeleton-${index}`} className="result-card">
            <div className="result-header">
              <Skeleton width={200} />
              <Skeleton width={100} />
            </div>
            <div className="result-body">
              <Skeleton height={100} />
              <div className="result-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Skeleton width={80} height={30} />
                <Skeleton width={80} height={30} />
              </div>
            </div>
          </div>
        ))
      ) : results.length === 0 ? (
        <div className="text-center" style={{ padding: '40px 20px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h3 style={{ fontSize: '18px', margin: '10px 0', color: '#64748b' }}>Aucun résultat disponible</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
            Effectuez une prédiction pour voir les résultats s'afficher ici
          </p>
        </div>
      ) : (
        results.map(result => (
          <div key={result.id} className="result-card">
            <div className="result-header">
              <span>{result.title}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {new Date(result.id).toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="result-body">
              <HistoryResultDisplay result={result.data} type={result.type} />
              <div className="result-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                  toast.info("Export de données initié");
                  // Logique d'export à implémenter
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Exporter
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                  toast.info("Filtrage activé");
                  // Logique de filtrage à implémenter
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filtrer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Rendu du dashboard
  const renderDashboard = () => (
    <>
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Bienvenue sur le tableau de bord</h2>
             
            </div>
            <div className="card-body">
              <div className="card-description">
                Bienvenue dans l'API de prédiction ERP. Cette application vous permet d'effectuer des prédictions intelligentes sur les produits et quantités pour optimiser votre gestion de stock et vos ventes.
              </div>
              
              <div className="grid" style={{ marginTop: '30px' }}>
                <div className="col-6">
                  <div className="dashboard-stat" style={{ backgroundColor: '#ebf5ff', color: '#1763e6', borderLeft: '4px solid #1763e6', padding: '22px', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}>
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                      Prédictions réalisées
                    </h4>
                    {isLoading ? (
                      <Skeleton height={32} width={40} />
                    ) : (
                      <div style={{ fontSize: '28px', fontWeight: '600' }}>{predictionCount}</div>
                    )}
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="dashboard-stat" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', borderLeft: '4px solid #4f46e5', padding: '22px', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Précision du modèle
                    </h4>
                    {isLoading ? (
                      <Skeleton height={32} width={40} />
                    ) : (
                      <div style={{ fontSize: '28px', fontWeight: '600' }}>92%</div>
                    )}
                    <div style={{ marginTop: '8px', height: '6px', backgroundColor: 'rgba(79, 70, 229, 0.2)', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ position: 'absolute', width: '92%', height: '100%', backgroundColor: '#4f46e5', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="dashboard-stat" style={{ backgroundColor: '#ecfdf5', color: '#059669', borderLeft: '4px solid #059669', padding: '22px', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                      Produits recommandés
                    </h4>
                    {isLoading ? (
                      <Skeleton height={32} width={40} />
                    ) : (
                      <div style={{ fontSize: '28px', fontWeight: '600' }}>56</div>
                    )}
                  </div>
                </div>
                
                <div className="col-6">
                  <div className="dashboard-stat" style={{ backgroundColor: '#fff7ed', color: '#d97706', borderLeft: '4px solid #d97706', padding: '22px', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Clients analysés
                    </h4>
                    {isLoading ? (
                      <Skeleton height={32} width={40} />
                    ) : (
                      <div style={{ fontSize: '28px', fontWeight: '600' }}>124</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Services de prédiction</h2>
            </div>
            <div className="card-body">
              <div className="card-description">
                Sélectionnez l'un des services de prédiction ci-dessous pour commencer votre analyse.
              </div>
              
              <div className="grid service-cards-row" style={{ marginTop: '24px' }}>
                <div className="col-4">
                  <div className="card service-card" style={{ borderTop: '3px solid #1763e6' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                      {isLoading ? (
                        <>
                          <Skeleton circle={true} height={60} width={60} style={{ margin: '0 auto 16px' }} />
                          <Skeleton height={24} width={180} style={{ margin: '0 auto 12px' }} />
                          <Skeleton height={50} count={2} style={{ marginBottom: '20px' }} />
                          <Skeleton height={38} width={120} style={{ margin: '0 auto' }} />
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: '#ebf5ff', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(23, 99, 230, 0.2)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1763e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                              </svg>
                            </div>
                          </div>
                          <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Prédiction Complète</h3>
                          <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: '1.6' }}>Recommandation de produit et quantité optimale pour un client spécifique</p>
                          <button 
                            className="btn btn-primary service-card-button" 
                            onClick={() => {
                              setActiveSection('predict-full');
                              toast.info("Accès au module de prédiction complète");
                            }}
                            style={{ width: '80%', padding: '10px' }}>
                            Démarrer l'analyse
                          </button>
                          <div style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              Dernière utilisation: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-4">
                  <div className="card service-card" style={{ borderTop: '3px solid #4f46e5' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                      {isLoading ? (
                        <>
                          <Skeleton circle={true} height={60} width={60} style={{ margin: '0 auto 16px' }} />
                          <Skeleton height={24} width={180} style={{ margin: '0 auto 12px' }} />
                          <Skeleton height={50} count={2} style={{ marginBottom: '20px' }} />
                          <Skeleton height={38} width={120} style={{ margin: '0 auto' }} />
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: '#eef2ff', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.2)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                              </svg>
                            </div>
                          </div>
                          <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Prédiction Produit</h3>
                          <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: '1.6' }}>Identification du meilleur produit à recommander à un client</p>
                          <button 
                            className="btn btn-primary service-card-button" 
                            style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', width: '80%', padding: '10px' }}
                            onClick={() => {
                              setActiveSection('predict-product');
                              toast.info("Accès au module de prédiction de produit");
                            }}>
                            Démarrer l'analyse
                          </button>
                          <div style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              Dernière utilisation: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-4">
                  <div className="card service-card" style={{ borderTop: '3px solid #059669' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
                      {isLoading ? (
                        <>
                          <Skeleton circle={true} height={60} width={60} style={{ margin: '0 auto 16px' }} />
                          <Skeleton height={24} width={180} style={{ margin: '0 auto 12px' }} />
                          <Skeleton height={50} count={2} style={{ marginBottom: '20px' }} />
                          <Skeleton height={38} width={120} style={{ margin: '0 auto' }} />
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ backgroundColor: '#ecfdf5', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.2)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                              </svg>
                            </div>
                          </div>
                          <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Prédiction Quantité</h3>
                          <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: '1.6' }}>Détermination de la quantité optimale pour maximiser les ventes</p>
                          <button 
                            className="btn btn-primary service-card-button" 
                            style={{ backgroundColor: '#059669', borderColor: '#059669', width: '80%', padding: '10px' }}
                            onClick={() => {
                              setActiveSection('predict-quantity');
                              toast.info("Accès au module de prédiction de quantité");
                            }}>
                            Démarrer l'analyse
                          </button>
                          <div style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              Dernière utilisation: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résultats récents */}
      
    </>
  );

  // Déterminer le contenu principal en fonction de la section active
  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'predict-full':
        return renderFullPredictionForm();
      case 'predict-product':
        return renderProductPredictionForm();
      case 'predict-quantity':
        return renderQuantityPredictionForm();
      case 'predict-all':
        return renderAllClientsPredictionForm();
      case 'history':
        return (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Historique des prédictions</h2>
            </div>
            <div className="card-body">          <div className="card-description">
            Historique complet des prédictions effectuées.
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={fetchHistory} 
                disabled={isLoading}
                style={{ marginBottom: '16px' }}>
                {isLoading ? <LoadingSpinner /> : null}
                Rafraîchir l'historique
              </button>
              {renderResults()}
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-container">
      {/* Toast notifications container */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Sidebar / Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">Prédiction ERP</div>
        </div>
        <ul className="nav-list">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <DashboardIcon />
              <span>Tableau de bord</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'predict-full' ? 'active' : ''}`}
              onClick={() => setActiveSection('predict-full')}
            >
              <PredictionIcon />
              <span>Prédiction complète</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'predict-product' ? 'active' : ''}`}
              onClick={() => setActiveSection('predict-product')}
            >
              <PredictionIcon />
              <span>Prédiction produit</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'predict-quantity' ? 'active' : ''}`}
              onClick={() => setActiveSection('predict-quantity')}
            >
              <PredictionIcon />
              <span>Prédiction quantité</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'predict-all' ? 'active' : ''}`}
              onClick={() => setActiveSection('predict-all')}
            >
              <PredictionIcon />
              <span>Tous les clients</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSection('history')}
            >
              <HistoryIcon />
              <span>Historique</span>
            </button>
          </li>
           <li className="nav-item">
            <a href='https:www.google.com' target='_blank' rel='noopener noreferrer' className={`nav-link ${activeSection === 'data' ? 'active' : ''}`}>
              <PredictionIcon />
              <span>voir les données</span>
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="page-title">
            {activeSection === 'dashboard' && 'Tableau de bord'}
            {activeSection === 'predict-full' && 'Prédiction complète (produit + quantité)'}
            {activeSection === 'predict-product' && 'Prédiction de produit'}
            {activeSection === 'predict-quantity' && 'Prédiction de quantité'}
            {activeSection === 'predict-all' && 'Prédiction pour tous les clients'}
            {activeSection === 'history' && 'Historique des prédictions'}
          </h1>
         
        </div>

        {/* Content Area */}
        <div className="content">
          {/* Afficher une alerte d'erreur si nécessaire */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          {/* Contenu principal basé sur la section active */}
          {renderMainContent()}
        </div>
        
        

        {/* Footer */}
        <div className="footer">
          <div className="footer-content">
            <div>
              &copy; {new Date().getFullYear()} API Prédiction ERP. Tous droits réservés.
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
