// src/components/Card.tsx
import React from 'react';
import styled, {} from 'styled-components';

export interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}


const Styled = styled.div` /* Estilos del componente Card */
  width: 350px;
  height: 200px;
  perspective: 800px;
  cursor: pointer;

  .card-inner { // Contenedor interno para el efecto 3D
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.3s;
    border-radius: 6px;
    background: #151515;
  }

  &:hover .card-inner { // Efecto al pasar el mouse
    transform: rotatex(180deg);
  }

  .front, .back { // Estilos comunes para ambas caras
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
  }

  /* FRONT: fondo oscuro + línea plateada + franja naranja */
  .front {
    background: linear-gradient(
      to bottom,
rgb(132, 0, 107) 0%, 
rgb(67, 0, 54) 100%);
    justify-content: center;
  }

  .front-content { // Contenido de la parte frontal
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .front-content .icon { // Icono del componente
    font-size: 2rem;
  }

  .front-content .title { // Título del componente
    font-size: 1rem;
    font-weight: bold;
    color: #FFF;
  }

  /* BACK: diseño original + descripción scrollable */
  .back {
    transform: rotateX(180deg);
    background: #000;
    padding: 0.1rem;
    justify-content: flex-start;
  }

  .back-content { // Contenido de la parte trasera
    position: relative;
    top: 2%;
    z-index: 0;
    width: 95%;
    height: 95%;
    background: linear-gradient(
      #333333 0%,
      #333333 80%,
      #C0C0C0 80%,
      #C0C0C0 85%,
      #FF6A00 85%,
      #FF6A00 100%);
    border-radius: 1px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    overflow-y: auto;
  }

  .back-content .description // Descripción del componente
    color:rgb(255, 255, 255); // Color del texto
    font-size: 0.85rem; // Tamaño de la fuente
    text-align: left; // Alineación del texto
    line-height: 1.4; // Altura de línea
    word-break: break-word; //romper palabras largas scrollable
    margin: 0; // Margen del párrafo
  }
`;

const Card: React.FC<CardProps> = ({ // Props
  title,
  description,
  icon,
  onClick,
}) => (
  <Styled onClick={onClick}> 
    <div className="card-inner"> // Contenido del componente
      {/* FRONT */} // Parte frontal del componente
      <div className="front">
        <div className="front-content">
          {icon && <div className="icon">{icon}</div>}
          <div className="title">{title}</div>
        </div>
      </div>

      {/* BACK */} // Parte trasera del componente
      <div className="back">
        <div className="back-content">
          <p className="description">{description}</p>
        </div>
      </div>
    </div>
  </Styled>
);

export default Card;
