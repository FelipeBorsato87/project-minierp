import React from 'react';
import { Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import { storageService } from '../services/storage';

const Dashboard: React.FC = () => {
  const products = storageService.getProducts();
  const orders = storageService.getOrders();
  const coupons = storageService.getCoupons();
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeCoupons = coupons.filter(coupon => coupon.isActive && coupon.validUntil > new Date()).length;

  const stats = [
    {
      title: 'Total de Produtos',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Pedidos Realizados',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Cupons Ativos',
      value: activeCoupons,
      icon: Tag,
      color: 'bg-purple-500'
    },
    {
      title: 'Receita Total',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu sistema ERP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{order.customerInfo.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ {order.total.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendente' :
                       order.status === 'confirmed' ? 'Confirmado' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'delivered' ? 'Entregue' :
                       'Cancelado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;