import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Product, ProductVariation } from '../types';
import { storageService } from '../services/storage';
import { useCart } from '../hooks/useCart';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addToCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    variations: [{ name: '', price: 0, stock: 0 }]
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(storageService.getProducts());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productId = editingProduct?.id || Date.now().toString();
    const variations: ProductVariation[] = formData.variations.map((v, index) => ({
      id: editingProduct?.variations[index]?.id || `${productId}_${index}`,
      productId,
      name: v.name,
      price: v.price,
      stock: v.stock
    }));

    const product: Product = {
      id: productId,
      name: formData.name,
      price: formData.price,
      variations,
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date()
    };

    storageService.saveProduct(product);
    loadProducts();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      variations: [{ name: '', price: 0, stock: 0 }]
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      variations: product.variations.map(v => ({
        name: v.name,
        price: v.price,
        stock: v.stock
      }))
    });
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      storageService.deleteProduct(productId);
      loadProducts();
    }
  };

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { name: '', price: 0, stock: 0 }]
    }));
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleAddToCart = (product: Product, variation?: ProductVariation) => {
    if (variation && variation.stock === 0) {
      alert('Produto fora de estoque!');
      return;
    }

    addToCart({
      productId: product.id,
      variationId: variation?.id,
      productName: product.name,
      variationName: variation?.name,
      price: variation?.price || product.price,
      quantity: 1
    });

    alert('Produto adicionado ao carrinho!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Base (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Variações do Produto
                  </label>
                  <button
                    type="button"
                    onClick={addVariation}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Adicionar Variação
                  </button>
                </div>
                
                {formData.variations.map((variation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome da Variação
                        </label>
                        <input
                          type="text"
                          value={variation.name}
                          onChange={(e) => updateVariation(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Ex: Tamanho P"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Preço (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variation.price}
                          onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Estoque
                        </label>
                        <input
                          type="number"
                          value={variation.stock}
                          onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.variations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariation(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-2xl font-bold text-gray-900 mb-4">
                R$ {product.price.toFixed(2)}
              </p>

              {product.variations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Variações:</h4>
                  <div className="space-y-2">
                    {product.variations.map((variation) => (
                      <div key={variation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium">{variation.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            R$ {variation.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            variation.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {variation.stock > 0 ? `${variation.stock} unid.` : 'Sem estoque'}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product, variation)}
                            disabled={variation.stock === 0}
                            className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum produto cadastrado</p>
        </div>
      )}
    </div>
  );
};

export default ProductManager;