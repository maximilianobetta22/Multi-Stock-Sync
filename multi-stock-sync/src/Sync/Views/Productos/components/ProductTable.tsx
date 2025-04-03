import React from "react";
import {
  Accordion,
  Table,
  FormControl,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { ProductTableProps } from "../types/product.type";

const ProductTable: React.FC<ProductTableProps> = ({
  categorizedProducts,
  categories,
  isEditing,
  stockEdit,
  onStockChange,
  formatPriceCLP,
  translateStatus,
  onUpdateStatus,
}) => {
  //const [editingProductId, setEditingProductId] = useState<string | null>(null);

  /*const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    productId: string
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    const product = categorizedProducts[
      Object.keys(categorizedProducts).find((categoryId) =>
        categorizedProducts[categoryId].some((p) => p.id === productId)
      )!
    ].find((p) => p.id === productId)!;
    onEditProduct({ ...product, [name]: value });
  };*/

  return (
    <Accordion defaultActiveKey="0">
      {Object.keys(categorizedProducts).map((categoryId, index) => (
        <Accordion.Item eventKey={index.toString()} key={categoryId}>
          <Accordion.Header>{categories[categoryId]}</Accordion.Header>
          <Accordion.Body>
            <Table borderless hover>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorizedProducts[categoryId].map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        width="50"
                      />
                    </td>
                    <td>{product.title}</td>
                    <td>{categories[product.category_id]}</td>
                    <td>{formatPriceCLP(product.price)}</td>
                    <td>
                      {isEditing[product.id] ? (
                        <FormControl
                          type="number"
                          value={
                            stockEdit[product.id] || product.available_quantity
                          }
                          onChange={(e) =>
                            onStockChange(product.id, parseInt(e.target.value))
                          }
                        />
                      ) : (
                        product.available_quantity
                      )}
                    </td>
                    <td>{translateStatus(product.status)}</td>
                    <td>
                      <DropdownButton
                        id="dropdown-basic-button"
                        title={<FontAwesomeIcon icon={faEllipsis} />}
                      >
                        <Dropdown.Item
                          as={Link}
                          to={`/sync/productos/editar/${product.id}`}
                        >
                          Editar
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => onUpdateStatus(product.id, "paused")}
                        >
                          Pausar
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => onUpdateStatus(product.id, "active")}
                        >
                          Activar
                        </Dropdown.Item>
                      </DropdownButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default ProductTable;
