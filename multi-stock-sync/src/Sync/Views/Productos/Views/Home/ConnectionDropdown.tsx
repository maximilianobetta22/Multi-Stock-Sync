import React from 'react';
import { Form } from 'react-bootstrap';

interface ConnectionDropdownProps {
  connections: { client_id: string; nickname: string }[];
  selectedConnection: string;
  onChange: (clientId: string) => void;
}

const ConnectionDropdown: React.FC<ConnectionDropdownProps> = ({ connections, selectedConnection, onChange }) => {
  const handleConnectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <Form.Select value={selectedConnection} onChange={handleConnectionChange}>
      <option value="">Seleccione una conexión</option>
      {connections.map((connection) => (
        <option key={connection.client_id} value={connection.client_id}>
          {connection.nickname}
        </option>
      ))}
    </Form.Select>
  );
};

export default ConnectionDropdown;
