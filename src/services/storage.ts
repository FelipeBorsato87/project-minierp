import { Product, Coupon, Order, Stock } from '../types';

class StorageService {
  private readonly PRODUCTS_KEY = 'erp_products';
  private readonly COUPONS_KEY = 'erp_coupons';
  private readonly ORDERS_KEY = 'erp_orders';
  private readonly STOCK_KEY = 'erp_stock';

  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(this.PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  // Coupons
  getCoupons(): Coupon[] {
    const data = localStorage.getItem(this.COUPONS_KEY);
    return data ? JSON.parse(data).map((c: any) => ({
      ...c,
      validUntil: new Date(c.validUntil),
      createdAt: new Date(c.createdAt)
    })) : this.getDefaultCoupons();
  }

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const existingIndex = coupons.findIndex(c => c.id === coupon.id);
    
    if (existingIndex >= 0) {
      coupons[existingIndex] = coupon;
    } else {
      coupons.push(coupon);
    }
    
    localStorage.setItem(this.COUPONS_KEY, JSON.stringify(coupons));
  }

  // Orders
  getOrders(): Order[] {
    const data = localStorage.getItem(this.ORDERS_KEY);
    return data ? JSON.parse(data).map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt)
    })) : [];
  }

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex >= 0) {
      if (status === 'cancelled') {
        orders.splice(orderIndex, 1);
      } else {
        orders[orderIndex].status = status;
      }
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
  }

  // Stock
  getStock(): Stock[] {
    const data = localStorage.getItem(this.STOCK_KEY);
    return data ? JSON.parse(data).map((s: any) => ({
      ...s,
      lastUpdated: new Date(s.lastUpdated)
    })) : [];
  }

  updateStock(stock: Stock): void {
    const stocks = this.getStock();
    const existingIndex = stocks.findIndex(s => 
      s.productId === stock.productId && s.variationId === stock.variationId
    );
    
    if (existingIndex >= 0) {
      stocks[existingIndex] = stock;
    } else {
      stocks.push(stock);
    }
    
    localStorage.setItem(this.STOCK_KEY, JSON.stringify(stocks));
  }

  private getDefaultCoupons(): Coupon[] {
    const defaultCoupons: Coupon[] = [
      {
        id: '1',
        code: 'DESCONTO10',
        discount: 10,
        discountType: 'percentage',
        minValue: 50,
        validUntil: new Date('2025-12-31'),
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '2',
        code: 'FRETE15',
        discount: 15,
        discountType: 'fixed',
        minValue: 100,
        validUntil: new Date('2025-06-30'),
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    localStorage.setItem(this.COUPONS_KEY, JSON.stringify(defaultCoupons));
    return defaultCoupons;
  }
}

export const storageService = new StorageService();