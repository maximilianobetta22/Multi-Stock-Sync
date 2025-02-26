import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * ConnectionDropdown component provides a dropdown menu to select a connection.
 * 
 * @param {Object} props - Component props
 * @param {Object[]} props.connections - List of connections
 * @param {string} props.selectedConnection - Currently selected connection ID
 * @param {function} props.onChange - Function to handle connection change
 */
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
