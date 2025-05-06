import React, { useMemo } from 'react';
import { Typography, Table, Space, Button, Spin, Alert } from 'antd';
import { EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons'; // Iconos bonitos

// Esto nos trae la lista de borradores guardados.
import useBorradoresVenta, { BorradorAPI } from '../Hooks/BorradoresVenta';

// Para poner títulos grandes.
const { Title } = Typography;

// Esta pantalla muestra las notas de venta que no se terminaron (borradores/pendientes).
const BorradoresVenta: React.FC = () => {
    // Pedimos al "gancho" (hook) la lista, si está cargando, y si hay errores.
    const { borradores, cargandoBorradores, errorBorradores, cargarBorradores } = useBorradoresVenta();

    // Decimos cómo se ve la tabla (las columnas).
    const columnasBorradores = useMemo(() => [
        {
            title: 'Número', // El número del borrador
            dataIndex: 'id', // Usamos el ID que viene de atrás (backend)
            key: 'id',
        },
        {
            title: 'Cuándo se hizo', // La fecha en que se creó
            dataIndex: 'created_at', // Este campo trae la fecha
            key: 'created_at',
            render: (text: string) => new Date(text).toLocaleDateString(), // La mostramos bonita (solo fecha)
        },
        {
            title: 'Para quién', // A qué cliente iba
            dataIndex: 'client_id', // El ID del cliente
            key: 'client_id',
            // Aquí podrías mostrar el nombre del cliente real si lo tuvieras.
            render: (clientId: number | null) => clientId ? `Cliente ID: ${clientId}` : 'Sin cliente', // Mostramos el ID o "Sin cliente"
        },
         {
            title: 'Será', // Si es boleta o factura al final
            dataIndex: 'type_emission', // El campo que dice si es 'boleta' o 'factura'
            key: 'type_emission',
            render: (text: string) => text.toUpperCase(), // Lo ponemos en mayúsculas
        },
        {
            title: 'Total', // Cuánto suma todo
            dataIndex: 'price_final', // El campo que trae el total
            key: 'price_final',
            render: (text: number) => `$${text?.toFixed(2) || '0.00'}`, // Le ponemos el signo $ y dos decimales
        },
        {
            title: 'Qué hacer', // Botones para las acciones
            key: 'acciones',
            render: (_text: any, record: BorradorAPI) => (
                <Space size="small"> // Ponemos los botones juntitos
                    {/* Botón para seguir trabajando en este borrador */}
                    {/* Falta hacer que funcione para ir a la otra pantalla con este borrador */}
                    <Button
                        icon={<EditOutlined />} // Icono de lápiz
                        size="small" // Botón pequeño
                        onClick={() => {
                            console.log("Hay que cargar el borrador con ID:", record.id);
                            // Aquí va el código para ir a la otra pantalla (NuevaVenta)
                            // Y decirle a la otra pantalla qué borrador cargar por su ID.
                        }}
                    >
                        Cargar
                    </Button>
                    {/* Botón para botar este borrador */}
                    {/* Falta hacer que funcione para borrarlo de verdad */}
                    <Button
                        icon={<DeleteOutlined />} // Icono de basura
                        size="small" // Botón pequeño
                        danger // Lo pone rojo para que se note que es peligroso
                        onClick={() => {
                            console.log("Hay que borrar el borrador con ID:", record.id);
                            // Aquí va el código para llamar a la API y borrarlo.
                            // Después de borrar, hay que pedir la lista otra vez (llamar a cargarBorradores).
                        }}
                    >
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ], []); // Las columnas no cambian, se quedan quietas

    return (
        <div style={{ padding: "20px" }}> {/* Un espacio alrededor */}
            <Title level={3}>Cosas que no terminaste (Borradores)</Title> {/* Título de la pantalla */}

            {/* Botón para pedir la lista de nuevo */}
            <Button icon={<SyncOutlined />} onClick={cargarBorradores} disabled={cargandoBorradores}>
                Cargar de nuevo
            </Button>

            {/* Si está cargando, muestra un círculo dando vueltas */}
            {cargandoBorradores && <div style={{ textAlign: 'center', marginTop: '20px' }}><Spin tip="Buscando borradores..." /></div>}
            {/* Si hubo un error, muestra un mensaje rojo */}
            {errorBorradores && <Alert message={`Algo salió mal: ${errorBorradores}`} type="error" showIcon style={{ marginTop: '20px' }} />}

            {/* Si no hay error y ya terminó de cargar, muestra la tabla */}
            {!cargandoBorradores && !errorBorradores && (
                 <div style={{ marginTop: '20px' }}> {/* Otro espacio arriba de la tabla */}
                    <Table
                        dataSource={borradores} // Los datos vienen de lo que trajo el gancho (hook)
                        columns={columnasBorradores} // Usamos las columnas que definimos
                        rowKey="id" // Para que la tabla sepa cuál es cuál (usa el ID)
                        pagination={{ pageSize: 10 }} // Que muestre 10 por página
                        locale={{ emptyText: 'No hay nada sin terminar guardado.' }} // Mensaje si la lista está vacía
                    />
                 </div>
            )}
        </div>
    );
};

export default BorradoresVenta;