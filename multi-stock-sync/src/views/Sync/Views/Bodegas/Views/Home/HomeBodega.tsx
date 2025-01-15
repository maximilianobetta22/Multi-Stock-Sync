import styles from './HomeBodega.module.css';

const HomeBodega = () => {
    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Home Bodega</h1>
            <p className="text-center">Estas son tus bodegas</p>
            <div className="row">
                {/*Tarjeta numero 1 de la bodega de chile express*/}
                <div className="col-md-4">
                <h5 className="card-title">Card title</h5>
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="#" className="btn btn-primary">Go somewhere</a>
                </div>
            </div>
        </div>
    );
};

export default HomeBodega;