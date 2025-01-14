import styles from './HomeProducto.module.css';
import { useAppSelector, useAppDispatch } from '../../../../../../store/hook';
import { addProducto } from '../../../../../../store/Productos/productosSlice';

const HomeProducto = () => {

  const { allProductos } = useAppSelector((state) => state.productos)
  const dispatch = useAppDispatch()

  const producto = {
    img: 'dsdas',
    nombre: 'Zapatilla Nike',
    sku: 'SKU21321',
    precio: 10000,
    precioMayor: 200000,
    cantidad: 123
  }

  console.log(allProductos)

  return (
    <section className={`${styles.HomeProducto}`}>
      <div className={`${styles.header__HomeProducto}`}>
        <h1>Todos los Productos</h1>
      </div>
      <div className={`${styles.container__HomeProducto}`}>
        <div className={`${styles.search__HomeProducto}`} >
          <input
            className={`form-control ${styles.input__HomeProducto}`}
            placeholder='Buscar producto'
          />
          <input
            className={`form-select ${styles.select__HomeProducto}`}
            placeholder='Filtros'
          />
          <button
            onClick={() => dispatch(addProducto(producto))}
            className={`btn btn-primary ${styles.btn__HomeProducto}`}
          >
            Agregar Producto
          </button>
        </div>
        <table className='table'>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio normal</th>
              <th>Precio por mayor</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {
              allProductos.map((producto) => (
                <tr key={producto.sku}>
                  <td>{producto.img}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.sku}</td>
                  <td>{producto.precio}</td>
                  <td>{producto.precioMayor}</td>
                  <td>{producto.cantidad}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HomeProducto;