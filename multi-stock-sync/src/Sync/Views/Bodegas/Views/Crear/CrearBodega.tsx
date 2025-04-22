import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import axiosInstance from "../../../../../axiosConfig";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Company } from "../../Types/warehouse.type";
import { Form, Input, Select, Button } from "antd";
import style from "./CrearBodega.module.css";

const CrearBodega: React.FC = () => {
  // Estado para almacenar las compañías disponibles
  const [companies, setCompanies] = useState<Company[]>([]);
  // Estado para manejar el estado de carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar mensajes de notificación
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "danger">("success");
  // Instancia del formulario de Ant Design
  const [form] = Form.useForm();

  // Efecto para cargar las compañías al montar el componente
  useEffect(() => {
    axiosInstance
      .get(`${process.env.VITE_API_URL}/companies`)
      .then((response) => {
        setCompanies(response.data); // Guardar las compañías en el estado
        setLoading(false); // Desactivar el estado de carga
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        setLoading(false); // Desactivar el estado de carga incluso si hay error
      });
  }, []);

  // Efecto para manejar el cierre automático del toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Función para manejar el envío del formulario
  const handleSubmit = (values: any) => {
    setLoading(true); // Activar el estado de carga
    axiosInstance
      .post(`${process.env.VITE_API_URL}/warehouses`, values)
      .then((response) => {
        console.log("Success:", response.data);
        setToastMessage("Bodega creada con éxito."); // Mostrar mensaje de éxito
        setToastType("success");
        form.resetFields(); // Reiniciar los campos del formulario
        setLoading(false); // Desactivar el estado de carga
      })
      .catch((error) => {
        console.error("Error:", error.response?.data || error);
        setToastMessage("Datos inválidos."); // Mostrar mensaje de error
        setToastType("danger");
        setLoading(false); // Desactivar el estado de carga
      });
  };

  // Función para cerrar el toast manualmente
  const closeToast = () => {
    setToastMessage(null);
  };

  // Mostrar un indicador de carga mientras se obtienen las compañías
  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className={style.container}>
      {/* Formulario para crear una bodega */}
      <Form
        form={form}
        name="crearBodegas"
        className={style.form}
        onFinish={handleSubmit} // Manejar el envío del formulario
      >
        {/* Botón para regresar */}
        <Button htmlType="button">
          <Link to="../homebodega">
            <FontAwesomeIcon icon={faArrowLeft} /> regresar
          </Link>
        </Button>
        <h1 className="my-4">Crear Bodega</h1>

        {/* Campo para el nombre de la bodega */}
        <Form.Item
          name="name"
          label="Nombre: "
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        {/* Campo para la ubicación de la bodega */}
        <Form.Item
          name="location"
          label="Ubicación de bodega: "
          rules={[{ required: true, message: "La ubicación es obligatoria" }]}
        >
          <Input />
        </Form.Item>

        {/* Campo para seleccionar la compañía asignada */}
        <Form.Item
          name="assigned_company_id"
          label="Asigna una compañía: "
          rules={[{ required: true, message: "Debes asignar una compañía" }]}
        >
          <Select placeholder="Selecciona una compañía">
            {companies.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Botón para enviar el formulario */}
        <Button type="primary" htmlType="submit" className={style.btn}>
          Crear
        </Button>
      </Form>

      {/* Componente de notificación */}
      {toastMessage && (
        <ToastComponent
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default CrearBodega;
