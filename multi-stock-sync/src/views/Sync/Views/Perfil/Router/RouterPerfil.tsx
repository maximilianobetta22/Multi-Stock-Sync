import { Navigate, Route, Routes } from "react-router-dom";
import HomePerfil from "../Home/HomePerfil";

function RouterPerfil(){
    return(
        <Routes>
            <Route path="/home" element={<HomePerfil/>}></Route>

            <Route path="/*" element={<Navigate to="/sync/perfil/home"/>}/>
        </Routes>
    );
};
export default RouterPerfil;