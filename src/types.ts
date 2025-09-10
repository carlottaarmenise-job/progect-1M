export type Product = {
    id: number;
    title: string;
    price: number;
    category: string;
    description: string;
    image: string;

    originalPrice?: number;
    rating?: number;
    reviews?: number;
    imageFile: string;
    colors?: string[];
    isNew?: boolean;
    isSale?: boolean;
};

export type CartItem = {
    product: Product;
    qty: number;
};

// Tipo per i dati raw 
export type RawProduct = {
    id: number;
    title: string;
    price: number;
    category: string;
    description: string;
    imageFile: string;

    originalPrice?: number;
    rating?: number;
    reviews?: number;
    colors?: string[];
    isNew?: boolean;
    isSale?: boolean;
};