export class ShippingService {
  static calculateShipping(subtotal: number): number {
    if (subtotal >= 200) {
      return 0; // Frete grátis
    } else if (subtotal >= 52 && subtotal <= 166.59) {
      return 15;
    } else {
      return 20;
    }
  }

  static getShippingText(subtotal: number): string {
    const shipping = this.calculateShipping(subtotal);
    
    if (shipping === 0) {
      return 'Frete Grátis';
    }
    
    return `R$ ${shipping.toFixed(2)}`;
  }
}