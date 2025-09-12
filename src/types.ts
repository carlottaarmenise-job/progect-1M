export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    categoryId: number;
    image?: string;
    stock: number;
    featured?: boolean;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    colors?: string[];
    isNew?: boolean;
    isSale?: boolean;
};

export type CartItem = {
    product: Product;
    qty: number;
};

export type RawProduct = {
    id: number;
    name: string;
    price: number;
    category: string;
    categoryId: number;
    description: string;
    image?: string;
    stock: number;
    
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    colors?: string[];
    isNew?: boolean;
    isSale?: boolean;
};