import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit, Heart, ShoppingBag } from 'lucide-react';
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

  // get unique categories from loaded equipment
  const allCategories = [...new Set(equipment.map(item => item.Category))].sort();

  // filter by search and category
  let filtered = equipment;

  if (debouncedSearch) {
    const searchLower = debouncedSearch.toLowerCase();
    filtered = filtered.filter(item =>
      item.Name.toLowerCase().includes(searchLower) ||
      item.Category.toLowerCase().includes(searchLower)
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter(item => item.Category === categoryFilter);
  }

  // sort the results
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name-asc') return a.Name.localeCompare(b.Name);
    if (sort === 'name-desc') return b.Name.localeCompare(a.Name);

    const priceA = parseFloat(a.DailyRate) || parseFloat(a.SalePrice) || 0;
    const priceB = parseFloat(b.DailyRate) || parseFloat(b.SalePrice) || 0;

    if (sort === 'price-asc') return priceA - priceB;
    return priceB - priceA;
  });

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
            className="form-input"
            style={{ paddingLeft: 32, padding: '6px 12px 6px 32px' }}
            placeholder="Search equipment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* Show how many results and clear button */}
      {(debouncedSearch || categoryFilter || typeFilter) && (
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {sorted.length} result{sorted.length !== 1 ? 's' : ''}
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
      ) : sorted.length === 0 ? (
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
          {sorted.map(item => {
            const cartType = item.Type === 'sale' ? 'sale' : 'rental';
            const inCart = isInCart(item.ID, cartType);
            const saved = isSaved(item.ID);

            return (
              <div key={item.ID} className="eq-card">
                {/* Image with wishlist button on top */}
                <div style={{ position: 'relative' }}>
                  {item.Images && item.Images.length > 0 ? (
                    <img src={item.Images[0]} alt={item.Name} className="eq-card-img" />
                  ) : (
                    <div className="eq-card-img-placeholder"><Package size={48} /></div>
                  )}
                  <button
                    onClick={() => toggle(item.ID)}
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
                    <span className="eq-card-category">{item.Category}</span>
                    <Badge color={getEquipmentTypeColor(item.Type)}>{getEquipmentTypeLabel(item.Type)}</Badge>
                  </div>
                  <div className="eq-card-name">{item.Name}</div>
                  {item.Description && (
                    <div className="text-sm text-muted" style={{ lineHeight: 1.4 }}>
                      {item.Description.slice(0, 72)}{item.Description.length > 72 ? '…' : ''}
                    </div>
                  )}
                  <div>
                    {(item.Type === 'rental' || item.Type === 'both') && (
                      <div>
                        <span className="eq-card-price">{formatCurrency(item.DailyRate)}</span>
                        <span className="eq-card-price-sub"> / day</span>
                      </div>
                    )}
                    {(item.Type === 'sale' || item.Type === 'both') && (
                      <div>
                        <span className="eq-card-price">{formatCurrency(item.SalePrice)}</span>
                        <span className="eq-card-price-sub"> price</span>
                      </div>
                    )}
                  </div>
                  <div className="eq-card-status">
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: item.Quantity > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      display: 'inline-block',
                    }} />
                    {item.Quantity > 0 ? `In stock: ${item.Quantity} units` : 'Out of stock'}
                  </div>
                </div>

                <div className="eq-card-footer" style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/equipment/${item.ID}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-secondary btn-sm btn-icon"
                    title={inCart ? 'Already in cart' : 'Add to cart'}
                    disabled={inCart || item.Quantity === 0}
                    onClick={() => addItem({
                      equipmentId: item.ID,
                      equipmentName: item.Name,
                      category: item.Category,
                      itemType: cartType,
                      quantity: 1,
                      dailyRate: item.DailyRate,
                      salePrice: item.SalePrice,
                    })}
                  >
                    <ShoppingBag size={15} style={{ color: inCart ? 'var(--color-primary)' : undefined }} />
                  </button>
                  {canManageEquipment && (
                    <button
                      className="btn btn-secondary btn-sm btn-icon"
                      title="Edit"
                      onClick={() => navigate(`/equipment/${item.ID}/edit`)}
                    >
                      <Edit size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
