import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';
import { Coupon } from '../types';
import { storageService } from '../services/storage';

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    minValue: 0,
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    setCoupons(storageService.getCoupons());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const coupon: Coupon = {
      id: editingCoupon?.id || Date.now().toString(),
      code: formData.code.toUpperCase(),
      discount: formData.discount,
      discountType: formData.discountType,
      minValue: formData.minValue,
      validUntil: new Date(formData.validUntil),
      isActive: formData.isActive,
      createdAt: editingCoupon?.createdAt || new Date()
    };

    storageService.saveCoupon(coupon);
    loadCoupons();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount: 0,
      discountType: 'percentage',
      minValue: 0,
      validUntil: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      minValue: coupon.minValue,
      validUntil: coupon.validUntil.toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const toggleCouponStatus = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon) {
      const updatedCoupon = { ...coupon, isActive: !coupon.isActive };
      storageService.saveCoupon(updatedCoupon);
      loadCoupons();
    }
  };

  const isExpired = (date: Date) => date < new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Cupons</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold mb-4">
              {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Cupom
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase"
                    placeholder="Ex: DESCONTO10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Desconto
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        discountType: e.target.value as 'percentage' | 'fixed' 
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="percentage">Porcentagem</option>
                      <option value="fixed">Valor Fixo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto {formData.discountType === 'percentage' ? '(%)' : '(R$)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mínimo do Pedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, minValue: parseFloat(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido até
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Cupom ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
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
                  {editingCoupon ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-900 font-mono">
                      {coupon.code}
                    </h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-xl font-bold text-green-600">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discount}%` 
                        : `R$ ${coupon.discount.toFixed(2)}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {coupon.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                  
                  {isExpired(coupon.validUntil) && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      Expirado
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Pedido mínimo: R$ {coupon.minValue.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    Válido até: {coupon.validUntil.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Criado em: {coupon.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum cupom cadastrado</p>
        </div>
      )}
    </div>
  );
};

export default CouponManager;