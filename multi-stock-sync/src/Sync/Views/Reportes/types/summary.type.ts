export interface StoreSummary {
  //creamos la interfaz StoreSummary
  total_sales: number; //total de ventas
  top_selling_products: {
    //productos más vendidos
    title: string;
    quantity: number;
    total_amount: number;
  }[];
  order_statuses: { paid: number; pending: number; canceled: number }; //estado de los pedidos
  daily_sales: number;
  weekly_sales: number;
  monthly_sales: number;
  annual_sales: number;
  top_payment_methods: {
    //métodos de pago más utilizados
    account_money: number;
    debit_card: number;
    credit_card: number;
  };
}
