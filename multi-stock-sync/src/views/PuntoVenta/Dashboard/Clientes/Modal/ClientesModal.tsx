import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ClientesModal: React.FC<{ show: boolean, handleClose: () => void, selectedClient: any }> = ({ show, handleClose, selectedClient }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formTipoCliente">
                        <Form.Label>Tipo de Cliente</Form.Label>
                        <Form.Control as="select">
                            <option>empresa</option>
                            <option>persona</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formClienteExtranjero">
                        <Form.Label>Cliente Extranjero</Form.Label>
                        <Form.Control as="select">
                            <option>no</option>
                            <option>sí</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formRut">
                        <Form.Label>Rut</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formRazonSocial">
                        <Form.Label>Razón Social</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formGiro">
                        <Form.Label>Giro</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formNombres">
                        <Form.Label>Nombres</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formApellidos">
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formDireccion">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formComuna">
                        <Form.Label>Comuna</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formCiudad">
                        <Form.Label>Ciudad</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                    <Form.Group controlId="formRegion">
                        <Form.Label>Región</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" type="submit">
                    Guardar <FontAwesomeIcon icon={faCheckCircle} />
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ClientesModal;
