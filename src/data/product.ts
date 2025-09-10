import type { RawProduct } from '../types';

export const RAW_PRODUCTS: RawProduct[] = [
  { 
    id: 1,  
    title: "T-Shirt Basic",       
    price: 19.90, 
    category: "men's clothing",   
    description: "T-shirt in cotone 100% a vestibilità regolare.",         
    imageFile: "tshirt.jpg",
    colors: ["#000000", "#ffffff", "#ff0000"],
    isNew: true
  },
  { 
    id: 2,  
    title: "Giacca Leggera",      
    price: 59.90, 
    category: "men's clothing",   
    description: "Giacca antivento leggera per la mezza stagione.",        
    imageFile: "jacket.jpg",
    colors: ["#000080", "#8B4513"],
    originalPrice: 79.90,
    isSale: true
  },
  { 
    id: 3,  
    title: "Sneakers Urban",      
    price: 79.00, 
    category: "men's clothing",   
    description: "Sneakers comode per tutti i giorni.",                    
    imageFile: "sneakers.jpg",
    colors: ["#ffffff", "#000000"],
    rating: 4.5,
    reviews: 124
  },
  { 
    id: 4,  
    title: "Abito Elegante",      
    price: 89.00, 
    category: "women's clothing", 
    description: "Abito midi elegante per cerimonie e serate.",            
    imageFile: "dress.jpg",
    colors: ["#000000", "#8B008B", "#FF69B4"],
    isNew: true
  },
  { 
    id: 5,  
    title: "Borsa Tracolla",      
    price: 45.00, 
    category: "women's clothing", 
    description: "Borsa a tracolla capiente in eco-pelle.",                
    imageFile: "bag.jpg",
    colors: ["#8B4513", "#000000"],
    originalPrice: 65.00,
    isSale: true
  },
  { 
    id: 6,  
    title: "Anello Minimal",      
    price: 29.00, 
    category: "jewelery",         
    description: "Anello minimalista in acciaio inox.",                    
    imageFile: "ring.jpg",
    colors: ["#C0C0C0", "#FFD700"]
  },
  { 
    id: 7,  
    title: "Orecchini Perla",     
    price: 24.90, 
    category: "jewelery",         
    description: "Orecchini con perle sintetiche, chiusura a farfalla.",   
    imageFile: "earrings.jpg",
    colors: ["#FFFAF0", "#FFB6C1"]
  },
  { 
    id: 8,  
    title: "Orologio Classico",   
    price: 129.0, 
    category: "jewelery",         
    description: "Orologio da polso con cinturino in pelle.",              
    imageFile: "watch.jpg",
    colors: ["#8B4513", "#000000"],
    rating: 4.8,
    reviews: 89
  },
  { 
    id: 9,  
    title: "Cuffie Over-Ear",     
    price: 59.00, 
    category: "electronics",      
    description: "Cuffie comode con buon isolamento acustico.",            
    imageFile: "headphones.jpg",
    colors: ["#000000", "#ffffff"],
    rating: 4.2,
    reviews: 203
  },
  { 
    id: 10,  
    title: "Laptop 14\"",         
    price: 799.0, 
    category: "electronics",      
    description: "Portatile 14\" leggero e silenzioso per lavoro/studio.", 
    imageFile: "laptop.jpg",
    colors: ["#708090", "#000000"]
  },
  { 
    id: 11,  
    title: "Smartphone 6.1\"",    
    price: 499.0, 
    category: "electronics",      
    description: "Display 6.1\" e fotocamera doppia.",                      
    imageFile: "phone.jpg",
    colors: ["#000000", "#ffffff", "#0000FF"],
    isNew: true,
    rating: 4.6,
    reviews: 156
  },
  { 
    id: 12,  
    title: "Fotocamera Compatta", 
    price: 349.0, 
    category: "electronics",      
    description: "Compatta con ottiche versatili per viaggi.",             
    imageFile: "camera.jpg",
    colors: ["#000000", "#C0C0C0"],
    originalPrice: 399.0,
    isSale: true
  }
];