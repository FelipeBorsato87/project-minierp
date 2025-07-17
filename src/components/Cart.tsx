import React, { useState } from 'react';
import { Trash2, Plus, Minus, MapPin } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { ShippingService } from '../services/shipping';
import { ViaCepService } from '../services/viaCep';
import { storageService } from '../services/storage';
import { Coupon, Order, CustomerInfo } from '../types';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const subtotal = getCartTotal();
  const shipping = ShippingService.calculateShipping(subtotal);
  const couponDiscount = appliedCoupon ? 
    (appliedCoupon.discountType === 'percentage' ? 
      subtotal * (appliedCoupon.discount / 100) : 
      appliedCoupon.discount) : 0;
  const total = subtotal + shipping - couponDiscount;

  const applyCoupon = () => {
    const coupons = storageService.getCoupons();
    const coupon = coupons.find(c => 
      c.code === couponCode && 
      c.isActive && 
      c.validUntil > new Date() &&
      subtotal >= c.minValue
    );

    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponCode('');
      alert('Cupom aplicado com sucesso!');
    } else {
      alert('Cupom inválido ou não atende aos requisitos!');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleZipCodeChange = async (zipCode: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      address: { ...prev.address, zipCode }
    }));

    if (zipCode.replace(/\D/g, '').length === 8) {
      setLoadingCep(true);
      const address = await ViaCepService.getAddressByZip(zipCode);
      
      if (address) {
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: address.logradouro,
            neighborhood: address.bairro,
            city: address.localidade,
            state: address.uf
          }
        }));
      }
      setLoadingCep(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.address.zipCode) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
      items: cart,
      subtotal,
      shipping,
      discount: couponDiscount,
      total,
      couponCode: appliedCoupon?.code,
      customerInfo,
      status: 'pending',
      createdAt: new Date()
    };

    storageService.saveOrder(order);
    clearCart();
    setAppliedCoupon(null);
    setShowCheckout(false);
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      }
    });

    alert(`Pedido #${order.id.slice(-8)} realizado com sucesso! Total: R$ ${total.toFixed(2)}`);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg mb-2">Seu carrinho está vazio</p>
          <p>Adicione alguns produtos para continuar</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Carrinho de Compras</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Itens no Carrinho</h3>
              
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.productId}-${item.variationId}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      {item.variationName && (
                        <p className="text-sm text-gray-600">{item.variationName}</p>
                      )}
                      <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 border rounded">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.productId, item.variationId)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Coupon */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Cupom de Desconto</h3>
            
            {!appliedCoupon ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Código do cupom"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Aplicar
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                <div>
                  <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                  <p className="text-sm text-green-600">
                    {appliedCoupon.discountType === 'percentage' ? 
                      `${appliedCoupon.discount}% de desconto` :
                      `R$ ${appliedCoupon.discount.toFixed(2)} de desconto`
                    }
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>{ShippingService.getShippingText(subtotal)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>-R$ {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Finalizar Pedido</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerInfo.address.zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    placeholder="00000-000"
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    required
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-2">
                      <MapPin className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  value={customerInfo.address.street}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={customerInfo.address.number}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, number: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={customerInfo.address.complement}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, complement: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={customerInfo.address.neighborhood}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, neighborhood: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={customerInfo.address.city}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={customerInfo.address.state}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            
            {/* Order Summary in Modal */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;