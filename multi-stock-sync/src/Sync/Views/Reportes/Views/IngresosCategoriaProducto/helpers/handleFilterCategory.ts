import { Dispatch } from "react";
import { actionType } from "../Context";
import { Categoria } from "../Interfaces/interfaces";

export const handleFilterCategory = (nameCategoria: string = 'Todo', dispatch: Dispatch<actionType>, categorias: Categoria[]) => {
  if(nameCategoria === 'Todo'){
    dispatch({
      type: 'updateCategoriasFiltradas',
      payload: categorias
    });
    dispatch({
      type: 'updateCategoriaActiva',
      payload: nameCategoria
    })
  }else{
    dispatch({
    type: 'updateCategoriasFiltradas',
    payload: categorias.filter((categoria) => categoria.category === nameCategoria)
    });
    dispatch({
      type: 'updateCategoriaActiva',
      payload: nameCategoria
    })
  }
};