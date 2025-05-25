import { useEffect, useRef, useState } from 'react';

const SelectWithSearch = ({ options = [], placeholder = "", value = "", onChange, isLoading = false, name = "", required = false }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // S'assurer que options est un tableau
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filtrer les options en fonction de la recherche
  const filteredOptions = safeOptions.filter(option => 
    option && typeof option === 'string' && option.toLowerCase().includes(query.toLowerCase())
  );
  
  // Gérer la sélection d'une option
  const handleSelect = (selectedValue) => {
    if (onChange && typeof onChange === 'function') {
      onChange({ target: { name, value: selectedValue } });
    }
    setIsOpen(false);
    setQuery('');
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`select-with-search`} ref={dropdownRef}>
      <div 
        className={`form-control select-input ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        <span className="arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      
      {isOpen && (
        <div className="dropdown">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="select-options">
            {isLoading ? (
              <div className="select-loading">Chargement...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={`select-option ${option === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="no-options">Aucun résultat trouvé</div>
            )}
          </div>
        </div>
      )}
      
      {/* Input caché pour gérer la validation du formulaire */}
      <input
        type="hidden"
        name={name}
        value={value || ""}
        required={required}
      />
    </div>
  );
};

export default SelectWithSearch;
