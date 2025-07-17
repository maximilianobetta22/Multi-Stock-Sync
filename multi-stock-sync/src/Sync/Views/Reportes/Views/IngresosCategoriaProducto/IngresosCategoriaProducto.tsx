import { useContext, useEffect, useState } from "react";
import { IngresosProductosContext } from "./Context";
import { exportToExcel, exportToPdf, formatNumber, handleDateEnd, handleDateInit, handleFilterCategory } from "./helpers";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";

type eventChange = React.ChangeEvent<HTMLInputElement>;
type eventForm = React.FormEvent<HTMLFormElement>;

const IngresosCategoriaProducto = () => {
  const { ProductoState, getVentas, dispatch } = useContext(IngresosProductosContext);
  const { categorias, isLoading, totalFinal, categoriasFiltradas, categoriaActiva, metodosPago } = ProductoState;
  const [initDate, setInitDate] = useState<string>(handleDateInit);
  const [endDate, setEndDate] = useState<string>(handleDateEnd);

  const handleInitDateChange = ({ target }: eventChange) => {
    const date = target.value;
    setInitDate(date);
    
    // Validación en tiempo real
    if (endDate && date > endDate) {
      alert('La fecha inicial no puede ser superior a la fecha final');
      return;
    }
  };

  const handleEndDateChange = ({ target }: eventChange) => {
    const date = target.value;
    setEndDate(date);
    
    // Validación en tiempo real
    if (initDate && initDate > date) {
      alert('La fecha inicial no puede ser superior a la fecha final');
      return;
    }
  };

  const handleSubmit = (e: eventForm) => {
    e.preventDefault();
    if (initDate === '' || endDate === '') return;
    
    // Validación de fechas
    if (initDate > endDate) {
      alert('La fecha inicial no puede ser superior a la fecha final');
      return;
    }
    
    getVentas(initDate, endDate);
  };

  useEffect(() => {
    getVentas(initDate, endDate);
  }, []);

  // Calculamos el porcentaje de cada categoría
  const categoriesWithPercentage = categoriasFiltradas.map(categoria => ({
    ...categoria,
    percentage: totalFinal > 0 ? (categoria.total / totalFinal) * 100 : 0
  }));

  // Colores para las categorías
  const categoryColors = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', 
    '#6f42c1', '#fd7e14', '#20c997', '#6610f2', '#e83e8c'
  ];

  const modernStyles = {
    container: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '24px',
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    leftPanel: {
      flex: '1',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '28px',
      border: '1px solid #e9ecef'
    },
    header: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    },
    dropdown: {
      position: 'relative' as const,
      display: 'inline-block'
    },
    dropdownButton: {
      padding: '10px 16px',
      backgroundColor: '#ffffff',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500' as const,
      color: '#495057',
      transition: 'all 0.2s ease',
      minWidth: '140px',
      textAlign: 'left' as const,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
    },
    dateInput: {
      padding: '10px 14px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#495057',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      outline: 'none'
    },
    searchButton: {
      padding: '10px 28px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
      outline: 'none'
    },
    // Estadísticas principales
    statsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      textAlign: 'center' as const,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    statTitle: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '0 0 12px 0',
      fontWeight: '500' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: '28px',
      color: '#007bff',
      margin: '0',
      fontWeight: '700' as const,
      lineHeight: '1.2'
    },
    // Sección de categorías con cards
    categoriesSection: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      marginBottom: '24px'
    },
    categoriesTitle: {
      margin: '0 0 24px 0',
      fontSize: '18px',
      fontWeight: '600' as const,
      color: '#343a40',
      paddingBottom: '12px',
      borderBottom: '2px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      marginTop: '20px'
    },
    categoryCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.2s ease'
    },
    categoryCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    categoryColorLarge: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      flexShrink: 0
    },
    categoryNameCard: {
      fontSize: '15px',
      fontWeight: '600' as const,
      color: '#343a40',
      flex: 1
    },
    categoryCardStats: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    categoryAmountLarge: {
      fontSize: '18px',
      fontWeight: '700' as const,
      color: '#343a40'
    },
    categoryPercentageLarge: {
      fontSize: '14px',
      fontWeight: '600' as const,
      color: '#6c757d',
      backgroundColor: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid #dee2e6'
    },
    categoryProgressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#dee2e6',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    categoryProgressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.5s ease',
      minWidth: '4px'
    },
    // Sección de exportación
    exportSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    exportButtons: {
      display: 'flex',
      gap: '12px'
    },
    exportButton: {
      padding: '8px 16px',
      backgroundColor: '#ffffff',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '13px',
      color: '#495057',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease',
      fontWeight: '500' as const
    },
    rightPanel: {
      width: '340px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      height: 'fit-content',
      border: '1px solid #e9ecef'
    },
    rightTitle: {
      fontSize: '20px',
      fontWeight: '600' as const,
      color: '#343a40',
      margin: '0 0 20px 0',
      textAlign: 'center' as const
    },
    divider: {
      height: '2px',
      backgroundColor: '#e9ecef',
      margin: '20px 0',
      border: 'none',
      borderRadius: '1px'
    },
    paymentList: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    paymentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #f1f3f4',
      transition: 'background-color 0.2s ease'
    },
    paymentMethod: {
      fontSize: '15px',
      color: '#495057',
      fontWeight: '500' as const
    },
    paymentAmount: {
      fontSize: '15px',
      color: '#007bff',
      fontWeight: '600' as const
    },
    totalSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      padding: '20px 0',
      borderTop: '3px solid #007bff',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      paddingLeft: '16px',
      paddingRight: '16px'
    },
    totalLabel: {
      fontSize: '18px',
      fontWeight: '600' as const,
      color: '#343a40'
    },
    totalAmount: {
      fontSize: '20px',
      fontWeight: '700' as const,
      color: '#007bff'
    },
    // Estilos para los botones de exportación en el panel derecho
    rightExportSection: {
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    },
    exportTitle: {
      fontSize: '16px',
      fontWeight: '600' as const,
      color: '#343a40',
      margin: '0 0 16px 0',
      textAlign: 'center' as const
    },
    rightExportButtons: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
    },
    rightExportButton: {
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      border: '2px solid',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center' as const,
      width: '100%'
    }
  };

  return (
    <div style={modernStyles.container}>
      {/* Panel Principal */}
      <div style={modernStyles.leftPanel}>
        {isLoading ? (
          <LoadingDinamico variant="container" />
        ) : (
          <>
            {/* Header con filtros */}
            <form onSubmit={handleSubmit} style={modernStyles.header}>
              <div style={modernStyles.dropdown}>
                <div className="dropdown">
                  <button 
                    style={modernStyles.dropdownButton}
                    className="dropdown-toggle" 
                    type="button" 
                    id="dropdownMenuButton" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#007bff';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    {categoriaActiva}
                  </button>
                  <ul className="dropdown-menu">
                    <li onClick={() => handleFilterCategory('Todo', dispatch, categorias)} className="dropdown-item">Todo</li>
                    <li><hr className="dropdown-divider"/></li>
                    {categorias.map((categoria) => (
                      <li 
                        onClick={() => handleFilterCategory(categoria.category, dispatch, categorias)} 
                        key={categoria.id} 
                        className="dropdown-item"
                      >
                        {categoria.category}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <input
                id="initDate"
                style={modernStyles.dateInput}
                onChange={handleInitDateChange}
                type="date"
                value={initDate}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                }}
              />
              
              <input
                id="endDate"
                style={modernStyles.dateInput}
                onChange={handleEndDateChange}
                type="date"
                value={endDate}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                }}
              />
              
              <button
                type="submit"
                style={modernStyles.searchButton}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }}
              >
                Buscar
              </button>
            </form>

            {/* Estadísticas principales */}
            <div style={modernStyles.statsSection}>
              <div 
                style={modernStyles.statCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
                }}
              >
                <p style={modernStyles.statTitle}>Total de Ingresos</p>
                <p style={modernStyles.statValue}>{formatNumber(totalFinal)}</p>
              </div>
              
              <div 
                style={modernStyles.statCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
                }}
              >
                <p style={modernStyles.statTitle}>Total Categorías</p>
                <p style={modernStyles.statValue}>{categoriasFiltradas.length}</p>
              </div>
            </div>

            {/* Visualización de categorías con cards */}
            <div style={modernStyles.categoriesSection}>
              <h3 style={modernStyles.categoriesTitle}>
                Ingresos por Categoría
              </h3>
              
              <div style={modernStyles.categoriesGrid}>
                {categoriesWithPercentage.map((categoria, index) => (
                  <div 
                    key={categoria.id} 
                    style={modernStyles.categoryCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={modernStyles.categoryCardHeader}>
                      <div 
                        style={{
                          ...modernStyles.categoryColorLarge,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                      <span style={modernStyles.categoryNameCard}>{categoria.category}</span>
                    </div>
                    
                    <div style={modernStyles.categoryCardStats}>
                      <div style={modernStyles.categoryAmountLarge}>{formatNumber(categoria.total)}</div>
                      <div style={modernStyles.categoryPercentageLarge}>{categoria.percentage.toFixed(1)}%</div>
                    </div>
                    
                    <div style={modernStyles.categoryProgressBar}>
                      <div 
                        style={{
                          ...modernStyles.categoryProgressFill,
                          width: `${categoria.percentage}%`,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Panel Derecho - Métodos de Pago */}
      <div style={modernStyles.rightPanel}>
        <h3 style={modernStyles.rightTitle}>Métodos de Pago</h3>
        <hr style={modernStyles.divider} />
        
        <ul style={modernStyles.paymentList}>
          {metodosPago.map((metodo) => (
            <li 
              key={metodo.payment_method} 
              style={modernStyles.paymentItem}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderRadius = '6px';
                e.currentTarget.style.marginLeft = '4px';
                e.currentTarget.style.marginRight = '4px';
                e.currentTarget.style.paddingLeft = '12px';
                e.currentTarget.style.paddingRight = '12px';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderRadius = '0';
                e.currentTarget.style.marginLeft = '0';
                e.currentTarget.style.marginRight = '0';
                e.currentTarget.style.paddingLeft = '0';
                e.currentTarget.style.paddingRight = '0';
              }}
            >
              <span style={modernStyles.paymentMethod}>{metodo.payment_method}</span>
              <span style={modernStyles.paymentAmount}>{formatNumber(metodo.total)}</span>
            </li>
          ))}
        </ul>
        
        <div style={modernStyles.totalSection}>
          <span style={modernStyles.totalLabel}>Total</span>
          <span style={modernStyles.totalAmount}>
            {formatNumber(metodosPago.reduce((acumulador, metodoPago) => acumulador + metodoPago.total, 0))}
          </span>
        </div>

        {/* Botones de exportación */}
        <div style={modernStyles.rightExportSection}>
          <h4 style={modernStyles.exportTitle}>Descargar Reporte</h4>
          <div style={modernStyles.rightExportButtons}>
            <button 
              style={{...modernStyles.rightExportButton, borderColor: '#dc3545', color: '#dc3545'}}
              onClick={() => exportToPdf(categoriasFiltradas)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#dc3545';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Exportar PDF
            </button>
            <button 
              style={{...modernStyles.rightExportButton, borderColor: '#28a745', color: '#28a745'}}
              onClick={() => exportToExcel(categoriasFiltradas)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#28a745';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngresosCategoriaProducto;