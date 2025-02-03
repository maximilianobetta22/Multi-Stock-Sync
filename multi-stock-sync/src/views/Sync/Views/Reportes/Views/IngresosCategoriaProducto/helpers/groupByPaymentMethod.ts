import { PaymentMethod, Venta } from "../Interfaces/interfaces";

export const groupByPaymentMethod = (ventas: Venta[]) => {
  
  const ventasAgrupadas: { [id: string]: PaymentMethod} = {};

  ventas.forEach((venta) => {
    if (ventasAgrupadas[venta.payment_method]) {
      ventasAgrupadas[venta.payment_method].quantity += 1;
      ventasAgrupadas[venta.payment_method].total += venta.total_amount;
    } else {
      ventasAgrupadas[venta.payment_method] = {
        payment_method: (venta.payment_method === 'account_money') && 'Efectivo' || (venta.payment_method === 'credit_card') && 'Tarjeta de crédito' || (venta.payment_method === 'debit_card') && 'Tarjeta de débito' || (venta.payment_method === 'qr_code') && 'Código QR' || (venta.payment_method === 'transfer') && 'Transferencia' || (venta.payment_method === 'other') && 'Otro' || 'Desconocido',
        quantity: 1,
        total: venta.total_amount,
      };
    }
  })

  return Object.values(ventasAgrupadas);
}