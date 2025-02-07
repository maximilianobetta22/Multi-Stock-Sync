import { Navigate, Route, Routes } from "react-router-dom";
import ListConexiones from "../Views/ListConexiones/ListConexiones";
import AuthMercadoLibre from "../Views/AuthMercadoLibre/AuthMercadoLibre";


function RouterConexiones(){
    return(
        <Routes>
            <Route path="/home" element={<ListConexiones/>}></Route>
            <Route path="/login" element={<AuthMercadoLibre/>}></Route>
            <Route path="/*" element={<Navigate to="/sync/conexiones/home"/>}/>
        </Routes>
    );
};
export default RouterConexiones;