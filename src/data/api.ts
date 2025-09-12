import type { Product, RawProduct } from '../types';
import { RAW_PRODUCTS } from './product';

// path relativi alle immagini
const imageMap: { [key: string]: string } = {
  'tshirt.jpg': '/assets/tshirt.jpg',
  'jacket.jpg': '/assets/jacket.jpg',
  'sneakers.jpg': '/assets/sneakers.jpg',
  'dress.jpg': '/assets/dress.jpg',
  'bag.jpg': '/assets/bag.jpg',
  'ring.jpg': '/assets/ring.jpg',
  'earrings.jpg': '/assets/earrings.jpg',
  'watch.jpg': '/assets/watch.jpg',
  'headphones.jpg': '/assets/headphones.jpg',
  'laptop.jpg': '/assets/laptop.jpg',
  'phone.jpg': '/assets/phone.jpg',
  'camera.jpg': '/assets/camera.jpg',
};

let cache: Product[] | null = null;

function mapProduct(p: RawProduct): Product {
  const resolvedImage = `https://picsum.photos/300/300?random=${p.id}`;
  console.log(`Mapping product ${p.id}: ${p.image} -> ${resolvedImage}`);
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    categoryId: p.categoryId,
    description: p.description,
    image: resolvedImage,
    stock: p.stock,
    featured: false,
    tags: [],
    originalPrice: p.originalPrice,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    colors: p.colors || ['#000000'],
    isNew: p.isNew || false,
    isSale: p.isSale || false
  };
}

// Carica prodotti dall'AdminPanel se esistono
function loadProducts(): RawProduct[] {
  try {
    const adminProducts = localStorage.getItem('admin:products');
    if (adminProducts) {
      const parsed = JSON.parse(adminProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Errore nel caricamento prodotti admin:', error);
  }
  return RAW_PRODUCTS;
}

export async function getProducts(): Promise<Product[]> {
  if (!cache) {
    const rawProducts = loadProducts();
    cache = rawProducts.map(mapProduct);
  }
  return cache;
}

export async function getProductById(id: number): Promise<Product | null> {
  const list = await getProducts();
  return list.find(p => p.id === id) ?? null;
}

// invalida la cache quando l'admin modifica i prodotti
export function invalidateCache(): void {
  cache = null;
}

//  salva prodotti modificati dall'admin
export function saveProducts(products: Product[]): void {
  localStorage.setItem('admin:products', JSON.stringify(products));
  invalidateCache(); 
}