import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Package, ShoppingBag, Edit } from 'lucide-react';
import { listEquipment } from '../../api/equipment';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingCenter } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, getEquipmentTypeLabel, getEquipmentTypeColor } from '../../utils/format';

export function WishlistPage() {
  const navigate = useNavigate();
  const { ids, toggle } = useWishlist();
  const { addItem, isInCart } = useCart();
  const { canManageEquipment } = useAuth();

  const { data: allEquipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => listEquipment(),
  });

  const saved = allEquipment.filter(e => ids.includes(e.ID));

  if (isLoading) return <LoadingCenter />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Wishlist</div>
          <div className="page-subtitle">{ids.length} saved item{ids.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <Heart size={48} style={{ marginBottom: 12, opacity: 0.25 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Your wishlist is empty</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>Tap the heart icon on any equipment to save it here</div>
          <button className="btn btn-primary" onClick={() => navigate('/equipment')}>
            <Package size={16} /> Browse Equipment
          </button>
        </div>
      ) : (
        <div className="eq-grid">
          {saved.map(eq => (
            <div key={eq.ID} className="eq-card">
              {eq.Images && eq.Images.length > 0 ? (
                <img src={eq.Images[0]} alt={eq.Name} className="eq-card-img" />
              ) : (
                <div className="eq-card-img-placeholder"><Package size={48} /></div>
              )}
              <div className="eq-card-body">
                <div className="eq-card-meta">
                  <span className="eq-card-category">{eq.Category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge color={getEquipmentTypeColor(eq.Type)}>{getEquipmentTypeLabel(eq.Type)}</Badge>
                    <button
                      onClick={() => toggle(eq.ID)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
                      title="Remove from wishlist"
                    >
                      <Heart size={16} style={{ fill: '#ef4444', color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
                <div className="eq-card-name">{eq.Name}</div>
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
                  {eq.Quantity > 0 ? `In stock: ${eq.Quantity}` : 'Out of stock'}
                </div>
              </div>
              <div className="eq-card-footer" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/equipment/${eq.ID}`)}>
                  View Details
                </button>
                <button
                  className="btn btn-secondary btn-sm btn-icon"
                  title="Add to cart"
                  onClick={() => addItem({
                    equipmentId: eq.ID, equipmentName: eq.Name, category: eq.Category,
                    itemType: eq.Type === 'sale' ? 'sale' : 'rental',
                    quantity: 1, dailyRate: eq.DailyRate, salePrice: eq.SalePrice,
                  })}
                  disabled={isInCart(eq.ID, eq.Type === 'sale' ? 'sale' : 'rental')}
                >
                  <ShoppingBag size={15} />
                </button>
                {canManageEquipment && (
                  <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => navigate(`/equipment/${eq.ID}/edit`)}>
                    <Edit size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
