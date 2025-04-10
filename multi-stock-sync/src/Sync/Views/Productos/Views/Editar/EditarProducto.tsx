import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import { productService } from "../../service/productService";
import styles from "./EditarProducto.module.css";

interface Producto {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
}

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await productService.fetchProducts("", "", 35, 0, "");
        const productoEncontrado = response.results.find((p: Producto) => p.id === id);
        setProducto(productoEncontrado);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProducto((prev: Producto | null) =>
      prev ? { ...prev, [name]: name === "price" || name === "available_quantity" ? parseFloat(value) : value } : null
    );
  };

  const handleActualizar = async () => {
    if (!producto) return;
    try {
      await productService.updateProduct(producto);
      alert("Producto actualizado con éxito");
      navigate("/productos");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const handleEliminar = async () => {
    if (!producto) return;
    try {
      await productService.deleteProduct(producto.id);
      alert("Producto eliminado con éxito");
      navigate("/productos");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  if (loading) return <p className="text-center">Cargando producto...</p>;
  if (!producto) return <p className="text-center">Producto no encontrado</p>;

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Card.Body>
          <Card.Title className="text-center">Editar Producto</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID del Producto</Form.Label>
              <Form.Control value={producto.id} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={producto.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={producto.price}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="available_quantity"
                value={producto.available_quantity}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="success" onClick={handleActualizar}>
              Actualizar
            </Button>
            <Button variant="danger" onClick={handleEliminar}>
              Eliminar
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}