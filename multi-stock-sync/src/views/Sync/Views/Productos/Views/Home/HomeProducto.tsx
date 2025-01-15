import styles from './HomeProducto.module.css';
import { useAppSelector, useAppDispatch } from '../../../../../../store/hook';
import { startGetAllProductos } from '../../../../../../store/Productos/thunks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const HomeProducto = () => {

  const { allProductos } = useAppSelector((state) => state.productos)
  const dispatch = useAppDispatch()

  return (
    <section className={`${styles.HomeProducto}`}>
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
            onClick={() => dispatch(startGetAllProductos())}
            className={`btn btn-primary ${styles.btn__HomeProducto}`}
          >
            Actualizar productos
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
              allProductos?.map((producto) => (
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
        <button className={styles.btn__add}>
          <FontAwesomeIcon className={styles.icon__add} icon={faPlus}/>
        </button>
      </div>
    </section>
  );
};

export default HomeProducto;