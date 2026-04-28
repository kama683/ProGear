import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit, Heart, ShoppingBag, ArrowUp, ArrowDown } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingCenter } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, getEquipmentTypeLabel, getEquipmentTypeColor } from '../../utils/format';

type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export function EquipmentListPage() {
  const { canManageEquipment } = useAuth();
  const { addItem, isInCart } = useCart();
  const { toggle, isSaved } = useWishlist();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('name-asc');
  const debouncedSearch = useDebounce(search, 300);

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', typeFilter],
    queryFn: () => listEquipment(typeFilter ? { type: typeFilter } : undefined),
  });

  const categories = useMemo(() => [...new Set(equipment.map(e => e.Category))].sort(), [equipment]);

  const filtered = useMemo(() => {
    let list = equipment;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(e => e.Name.toLowerCase().includes(q) || e.Category.toLowerCase().includes(q));
    }
    if (categoryFilter) list = list.filter(e => e.Category === categoryFilter);

    return [...list].sort((a, b) => {
      if (sort === 'name-asc') return a.Name.localeCompare(b.Name);
      if (sort === 'name-desc') return b.Name.localeCompare(a.Name);
      const pa = parseFloat(a.DailyRate) || parseFloat(a.SalePrice) || 0;
      const pb = parseFloat(b.DailyRate) || parseFloat(b.SalePrice) || 0;
      return sort === 'price-asc' ? pa - pb : pb - pa;
    });
  }, [equipment, debouncedSearch, categoryFilter, sort]);

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Equipment</div>
          <div className="page-subtitle">Equipment catalog for rental and sale</div>
        </div>
        {canManageEquipment && (
          <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="filters-bar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-input" style={{ paddingLeft: 32, padding: '6px 12px 6px 32px' }}
            placeholder="Search equipment..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="rental">Rental</option>
          <option value="sale">Sale</option>
          <option value="both">Rental + Sale</option>
        </select>
        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* Results info */}
      {(debouncedSearch || categoryFilter || typeFilter) && (
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {debouncedSearch && <> for "<strong>{debouncedSearch}</strong>"</>}
          {' '}
          {(typeFilter || categoryFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, padding: '2px 8px', marginLeft: 4 }}
              onClick={() => { setTypeFilter(''); setCategoryFilter(''); setSearch(''); }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {error ? (
        <div className="alert alert-error">Load error: {(error as Error).message}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No equipment found"
          description={debouncedSearch || typeFilter || categoryFilter ? 'Try adjusting the filters' : 'The catalog is empty'}
          action={canManageEquipment ? (
            <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>
              <Plus size={16} /> Add Equipment
            </button>
          ) : undefined}
        />
      ) : (
        <div className="eq-grid">
          {filtered.map(eq => {
            const cartType = eq.Type === 'sale' ? 'sale' : 'rental';
            const inCart = isInCart(eq.ID, cartType);
            const saved = isSaved(eq.ID);

            return (
              <div key={eq.ID} className="eq-card">
                {/* Image */}
                <div style={{ position: 'relative' }}>
                  {eq.Images && eq.Images.length > 0 ? (
                    <img src={eq.Images[0]} alt={eq.Name} className="eq-card-img" />
                  ) : (
                    <div className="eq-card-img-placeholder"><Package size={48} /></div>
                  )}
                  {/* Wishlist heart */}
                  <button
                    onClick={() => toggle(eq.ID)}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                    title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={15} style={{ fill: saved ? '#ef4444' : 'transparent', color: saved ? '#ef4444' : 'var(--color-text-muted)' }} />
                  </button>
                </div>

                <div className="eq-card-body">
                  <div className="eq-card-meta">
                    <span className="eq-card-category">{eq.Category}</span>
                    <Badge color={getEquipmentTypeColor(eq.Type)}>{getEquipmentTypeLabel(eq.Type)}</Badge>
                  </div>
                  <div className="eq-card-name">{eq.Name}</div>
                  {eq.Description && (
                    <div className="text-sm text-muted" style={{ lineHeight: 1.4 }}>
                      {eq.Description.slice(0, 72)}{eq.Description.length > 72 ? '…' : ''}
                    </div>
                  )}
                  <div>
                    {(eq.Type === 'rental' || eq.Type === 'both') && (
                      <div><span className="eq-card-price">{formatCurrency(eq.DailyRate)}</span><span className="eq-card-price-sub"> / day</span></div>
                    )}
                    {(eq.Type === 'sale' || eq.Type === 'both') && (
                      <div><span className="eq-card-price">{formatCurrency(eq.SalePrice)}</span><span className="eq-card-price-sub"> price</span></div>
                    )}
                  </div>
                  <div className="eq-card-status">
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: eq.Quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-block' }} />
                    {eq.Quantity > 0 ? `In stock: ${eq.Quantity} units` : 'Out of stock'}
                  </div>
                </div>

                <div className="eq-card-footer" style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/equipment/${eq.ID}`)}>
                    View Details
                  </button>
                  <button
                    className="btn btn-secondary btn-sm btn-icon"
                    title={inCart ? 'Already in cart' : 'Add to cart'}
                    disabled={inCart || eq.Quantity === 0}
                    onClick={() => addItem({
                      equipmentId: eq.ID, equipmentName: eq.Name, category: eq.Category,
                      itemType: cartType, quantity: 1,
                      dailyRate: eq.DailyRate, salePrice: eq.SalePrice,
                    })}
                  >
                    <ShoppingBag size={15} style={{ color: inCart ? 'var(--color-primary)' : undefined }} />
                  </button>
                  {canManageEquipment && (
                    <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => navigate(`/equipment/${eq.ID}/edit`)}>
                      <Edit size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sort indicators in header for UX hint */}
      <div style={{ display: 'none' }}>
        <ArrowUp /><ArrowDown />
      </div>
    </div>
  );
}
