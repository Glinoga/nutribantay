<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index() {
        $categories = Category::all();
        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }
    
    public function create()
    {
        return Inertia::render('Categories/Create', [
            'availableColors' => Category::availableColors()
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'color' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        $validated['slug'] = Str::slug($validated['name']);
        
        Category::create($validated);
        
        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully');
    }
    
    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'availableColors' => Category::availableColors()
        ]);
    }
    
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
            'color' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        
        $validated['slug'] = Str::slug($validated['name']);
        
        $category->update($validated);
        
        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully');
    }
    
    public function destroy(Category $category)
    {
        // Check if category is in use
        if ($category->announcements()->count() > 0) {
            return back()->with('error', 'Cannot delete category that is being used by announcements');
        }
        
        $category->delete();
        
        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully');
    }

}
