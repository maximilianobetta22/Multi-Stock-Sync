import React from 'react';
import { Checkbox, CheckboxChangeEvent, Form, Input } from 'antd';
import DireccionForm from './direccionFormulario';
import {  validateTaxId } from '../utils/validations';

const CompañiaForm: React.FC = () => {
  const [esExtranjero, setEsExtranjero]= React.useState(0);
  const handleExtranjeroChange = (e: CheckboxChangeEvent) => {
    // e.target.checked es un booleano, lo convertimos a 0 o 1
    setEsExtranjero(e.target.checked ? 1 : 0);
  };
  
  return (
    <>
      <Form.Item
        label="Razón Social"
        name="razon_social"
        rules={[{ required: true, message: 'Ingrese la razón social' }]}
      >
        <Input placeholder="Ej: Empresa S.A." />
      </Form.Item>

      <Form.Item
        label="RUT"
        name="rut"
        rules={[
          { required: true, message: 'Ingrese el RUT de la empresa' },
          { validator: validateTaxId }
        ]}
      >
        <Input placeholder="Ej: 12345678-9" />
      </Form.Item>

      <Form.Item
        label="Nombres"
        name="nombres"
        rules={[{ required: true, message: 'Ingrese los nombres' }]}
      >
        <Input placeholder="Ej: Juan carlos" />
      </Form.Item>
      <Form.Item
        label="Apellidos"
        name="apellidos"
        rules={[{ required: true, message: 'Ingrese los apellidos' }]}
      >
        <Input placeholder="Ej: Pérez González" />
      </Form.Item>

      <Form.Item
        label="giro"
        name="giro"
        rules={[
          { required: true, message: 'Ingrese el giro' },
        ]}
      >
        <Input placeholder="Ej: Comercio minorista" />
      </Form.Item>
      

      <DireccionForm />
      <Form.Item
        label="Es empresa extranjera"
        name="extranjero"
        valuePropName="checked"
        getValueFromEvent={(e: CheckboxChangeEvent) => e.target.checked ? 1 : 0}
        initialValue={esExtranjero === 1}
      >
        <Checkbox onChange={handleExtranjeroChange}>
          Marque si la empresa es extranjera
        </Checkbox>
      </Form.Item>
    </>
  );
};

export default CompañiaForm;