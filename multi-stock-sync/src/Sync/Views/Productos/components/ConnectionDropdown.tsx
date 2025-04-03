import React from "react";
import { Form } from "react-bootstrap";
import { ConnectionDropdownProps } from "../types/connection.type";

const ConnectionDropdown: React.FC<ConnectionDropdownProps> = ({
  connections = [],
  selectedConnection = "",
  onChange,
}) => {
  const handleConnectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChange(event.target.value);
  };

  if (!Array.isArray(connections)) {
    console.warn("Connections is not an array:", connections);
    return (
      <Form.Select disabled>
        <option>Error loading connections</option>
      </Form.Select>
    );
  }

  return (
    <Form.Select
      value={selectedConnection}
      onChange={handleConnectionChange}
      disabled={connections.length === 0}
    >
      <option value="">
        {connections.length === 0
          ? "Cargando conexiones..."
          : "Seleccione una conexión"}
      </option>
      {connections.map((connection) => (
        <option key={connection.client_id} value={connection.client_id}>
          {connection.nickname}
        </option>
      ))}
    </Form.Select>
  );
};

export default ConnectionDropdown;
