import { storage } from "./storage";

const routePricesData = [
  { route: 'Alto - Maracai/Tijuca/Mato Machado', price: '10.00' },
  { route: 'Alto - Açude/Casa do Alto/Mansão Rosa', price: '12.00' },
  { route: 'Alto - Agrícola/Valeriano/Furnas', price: '10.00' },
  { route: 'Alto - Estrada Velha Montanha e Cedae', price: '20.00' },
  { route: 'Alto - Floresta da Tijuca', price: '20.00' },
  { route: 'Alto - Gávea Pna/Biguá', price: '15.00' },
  { route: 'Alto - Gervásio S./Córrego A.', price: '10.00' },
  { route: 'Alto - Rampa portão', price: '10.00' },
  { route: 'Alto - Silva Aereal', price: '12.00' },
  { route: 'Alto - Soberbo/Taquara do Alto', price: '15.00' },
  { route: 'Alto - Violão', price: '15.00' },
  { route: 'Alto - Vista Chinesa após cabine', price: '22.00' },
  { route: 'Alto - Botafogo', price: '50.00' },
  { route: 'Alto - Catete/Glória/Leme', price: '55.00' },
  { route: 'Alto - Copacabana', price: '55.00' },
  { route: 'Alto - Favelinha/Icanoas', price: '35.00' },
  { route: 'Alto - Flamengo/Vívo rio/Lgo Machado', price: '55.00' },
  { route: 'Alto - Gávea/Leblon', price: '45.00' },
  { route: 'Alto - Humaitá', price: '45.00' },
  { route: 'Alto - Ipanema', price: '50.00' },
  { route: 'Alto - Jardim Botânico', price: '42.00' },
  { route: 'Alto - Laranjeiras/Cosme Velho', price: '42.00' },
  { route: 'Alto - São Conrado', price: '35.00' },
  { route: 'Alto - Urca/Marina da Glória', price: '60.00' },
  { route: 'Alto - Aeroporto Galeão', price: '85.00' },
  { route: 'Alto - Aeroportos Santos Dumont', price: '75.00' },
  { route: 'Alto - Rodoviária Novo Rio', price: '50.00' },
];

export async function seedRoutePrices() {
  try {
    // Check if route prices already exist
    const existingPrices = await storage.getAllRoutePrices();
    
    if (existingPrices.length === 0) {
      console.log('Seeding route prices...');
      await storage.bulkCreateRoutePrices(routePricesData);
      console.log(`Successfully seeded ${routePricesData.length} route prices!`);
    } else {
      console.log(`Route prices already seeded (${existingPrices.length} routes found)`);
    }
  } catch (error) {
    console.error('Error seeding route prices:', error);
  }
}
