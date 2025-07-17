import { ViaCepResponse } from '../types';

export class ViaCepService {
  static async getAddressByZip(zipCode: string): Promise<ViaCepResponse | null> {
    try {
      const cleanZip = zipCode.replace(/\D/g, '');
      if (cleanZip.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      return null;
    }
  }

  static formatZipCode(zipCode: string): string {
    const cleaned = zipCode.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}