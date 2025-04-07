# 📊 VentasPorMes

**Autor:** Francisca Arredondo  
**Rama:** `francisca_dev`  
**Fecha:** Abril 2025

---

## ✅ Objetivo

Mostrar las ventas mensuales por cliente, permitiendo seleccionar año y mes. Visualiza los productos vendidos en un gráfico horizontal, muestra el total mensual, y permite exportar los datos en PDF o Excel.

---

## 📁 Estructura del módulo
**VentasPorMes**

VentasPorMes.tsx → Componente principal con lógica de filtros, datos y modal 
GraficoPorMes.tsx → Gráfico de barras horizontal (Chart.js) 
exportUtilsPorMes.ts → Funciones para generar y guardar PDF y Excel 
VentasPorMes.module.css → Estilos del módulo 
README_VentasPorMes.md → Este documento

---

## 🛠️ Funcionalidades implementadas

- Filtro por año y mes
- Gráfico horizontal con `react-chartjs-2` y `chartjs-plugin-datalabels`
- Modal con detalles de las ventas del mes
- Exportación a PDF con vista previa (`jsPDF` + `autoTable`)
- Exportación directa a archivo Excel (`xlsx`)
- Separación de lógica en componentes reutilizables y utilidades externas

---

## 📌 Recomendaciones futuras

- Agregar manejo de errores visual con toasts para PDF/Excel
- Aplicar esta estructura modular a otros reportes (día, año)
- Considerar paginación si hay muchas ventas

---