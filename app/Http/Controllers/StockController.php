<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Stock::query();

        // If you want to scope to the user's barangay (recommended)
        if ($user && $user->barangay) {
            $query->where('barangay', $user->barangay);
        }

        $stocks = $query->orderBy('item_name')->get();

        return Inertia::render('Stocks/Index', [
            'stocks' => $stocks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
   public function create()
    {
        return Inertia::render('Stocks/Form', [
            'stock' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'barangay' => 'required|string|max:255',
            'item_name' => 'required|string|max:255',
            'category' => 'required|in:food,vitamin,medicine,other',
            'quantity' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'expiry_date' => 'nullable|date',
        ]);

        $data['created_by'] = auth()->id();

        Stock::create($data);

        return redirect()->route('stocks.index')->with('success', 'Stock added.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Stock $stock)
    {
        // ensure only same barangay can edit (optional)
        // if (auth()->user()->barangay !== $stock->barangay) abort(403);

        return Inertia::render('Stocks/Form', [
            'stock' => $stock,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stock $stock)
    {
        $data = $request->validate([
            'barangay' => 'required|string|max:255',
            'item_name' => 'required|string|max:255',
            'category' => 'required|in:food,vitamin,medicine,other',
            'quantity' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'expiry_date' => 'nullable|date',
        ]);

        $stock->update($data);

        return redirect()->route('stocks.index')->with('success', 'Stock updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        // optionally check barangay ownership
        $stock->delete();

        return redirect()->route('stocks.index')->with('success', 'Stock deleted.');
    }

    // optional API endpoint to return items only (for AI)
    public function apiListForBarangay(Request $request)
    {
        $user = auth()->user();
        $barangay = $request->input('barangay', $user->barangay ?? null);

        $items = Stock::where('barangay', $barangay)
            ->where('quantity', '>', 0)
            ->orderBy('item_name')
            ->pluck('item_name');

        return response()->json(['items' => $items]);
    }
}
