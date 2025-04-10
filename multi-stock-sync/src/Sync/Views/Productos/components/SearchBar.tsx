import React, { useEffect, useState } from "react";
import { Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => Promise<void>;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearch,
  suggestions,
  onSelectSuggestion,
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sincroniza el estado interno si el searchQuery cambia desde afuera
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSearch = async () => {
    if (query.trim() === "") return;
    await onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSelectSuggestion(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div style={{ position: "relative" }}>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="🔍 Buscar productos por nombre o ID"
            value={query}
            onChange={handleInputChange}
          />
          <Button variant="primary" onClick={handleSearch}>
            <FaSearch />
          </Button>
        </InputGroup>
      </Form>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ListGroup
          style={{
            position: "absolute",
            width: "100%",
            zIndex: 1000,
            maxHeight: "200px",
            overflowY: "auto",
            borderTop: "none",
          }}
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <ListGroup.Item
              key={idx}
              action
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SearchBar;
