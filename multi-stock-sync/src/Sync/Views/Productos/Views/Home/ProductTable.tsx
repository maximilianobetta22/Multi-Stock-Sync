import React, { useState } from "react";
import { Accordion, Table, Button, FormControl } from "react-bootstrap";
import { motion } from "framer-motion";
import ProductActionsDropdown from "./ProductActionsDropdown";

interface Product {
  id: string;
  thumbnail: string;
  site_id: string;
  title: string;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  price: number;
  base_price: number;
  available_quantity: number;
  permalink: string;
  status: string;
}

interface ProductTableProps {
  categorizedProducts: { [key: string]: Product[] };
  categories: { [key: string]: string };
  isEditing: { [key: string]: boolean };
  stockEdit: { [key: string]: number };
  onStockChange: (productId: string, newStock: number) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onOpenModal: (product: Product) => void;
  formatPriceCLP: (price: number) => string;
  translateStatus: (status: string) => string;
  onUpdateStatus: (productId: string, newStatus: string) => void;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void; // Add this prop
}

const ProductTable: React.FC<ProductTableProps> = ({
  categorizedProducts,
  categories,
  isEditing,
  stockEdit,
  onStockChange,
  onUpdateStock,
  onOpenModal,
  formatPriceCLP,
  translateStatus,
  onUpdateStatus,
  onSelectProduct,
  onEditProduct, // Destructure the new prop
}) => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEditClick = (productId: string) => {
    setEditingProductId(productId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const { name, value } = e.target as HTMLInputElement;
    const product = categorizedProducts[Object.keys(categorizedProducts).find(categoryId => categorizedProducts[categoryId].some(p => p.id === productId))!].find(p => p.id === productId)!;
    onEditProduct({ ...product, [name]: value });
  };

  return (
    <Accordion defaultActiveKey="0">
      {Object.keys(categorizedProducts).map((categoryId, index) => (
        <Accordion.Item eventKey={index.toString()} key={categoryId}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              style={{ border: '1px solid #dee2e6', borderRadius: '5px' }}
            >
              <Accordion.Header>
                {categories[categoryId] || categoryId} (Cantidad: {categorizedProducts[categoryId].length})
              </Accordion.Header>
            </div>
            <Accordion.Body>
              <div className="table-container">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th className="table_header">Imágen</th>
                      <th className="table_header">ID MLC</th>
                      <th className="table_header">Título</th>
                      <th className="table_header">Código categoría</th>
                      <th className="table_header">Precio CLP</th>
                      <th className="table_header">Stock MercadoLibre</th>
                      <th className="table_header">Bodega asignada</th>
                      <th className="table_header">Stock Bodega</th>
                      <th className="table_header">Status</th>
                      <th className="table_header">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorizedProducts[categoryId].map((producto) => (
                      <motion.tr
                        key={producto.id}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => onSelectProduct(producto)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="text-center">
                          <motion.img
                            src={producto.thumbnail}
                            className="rounded"
                            alt={`Imagen del producto: ${producto.title}`}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </td>
                        <td>{producto.id}</td>
                        <td>
                          {editingProductId === producto.id ? (
                            <FormControl
                              type="text"
                              name="title"
                              value={producto.title}
                              onChange={(e) => handleInputChange(e, producto.id)}
                            />
                          ) : (
                            producto.title
                          )}
                        </td>
                        <td>{producto.category_id}</td>
                        <td>
                          {editingProductId === producto.id ? (
                            <FormControl
                              type="number"
                              name="price"
                              value={producto.price}
                              onChange={(e) => handleInputChange(e, producto.id)}
                            />
                          ) : (
                            formatPriceCLP(producto.price)
                          )}
                        </td>
                        <td>{producto.available_quantity}</td>
                        <td>no especificada</td>
                        <td>no especificado</td>
                        <td>{translateStatus(producto.status)}</td>
                        <td>
                          <ProductActionsDropdown
                            productId={producto.id}
                            onEdit={handleEditClick}
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Accordion.Body>
          </motion.div>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default ProductTable;
