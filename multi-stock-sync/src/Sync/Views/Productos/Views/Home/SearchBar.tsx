import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearch }) => {
  const [query, setQuery] = useState(searchQuery);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <Form className="d-flex gap-2" onSubmit={handleSubmit}>
    <Form.Control
      type="text"
      placeholder="Buscar productos"
      value={query}
      onChange={handleInputChange}        
    />
    <Button variant="outline-success" onClick={handleSearch}>
      Buscar
    </Button>
  </Form>
  
  );
};

export default SearchBar;
