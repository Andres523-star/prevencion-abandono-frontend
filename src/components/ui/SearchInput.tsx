import React from 'react';
import '../../styles/searchInput.css';

export interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...'
}) => {
  return (
    <div className="ui-search-wrapper">
      <input
        type="text"
        className="ui-search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button type="button" className="ui-search-clear" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          &times;
        </button>
      )}
    </div>
  );
};
