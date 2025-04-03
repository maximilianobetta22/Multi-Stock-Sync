import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Product, ProductModalProps } from "../types/product.type";

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onHide,
  product,
  onUpdateStock,
  onStockChange,
  stockEdit,
}) => {
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedProduct) return;
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSubmit = () => {
    if (!editedProduct) return;
    onUpdateStock(editedProduct.id, parseInt(editedProduct.site_id));
    onHide();
  };

  if (!product) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formProductId">
            <Form.Label>ID</Form.Label>
            <Form.Control
              type="text"
              name="id"
              value={editedProduct?.id || ""}
              onChange={handleChange}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="formProductThumbnail">
            <Form.Label>Thumbnail</Form.Label>
            <Form.Control
              type="text"
              name="thumbnail"
              value={editedProduct?.thumbnail || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formProductSiteId">
            <Form.Label>Site ID</Form.Label>
            <Form.Control
              type="text"
              name="site_id"
              value={editedProduct?.site_id || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formProductTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={editedProduct?.title || ""}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formProductStock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={stockEdit[product.id] || product.available_quantity}
              onChange={(e) =>
                onStockChange(product.id, parseInt(e.target.value))
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
