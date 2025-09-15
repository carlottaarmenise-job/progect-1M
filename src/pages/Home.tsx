import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Form, Row, Spinner, Badge } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../data/api';
import { useCategories } from '../context/CategoryContext';

export default function Home() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Usa il CategoryContext per le categorie dinamiche
    const { categories: dynamicCategories, fetchCategories } = useCategories();

    const [searchParams, setSearchParams] = useSearchParams();
    const qParam = searchParams.get('q') ?? '';
    const catParam = searchParams.get('category') ?? 'all';
    const sortParam = (searchParams.get('sort') as 'none' | 'price-asc' | 'price-desc') ?? 'none';
    const orderSuccess = searchParams.get('order') === 'success';

    const [q, setQ] = useState(qParam);
    const [category, setCategory] = useState<string>(catParam);
    const [sort, setSort] = useState<'none' | 'price-asc' | 'price-desc'>(sortParam);

    const [qDebounced, setQDebounced] = useState(q);
    useEffect(() => {
        const t = setTimeout(() => setQDebounced(q), 300);
        return () => clearTimeout(t);
    }, [q]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        if (q) next.set('q', q); else next.delete('q');
        if (category && category !== 'all') next.set('category', category); else next.delete('category');
        if (sort && sort !== 'none') next.set('sort', sort); else next.delete('sort');
        setSearchParams(next, { replace: true });
    }, [q, category, sort]);

    // Carica prodotti dalla API locale
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getProducts()
            .then((list) => { if (!cancelled) setData(list); })
            .catch(() => { if (!cancelled) setData([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    // Carica le categorie 
    useEffect(() => {
        fetchCategories();
    }, []);

    const categories = useMemo(() => {
        const activeCategories = dynamicCategories
            .filter(cat => cat.active)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(cat => cat.slug);

        return ['all', ...activeCategories];
    }, [dynamicCategories]);

    // Filtra per slug delle categorie 
    const filtered = useMemo(() => {
        let list = data.filter(p =>
            p?.name.toLowerCase().includes(qDebounced.toLowerCase()) ||
            p?.category.toLowerCase().includes(qDebounced.toLowerCase())
        );

        if (category !== 'all') {
            // Trova la categoria  corrispondente
            const selectedCategory = dynamicCategories.find(cat => cat.slug === category);
            if (selectedCategory) {
                list = list.filter(p =>
                    p.category.toLowerCase() === selectedCategory.name.toLowerCase() ||
                    p.categoryId === selectedCategory.id
                );
            }
        }

        if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
        return list;
    }, [data, qDebounced, category, sort, dynamicCategories]);

    useEffect(() => {
        if (orderSuccess) {
            const t = setTimeout(() => {
                const next = new URLSearchParams(searchParams);
                next.delete('order');
                setSearchParams(next, { replace: true });
            }, 3200);
            return () => clearTimeout(t);
        }
    }, [orderSuccess, searchParams, setSearchParams]);

    // ottiene il nome visualizzato della categoria
    const getCategoryDisplayName = (categorySlug: string) => {
        if (categorySlug === 'all') return 'Tutte le categorie';
        const category = dynamicCategories.find(cat => cat.slug === categorySlug);
        return category ? category.name : categorySlug;
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h1 className="h3 m-0">Catalogo</h1>

                <Form className="w-auto d-flex gap-2">
                    <Form.Control
                        size="sm"
                        type="search"
                        placeholder="Cerca..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <Form.Select
                        size="sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        title="Categoria"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>
                                {getCategoryDisplayName(c)}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        size="sm"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        title="Ordina per prezzo"
                    >
                        <option value="none">Ordina</option>
                        <option value="price-asc">Prezzo: crescente</option>
                        <option value="price-desc">Prezzo: decrescente</option>
                    </Form.Select>
                </Form>
            </div>

            {orderSuccess && (
                <Alert
                    variant="success"
                    onClose={() => { const next = new URLSearchParams(searchParams); next.delete('order'); setSearchParams(next, { replace: true }); }}
                    dismissible
                >
                    Ordine completato! 🎉
                </Alert>
            )}

            {loading && (
                <div className="py-5 text-center">
                    <Spinner animation="border" role="status" />
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <Alert variant="secondary">Nessun prodotto trovato.</Alert>
            )}

            {!loading && filtered.length > 0 && (
                <div className="mb-2">
                    <Badge bg="secondary">{filtered.length}</Badge> prodotti
                </div>
            )}

            <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                {filtered.map(p => (
                    <Col key={p.id}>
                        <ProductCard product={p} />
                    </Col>
                ))}
            </Row>
        </>
    );
}