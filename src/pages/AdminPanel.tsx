import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Package, Tag } from 'lucide-react';
import { Product } from '../types';
import { getProducts, saveProducts } from '../data/api';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';

interface ProductFormData {
    name: string;
    categoryId: number;
    price: number;
    originalPrice?: number;
    description: string;
    image: string;
    stock: number;
    colors: string[];
    isNew: boolean;
    isSale: boolean;
    featured: boolean;
}

interface CategoryFormData {
    name: string;
    description: string;
    slug: string;
    parentId?: number;
    image: string;
    active: boolean;
    sortOrder: number;
}

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { createProduct } = useProducts();
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategories();

    const [productFormData, setProductFormData] = useState<ProductFormData>({
        name: '',
        categoryId: 0,
        price: 0,
        originalPrice: undefined,
        description: '',
        image: '',
        stock: 0,
        colors: ['#000000'],
        isNew: false,
        isSale: false,
        featured: false
    });

    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        slug: '',
        parentId: undefined,
        image: '',
        active: true,
        sortOrder: 0
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        loadProducts();
        fetchCategories();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            showToast('Errore nel caricamento dei prodotti', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const resetProductForm = () => {
        setProductFormData({
            name: '',
            categoryId: 0,
            price: 0,
            originalPrice: undefined,
            description: '',
            image: '',
            stock: 0,
            colors: ['#000000'],
            isNew: false,
            isSale: false,
            featured: false
        });
        setImagePreview('');
        setUploadedImage(null);
        setEditingProduct(null);
        setShowForm(false);
    };

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: '',
            description: '',
            slug: '',
            parentId: undefined,
            image: '',
            active: true,
            sortOrder: 0
        });
        setImagePreview('');
        setUploadedImage(null);
        setEditingCategory(null);
        setShowForm(false);
    };

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[àáäâ]/g, 'a')
            .replace(/[èéëê]/g, 'e')
            .replace(/[ìíïî]/g, 'i')
            .replace(/[òóöô]/g, 'o')
            .replace(/[ùúüû]/g, 'u')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const getCategoryNameById = (categoryId: number): string => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Categoria sconosciuta';
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setUploadedImage(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    setImagePreview(result);
                    if (activeTab === 'products') {
                        setProductFormData(prev => ({ ...prev, image: file.name }));
                    } else {
                        setCategoryFormData(prev => ({ ...prev, image: file.name }));
                    }
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Seleziona un file immagine valido', 'danger');
            }
        }
    };

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...productFormData.colors];
        newColors[index] = color;
        setProductFormData(prev => ({ ...prev, colors: newColors }));
    };

    const addColor = () => {
        if (productFormData.colors.length < 5) {
            setProductFormData(prev => ({ ...prev, colors: [...prev.colors, '#000000'] }));
        }
    };

    const removeColor = (index: number) => {
        if (productFormData.colors.length > 1) {
            const newColors = productFormData.colors.filter((_, i) => i !== index);
            setProductFormData(prev => ({ ...prev, colors: newColors }));
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductFormData({
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
            originalPrice: product.originalPrice,
            description: product.description || '',
            image: product.image || '',
            stock: product.stock,
            colors: product.colors || ['#000000'],
            isNew: product.isNew || false,
            isSale: product.isSale || false,
            featured: product.featured || false
        });
        setImagePreview(product.image || '');
        setActiveTab('products');
        setShowForm(true);
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setCategoryFormData({
            name: category.name,
            description: category.description || '',
            slug: category.slug,
            parentId: category.parentId,
            image: category.image || '',
            active: category.active,
            sortOrder: category.sortOrder || 0
        });
        setImagePreview(category.image || '');
        setActiveTab('categories');
        setShowForm(true);
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productFormData.name.trim() || !productFormData.description.trim() || productFormData.price <= 0) {
            showToast('Compila tutti i campi obbligatori', 'warning');
            return;
        }

        if (productFormData.categoryId === 0) {
            showToast('Seleziona una categoria', 'warning');
            return;
        }

        if (!editingProduct && !uploadedImage && !imagePreview) {
            showToast('Seleziona un\'immagine per il prodotto', 'warning');
            return;
        }

        try {
            const selectedCategory = categories.find(c => c.id === productFormData.categoryId);

            const newProduct: Product = {
                id: editingProduct ? editingProduct.id : Date.now(),
                name: productFormData.name,
                category: selectedCategory?.slug || '',
                categoryId: productFormData.categoryId,
                price: productFormData.price,
                originalPrice: productFormData.isSale ? productFormData.originalPrice : undefined,
                rating: editingProduct ? editingProduct.rating : 0,
                reviews: editingProduct ? editingProduct.reviews : 0,
                image: imagePreview || `https://picsum.photos/300/300?random=${Date.now()}`,
                stock: productFormData.stock,
                colors: productFormData.colors,
                isNew: productFormData.isNew,
                isSale: productFormData.isSale,
                featured: productFormData.featured,
                description: productFormData.description
            };

            let updatedProducts: Product[];
            if (editingProduct) {
                updatedProducts = products.map(p =>
                    p.id === editingProduct.id ? newProduct : p
                );
                showToast('Prodotto aggiornato con successo!', 'success');
            } else {
                updatedProducts = [...products, newProduct];
                showToast('Prodotto aggiunto con successo!', 'success');
                await createProduct(newProduct);
            }

            setProducts(updatedProducts);
            saveProducts(updatedProducts);
            resetProductForm();
        } catch (error) {
            showToast('Errore nel salvare il prodotto', 'danger');
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryFormData.name.trim()) {
            showToast('Il nome della categoria è obbligatorio', 'warning');
            return;
        }

        try {
            const categoryData = {
                ...categoryFormData,
                slug: categoryFormData.slug || generateSlug(categoryFormData.name),
                image: imagePreview || `https://picsum.photos/400/300?random=${Date.now()}`
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
                showToast('Categoria aggiornata con successo!', 'success');
            } else {
                await createCategory(categoryData);
                showToast('Categoria creata con successo!', 'success');
            }

            resetCategoryForm();
            fetchCategories();
        } catch (error) {
            showToast('Errore nel salvare la categoria', 'danger');
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
            try {
                const updatedProducts = products.filter(p => p.id !== productId);
                setProducts(updatedProducts);
                saveProducts(updatedProducts);
                showToast('Prodotto eliminato con successo!', 'success');
            } catch (error) {
                showToast('Errore nell\'eliminazione del prodotto', 'danger');
            }
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        // Controlla se ci sono prodotti in questa categoria
        const productsInCategory = products.filter(p => p.categoryId === categoryId);

        if (productsInCategory.length > 0) {
            showToast(`Impossibile eliminare: ci sono ${productsInCategory.length} prodotti in questa categoria`, 'warning');
            return;
        }

        if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
            try {
                await deleteCategory(categoryId);
                showToast('Categoria eliminata con successo!', 'success');
                fetchCategories();
            } catch (error) {
                showToast('Errore nell\'eliminazione della categoria', 'danger');
            }
        }
    };

    const getCategoryBadgeColor = (categoryId: number) => {
        const colors = ['primary', 'success', 'warning', 'info', 'secondary'];
        return colors[categoryId % colors.length];
    };

    if (loading || categoriesLoading) {
        return (
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="text-white mb-0">Pannello Amministratore</h2>
                            <p className="text-white-50 mb-0">
                                {activeTab === 'products' ? 'Gestisci il catalogo prodotti' : 'Gestisci le categorie'}
                            </p>
                        </div>
                        <button
                            className="btn btn-light btn-lg"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="me-2" size={20} />
                            {activeTab === 'products' ? 'Aggiungi Prodotto' : 'Aggiungi Categoria'}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="card bg-white bg-opacity-10 backdrop-blur border-0 mb-4">
                        <div className="card-body p-0">
                            <ul className="nav nav-tabs border-0">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 text-white ${activeTab === 'products' ? 'active bg-white bg-opacity-20' : ''}`}
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <Package className="me-2" size={18} />
                                        Prodotti
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 text-white ${activeTab === 'categories' ? 'active bg-white bg-opacity-20' : ''}`}
                                        onClick={() => setActiveTab('categories')}
                                    >
                                        <Tag className="me-2" size={18} />
                                        Categorie
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card bg-white bg-opacity-10 backdrop-blur text-white border-0">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title">Totale Prodotti</h5>
                                            <h3 className="mb-0">{products.length}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white bg-opacity-10 backdrop-blur text-white border-0">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title">Categorie Attive</h5>
                                            <h3 className="mb-0">{categories.filter(c => c.active).length}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white bg-opacity-10 backdrop-blur text-white border-0">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title">In Offerta</h5>
                                            <h3 className="mb-0">{products.filter(p => p.isSale).length}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white bg-opacity-10 backdrop-blur text-white border-0">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title">Nuovi Arrivi</h5>
                                            <h3 className="mb-0">{products.filter(p => p.isNew).length}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'products' ? (
                        /* Products Table */
                        <div className="card bg-white bg-opacity-90 backdrop-blur border-0 shadow">
                            <div className="card-header bg-transparent border-0">
                                <h5 className="mb-0">Elenco Prodotti</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Immagine</th>
                                                <th>Nome</th>
                                                <th>Categoria</th>
                                                <th>Prezzo</th>
                                                <th>Stock</th>
                                                <th>Status</th>
                                                <th>Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="rounded"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>{product.name}</strong>
                                                            <br />
                                                            <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${getCategoryBadgeColor(product.categoryId)}`}>
                                                            {getCategoryNameById(product.categoryId)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>€{product.price.toFixed(2)}</strong>
                                                            {product.originalPrice && (
                                                                <div>
                                                                    <small className="text-decoration-line-through text-muted">
                                                                        €{product.originalPrice.toFixed(2)}
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            {product.isNew && <span className="badge bg-success">Nuovo</span>}
                                                            {product.isSale && <span className="badge bg-danger">Offerta</span>}
                                                            {product.featured && <span className="badge bg-primary">Featured</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleEditProduct(product)}
                                                                title="Modifica"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                title="Elimina"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Categories Table */
                        <div className="card bg-white bg-opacity-90 backdrop-blur border-0 shadow">
                            <div className="card-header bg-transparent border-0">
                                <h5 className="mb-0">Elenco Categorie</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Immagine</th>
                                                <th>Nome</th>
                                                <th>Slug</th>
                                                <th>Descrizione</th>
                                                <th>Prodotti</th>
                                                <th>Status</th>
                                                <th>Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(category => (
                                                <tr key={category.id}>
                                                    <td>
                                                        <img
                                                            src={category.image || 'https://picsum.photos/50/50'}
                                                            alt={category.name}
                                                            className="rounded"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <strong>{category.name}</strong>
                                                    </td>
                                                    <td>
                                                        <code>{category.slug}</code>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {category.description?.substring(0, 50) || 'Nessuna descrizione'}...
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">
                                                            {products.filter(p => p.categoryId === category.id).length}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${category.active ? 'bg-success' : 'bg-secondary'}`}>
                                                            {category.active ? 'Attiva' : 'Disattiva'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleEditCategory(category)}
                                                                title="Modifica"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleDeleteCategory(category.id)}
                                                                title="Elimina"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {activeTab === 'products' ?
                                        (editingProduct ? 'Modifica Prodotto' : 'Aggiungi Nuovo Prodotto') :
                                        (editingCategory ? 'Modifica Categoria' : 'Aggiungi Nuova Categoria')
                                    }
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={activeTab === 'products' ? resetProductForm : resetCategoryForm}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {activeTab === 'products' ? (
                                    /* Product Form */
                                    <form onSubmit={handleProductSubmit}>
                                        <div className="row">
                                            {/* Immagine Upload */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Immagine Prodotto *</label>
                                                <div className="border rounded p-3">
                                                    {imagePreview && (
                                                        <div className="mb-3 text-center">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="img-thumbnail"
                                                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                            />
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <small className="form-text text-muted">
                                                        Formati supportati: JPG, PNG, GIF. Max 5MB
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Informazioni */}
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Nome Prodotto *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={productFormData.name}
                                                        onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Categoria *</label>
                                                    <select
                                                        className="form-select"
                                                        value={productFormData.categoryId}
                                                        onChange={(e) => setProductFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                                                        required
                                                    >
                                                        <option value={0}>Seleziona una categoria</option>
                                                        {categories
                                                            .filter(cat => cat.active)
                                                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                                            .map(category => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Prezzo *</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text">€</span>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={productFormData.price}
                                                                    onChange={(e) => setProductFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Stock *</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="0"
                                                                value={productFormData.stock}
                                                                onChange={(e) => setProductFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Prezzo Originale</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">€</span>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0"
                                                            step="0.01"
                                                            value={productFormData.originalPrice || ''}
                                                            onChange={(e) => setProductFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                                                            disabled={!productFormData.isSale}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descrizione */}
                                        <div className="mb-3">
                                            <label className="form-label">Descrizione *</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={productFormData.description}
                                                onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                                                required
                                            ></textarea>
                                        </div>

                                        {/* Colori */}
                                        <div className="mb-3">
                                            <label className="form-label">Colori Disponibili</label>
                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                                {productFormData.colors.map((color, index) => (
                                                    <div key={index} className="d-flex align-items-center gap-1">
                                                        <input
                                                            type="color"
                                                            className="form-control form-control-color"
                                                            value={color}
                                                            onChange={(e) => handleColorChange(index, e.target.value)}
                                                        />
                                                        {productFormData.colors.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => removeColor(index)}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {productFormData.colors.length < 5 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={addColor}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={productFormData.isNew}
                                                        onChange={(e) => setProductFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                                                    />
                                                    <label className="form-check-label">
                                                        Nuovo Arrivo
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={productFormData.isSale}
                                                        onChange={(e) => setProductFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                                                    />
                                                    <label className="form-check-label">
                                                        In Offerta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={productFormData.featured}
                                                        onChange={(e) => setProductFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                                    />
                                                    <label className="form-check-label">
                                                        In Evidenza
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    /* Category Form */
                                    <form onSubmit={handleCategorySubmit}>
                                        <div className="row">
                                            {/* Immagine Upload */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Immagine Categoria</label>
                                                <div className="border rounded p-3">
                                                    {imagePreview && (
                                                        <div className="mb-3 text-center">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="img-thumbnail"
                                                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                            />
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <small className="form-text text-muted">
                                                        Formati supportati: JPG, PNG, GIF. Max 5MB
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Informazioni Categoria */}
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Nome Categoria *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={categoryFormData.name}
                                                        onChange={(e) => {
                                                            const name = e.target.value;
                                                            setCategoryFormData(prev => ({
                                                                ...prev,
                                                                name,
                                                                slug: generateSlug(name)
                                                            }));
                                                        }}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Slug</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={categoryFormData.slug}
                                                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                                                        placeholder="viene-generato-automaticamente"
                                                    />
                                                    <small className="form-text text-muted">
                                                        URL amichevole per la categoria (es: elettronica, abbigliamento-uomo)
                                                    </small>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Categoria Padre</label>
                                                    <select
                                                        className="form-select"
                                                        value={categoryFormData.parentId || ''}
                                                        onChange={(e) => setCategoryFormData(prev => ({
                                                            ...prev,
                                                            parentId: e.target.value ? parseInt(e.target.value) : undefined
                                                        }))}
                                                    >
                                                        <option value="">Nessuna (Categoria principale)</option>
                                                        {categories
                                                            .filter(c => c.id !== editingCategory?.id)
                                                            .map(category => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                                <div className="row">
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Ordine di Visualizzazione</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="0"
                                                                value={categoryFormData.sortOrder}
                                                                onChange={(e) => setCategoryFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Status</label>
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={categoryFormData.active}
                                                                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, active: e.target.checked }))}
                                                                />
                                                                <label className="form-check-label">
                                                                    Categoria Attiva
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descrizione */}
                                        <div className="mb-3">
                                            <label className="form-label">Descrizione</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={categoryFormData.description}
                                                onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Descrizione della categoria per SEO e visualizzazione..."
                                            ></textarea>
                                        </div>
                                    </form>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={activeTab === 'products' ? resetProductForm : resetCategoryForm}
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    onClick={activeTab === 'products' ? handleProductSubmit : handleCategorySubmit}
                                >
                                    <Save className="me-2" size={16} />
                                    {activeTab === 'products' ?
                                        (editingProduct ? 'Aggiorna' : 'Salva') + ' Prodotto' :
                                        (editingCategory ? 'Aggiorna' : 'Salva') + ' Categoria'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;