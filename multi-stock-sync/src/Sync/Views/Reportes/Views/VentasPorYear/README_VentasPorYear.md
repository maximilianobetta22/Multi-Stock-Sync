# 📊 VentasPorYear

**Autor:** Francisca Arredondo  
**Rama:** `francisca_dev`  
**Fecha:** Abril 2025

---

## ✅ Objetivo

Visualizar todas las ventas anuales de un cliente específico. El módulo permite seleccionar un año, ver el total de ventas mensuales, analizar productos vendidos por mes y generar reportes detallados en PDF y Excel.

---

## 📁 Estructura del módulo
VentasPorYear/
VentasPorYear.tsx → Componente principal (filtros, gráficos, PDF, Excel) 
GraficoPorYear.tsx → Gráfico de barras modular (Chart.js) 
exportUtilsPorYear.ts → Funciones para exportar a PDF y Excel 
VentasPorYear.module.css → (No utilizado actualmente) 
README_VentasPorYear.md → Este archivo


---

## 🛠️ Funcionalidades implementadas

- Filtro por año
- Gráfico de barras por mes (ingresos totales)
- Vista detallada por mes y productos vendidos
- Exportación de reporte PDF con vista previa
- Exportación directa a archivo Excel
- Colores de barra aleatorios para mejor visualización
- Modularización del gráfico y lógica de exportación

---

## 📌 Recomendaciones futuras

- Aplicar estilos en `VentasPorYear.module.css` (actualmente vacío)
- Agregar un selector de cliente si se reutiliza para administración general
- Agregar animaciones o transiciones suaves para el detalle expandible

---
