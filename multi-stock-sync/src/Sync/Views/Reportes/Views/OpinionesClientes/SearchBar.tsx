import React from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearch }) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('searchQuery') as string;
    onSearch(query);
  };

  return (
    <Form onSubmit={handleSearch} className="d-flex mb-3">
      <FormControl
        type="text"
        name="searchQuery"
        placeholder="Buscar cliente"
        defaultValue={searchQuery}
        className="me-2"
      />
      <Button type="submit" variant="primary">Buscar</Button>
    </Form>
  );
};

export default SearchBar;