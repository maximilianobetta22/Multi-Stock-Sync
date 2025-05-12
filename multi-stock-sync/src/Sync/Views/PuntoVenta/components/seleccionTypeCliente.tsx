import React from 'react';
import { Radio, Card, RadioChangeEvent } from 'antd';
import { clientType } from '../Types/clienteTypes';

interface ClientTypeSelectorProps {
  value: clientType;
  onChange: (type: clientType) => void;
  disabled?: boolean;
}

const ClienteTypeSelector: React.FC<ClientTypeSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const handleChange = (e: RadioChangeEvent) => {
    onChange(e.target.value);
  };

  return (
    <Card 
      title="Tipo de Cliente" 
      style={{ marginBottom: 16 }}
      bordered={false}
      headStyle={{ padding: 0 }}
      bodyStyle={{ padding: '12px 0' }}
    >
      <Radio.Group
        value={value}
        onChange={handleChange}
        optionType="button"
        buttonStyle="solid"
        disabled={disabled}
      >
        <Radio value={2}>Persona Natural</Radio>
        <Radio value={1}>Empresa</Radio>
      </Radio.Group>
    </Card>
  );
};

export default ClienteTypeSelector;