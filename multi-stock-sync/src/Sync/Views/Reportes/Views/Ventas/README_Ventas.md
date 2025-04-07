# 📦 Módulo de Ventas – Refactorización

**Desarrollado por:** Francisca Arredondo  
**Fecha:** Abril 2025  
**Rama de trabajo:** `francisca_dev`  
**Ubicación:** `src/pages/.../Ventas/`

---

##  Objetivo

Refactorizar el componente `Ventas.tsx` para mejorar su legibilidad, estructura y mantenibilidad.  
El componente original contenía demasiada lógica agrupada, por lo que se modularizó según responsabilidades específicas.

---

##  Cambios realizados

- ✨ **Separación de filtros** en el componente `FiltrosVentas.tsx`
- ✨ **Tabla de datos** movida a `TablaVentas.tsx`
- ✨ **Gráfico de barras** modularizado en `GraficoVentas.tsx` (con configuración de Chart.js)
- ✨ **Lógica de exportación (PDF / Excel)** extraída a `exportUtils.ts`
- 🧹 Limpieza de `Ventas.tsx` para enfocarlo como contenedor y orquestador visual

---

##  Motivación

- El archivo original tenía múltiples responsabilidades juntas
- Al modularizar:
  - Se mejora la **legibilidad** del código
  - Se facilita el **mantenimiento**
  - Se vuelve escalable y reutilizable para otros componentes similares

---

##  Próximos pasos (pendientes)

- Aplicar este mismo patrón a `VentasPorMes`, `VentasPorDía` y `VentasPorYear` si corresponde
- Subir commit final a `francisca_dev` con mensaje claro
- Validar con el equipo si se desea hacer `merge` a una rama principal

---

## Notas adicionales

- Todas las funciones y componentes están debidamente tipados con TypeScript
- Se utilizó `useCallback` y `useMemo` para optimizar el rendimiento
- El gráfico se basa en `react-chartjs-2` con configuración limpia y desacoplada


