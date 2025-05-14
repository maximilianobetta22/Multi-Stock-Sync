<?php

namespace App\Http\Controllers\SalePoint;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class getHistorySaleController{

    public function getHistorySale(Request $request){
        try{

            $clientId = (int) $request->input('client_id', null);
            $dateStart = $request->input('date_start', null);
            $allSale = $request->input('allSale', null);
            $state = $request->input('state', null);

            $historySale = Sale::query()
                ->when($clientId, function ($query) use ($clientId) {
                    return $query->where('client_id', $clientId);
                })
                ->when($dateStart, function ($query) use ($dateStart) {
                    return $query->whereDate('created_at', '>=', $dateStart);
                })
                ->when($allSale, function ($query) use ($allSale) {
                    return $query->where('amount_total_products', $allSale);
                })
                ->when($state, function ($query) use ($state) {
                    return $query->where('state_sale', $state);
                })
                ->get();
        }
        catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener el historial de ventas: ' . $e->getMessage()], 500);
        }
    }

}