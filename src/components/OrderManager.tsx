import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, CreditCard, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { storageService } from '../services/storage';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookOrderId, setWebhookOrderId] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<Order['status']>('confirmed');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrders(storageService.getOrders());
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    storageService.updateOrderStatus(orderId, status);
    loadOrders();
    setSelectedOrder(null);
  };

  const simulateWebhook = () => {
    if (!webhookOrderId) {
      alert('Informe o ID do pedido');
      return;
    }

    // Simula o webhook
    updateOrderStatus(webhookOrderId, webhookStatus);
    
    alert(`Webhook simulado! Pedido ${webhookOrderId} ${
      webhookStatus === 'cancelled' ? 'foi removido' : `teve status atualizado para ${webhookStatus}`
    }`);
    
    setWebhookOrderId('');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h2>
        <button
          onClick={loadOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Webhook Simulator */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Simulador de Webhook</h3>
        <p className="text-sm text-gray-600 mb-4">
          Simule o recebimento de um webhook para atualizar o status de um pedido ou cancelá-lo.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Pedido
            </label>
            <input
              type="text"
              value={webhookOrderId}
              onChange={(e) => setWebhookOrderId(e.target.value)}
              placeholder="Ex: 1234567890"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Novo Status
            </label>
            <select
              value={webhookStatus}
              onChange={(e) => setWebhookStatus(e.target.value as Order['status'])}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={simulateWebhook}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Simular Webhook
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.customerInfo.name}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {order.customerInfo.address.city}, {order.customerInfo.address.state}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Package className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.items.length} item(s)</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-semibold">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Ver Detalhes
                </button>
                
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex space-x-1">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                      >
                        Enviar
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Entregar
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                Pedido #{selectedOrder.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-3">Informações do Cliente</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {selectedOrder.customerInfo.name}</p>
                  <p><strong>E-mail:</strong> {selectedOrder.customerInfo.email}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.customerInfo.phone}</p>
                </div>

                <h4 className="font-semibold mt-4 mb-3">Endereço de Entrega</h4>
                <div className="text-sm">
                  <p>{selectedOrder.customerInfo.address.street}, {selectedOrder.customerInfo.address.number}</p>
                  {selectedOrder.customerInfo.address.complement && (
                    <p>{selectedOrder.customerInfo.address.complement}</p>
                  )}
                  <p>{selectedOrder.customerInfo.address.neighborhood}</p>
                  <p>{selectedOrder.customerInfo.address.city} - {selectedOrder.customerInfo.address.state}</p>
                  <p>CEP: {selectedOrder.customerInfo.address.zipCode}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold mb-3">Resumo do Pedido</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span>R$ {selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({selectedOrder.couponCode}):</span>
                      <span>-R$ {selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Itens do Pedido</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.variationName && (
                        <p className="text-sm text-gray-600">{item.variationName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Total: R$ {(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;