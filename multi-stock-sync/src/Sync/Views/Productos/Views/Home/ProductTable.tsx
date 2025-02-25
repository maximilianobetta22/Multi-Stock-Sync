import React from "react";
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
  onSelectProduct: (product: Product) => void; // Add this prop
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
  onSelectProduct, // Destructure the new prop
}) => {
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
                        onClick={() => onSelectProduct(producto)} // Add onClick to select product
                        style={{ cursor: 'pointer' }} // Add cursor pointer for better UX
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
                        <td>{producto.title}</td>
                        <td>{producto.category_id}</td>
                        <td>{formatPriceCLP(producto.price)}</td>
                        <td>
                          {producto.available_quantity}
                          {isEditing[producto.id] && (
                            <>
                              <FormControl
                                type="number"
                                value={stockEdit[producto.id] || producto.available_quantity}
                                onChange={(e) => onStockChange(producto.id, parseInt(e.target.value))}
                                min="0"
                                className="d-inline-block w-50"
                              />
                              <motion.button
                                className="btn btn-success ms-2"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={async () => {
                                  await onUpdateStock(producto.id, stockEdit[producto.id]);
                                }}
                              >
                                Guardar
                              </motion.button>
                            </>
                          )}
                        </td>
                        <td>no especificada</td>
                        <td>no especificado</td>
                        <td>{translateStatus(producto.status)}</td>
                        <td>
                          <ProductActionsDropdown
                            productId={producto.id}
                            onUpdateStatus={onUpdateStatus}
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
