import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { Product } from '../types';
import { getProducts, saveProducts } from '../data/api';
import { useToast } from '../context/ToastContext';

interface ProductFormData {
    title: string;
    category: "men's clothing" | "women's clothing" | "jewelery" | "electronics";
    price: number;
    originalPrice?: number;
    description: string;
    imageFile: string;
    colors: string[];
    isNew: boolean;
    isSale: boolean;
}

const AdminPanel: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        category: "men's clothing",
        price: 0,
        originalPrice: undefined,
        description: '',
        imageFile: '',
        colors: ['#000000'],
        isNew: false,
        isSale: false
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        loadProducts();
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

    const resetForm = () => {
        setFormData({
            title: '',
            category: "men's clothing",
            price: 0,
            originalPrice: undefined,
            description: '',
            imageFile: '',
            colors: ['#000000'],
            isNew: false,
            isSale: false
        });
        setImagePreview('');
        setUploadedImage(null);
        setEditingProduct(null);
        setShowForm(false);
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
                    setFormData(prev => ({ ...prev, imageFile: file.name }));
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Seleziona un file immagine valido', 'danger');
            }
        }
    };

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...formData.colors];
        newColors[index] = color;
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    const addColor = () => {
        if (formData.colors.length < 5) {
            setFormData(prev => ({ ...prev, colors: [...prev.colors, '#000000'] }));
        }
    };

    const removeColor = (index: number) => {
        if (formData.colors.length > 1) {
            const newColors = formData.colors.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, colors: newColors }));
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            category: product.category as any,
            price: product.price,
            originalPrice: product.originalPrice,
            description: product.description || '',
            imageFile: product.imageFile,
            colors: product.colors || ['#000000'],
            isNew: product.isNew || false,
            isSale: product.isSale || false
        });
        setImagePreview(product.image);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim() || formData.price <= 0) {
            showToast('Compila tutti i campi obbligatori', 'warning');
            return;
        }

        if (!editingProduct && !uploadedImage && !imagePreview) {
            showToast('Seleziona un\'immagine per il prodotto', 'warning');
            return;
        }

        try {
            const newProduct: Product = {
                id: editingProduct ? editingProduct.id : Date.now(),
                title: formData.title,
                category: formData.category,
                price: formData.price,
                originalPrice: formData.isSale ? formData.originalPrice : undefined,
                rating: editingProduct ? editingProduct.rating : 0,
                reviews: editingProduct ? editingProduct.reviews : 0,
                image: imagePreview || `https://picsum.photos/300/300?random=${Date.now()}`,
                imageFile: formData.imageFile || `product-${Date.now()}.jpg`,
                colors: formData.colors,
                isNew: formData.isNew,
                isSale: formData.isSale,
                description: formData.description
            };

            let updatedProducts: Product[];
            if (editingProduct) {
                // Aggiorna prodotto
                updatedProducts = products.map(p =>
                    p.id === editingProduct.id ? newProduct : p
                );
                showToast('Prodotto aggiornato con successo!', 'success');
            } else {
                // Aggiungi nuovo prodotto
                updatedProducts = [...products, newProduct];
                showToast('Prodotto aggiunto con successo!', 'success');
            }

            setProducts(updatedProducts);
            saveProducts(updatedProducts);
            resetForm();
        } catch (error) {
            showToast('Errore nel salvare il prodotto', 'danger');
        }
    };

    const handleDelete = async (productId: number) => {
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

    const getCategoryBadgeColor = (category: string) => {
        const colors = {
            "men's clothing": 'primary',
            "women's clothing": 'success',
            "jewelery": 'warning',
            "electronics": 'info'
        };
        return colors[category as keyof typeof colors] || 'secondary';
    };

    if (loading) {
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
                            <p className="text-white-50 mb-0">Gestisci il catalogo prodotti</p>
                        </div>
                        <button
                            className="btn btn-light btn-lg"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="me-2" size={20} />
                            Aggiungi Prodotto
                        </button>
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
                                            <h5 className="card-title">Nuovi Arrivi</h5>
                                            <h3 className="mb-0">{products.filter(p => p.isNew).length}</h3>
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
                                            <h5 className="card-title">Categorie</h5>
                                            <h3 className="mb-0">{new Set(products.map(p => p.category)).size}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
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
                                                        alt={product.title}
                                                        className="rounded"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>{product.title}</strong>
                                                        <br />
                                                        <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getCategoryBadgeColor(product.category)}`}>
                                                        {product.category}
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
                                                    <div className="d-flex flex-column gap-1">
                                                        {product.isNew && <span className="badge bg-success">Nuovo</span>}
                                                        {product.isSale && <span className="badge bg-danger">Offerta</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => handleEdit(product)}
                                                            title="Modifica"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDelete(product.id)}
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
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Modifica Prodotto' : 'Aggiungi Nuovo Prodotto'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={resetForm}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
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
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Categoria *</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                                                >
                                                    <option value="men's clothing">Men's Clothing</option>
                                                    <option value="women's clothing">Women's Clothing</option>
                                                    <option value="jewelery">Jewelery</option>
                                                    <option value="electronics">Electronics</option>
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
                                                                value={formData.price}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Prezzo Originale</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">€</span>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="0"
                                                                step="0.01"
                                                                value={formData.originalPrice || ''}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                                                                disabled={!formData.isSale}
                                                            />
                                                        </div>
                                                    </div>
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
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Colori */}
                                    <div className="mb-3">
                                        <label className="form-label">Colori Disponibili</label>
                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                            {formData.colors.map((color, index) => (
                                                <div key={index} className="d-flex align-items-center gap-1">
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color"
                                                        value={color}
                                                        onChange={(e) => handleColorChange(index, e.target.value)}
                                                    />
                                                    {formData.colors.length > 1 && (
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
                                            {formData.colors.length < 5 && (
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
                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.isNew}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                                                />
                                                <label className="form-check-label">
                                                    Nuovo Arrivo
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={formData.isSale}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                                                />
                                                <label className="form-check-label">
                                                    In Offerta
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetForm}
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                >
                                    <Save className="me-2" size={16} />
                                    {editingProduct ? 'Aggiorna' : 'Salva'} Prodotto
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