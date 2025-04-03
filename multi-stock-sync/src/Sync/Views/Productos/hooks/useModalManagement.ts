import { useState } from 'react';
import { Product } from '../types/product.type';

export const useModalManagement = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [modalContent, setModalContent] = useState<"main" | "stock" | "pause">("main");

  const openModal = (product: Product) => {
    setCurrentProduct(product);
    setModalContent("main");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentProduct(null);
  };

  return {
    modalIsOpen,
    currentProduct,
    modalContent,
    setModalContent,
    openModal,
    closeModal
  };
};