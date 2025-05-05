import React from 'react';
import { Checkbox, Form, Input } from 'antd';
import DireccionForm from './direccionFormulario';
import { validateDni } from '../utils/validations';

const PersonaNatForm: React.FC = () => {
    const [esExtranjero, setEsExtranjero]= React.useState(0);
    const handleExtranjeroChange = (e) => {
      // e.target.checked es un booleano, lo convertimos a 0 o 1
      setEsExtranjero(e.target.checked ? 1 : 0);
    };
  return (
    <>
      <Form.Item
        label="Nombres"
        name="nombres"
        rules={[{ required: true, message: 'Ingrese los nombres' }]}
      >
        <Input placeholder="Ej: Juan Carlos" />
      </Form.Item>

      <Form.Item
        label="Apellidos"
        name="apellidos"
        rules={[{ required: true, message: 'Ingrese los apellidos' }]}
      >
        <Input placeholder="Ej: Pérez García" />
      </Form.Item>

      <Form.Item
        label="DNI/RUT"
        name="rut"
        rules={[
          { required: true, message: 'Ingrese el documento de identidad' },
          { validator: validateDni }
        ]}
      >
        <Input placeholder="Ej: 12345678-9" />
      </Form.Item>
    


      <DireccionForm/>
      <Form.Item
        label="Es empresa extranjera"
        name="extranjero"
        valuePropName="checked"
        getValueFromEvent={(e) => e.target.checked ? 1 : 0}
        initialValue={esExtranjero === 0}
      >
        <Checkbox onChange={handleExtranjeroChange}>
          Marque si el cliente es extranjero
        </Checkbox>
      </Form.Item>
    </>
  );
};

export default PersonaNatForm;