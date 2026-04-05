// ─── ProductCard ──────────────────────────────────────────────────────────────
// Glassmorphism product card matching the yume.rent visual language.
import React, { useState } from 'react';
import { ShoppingCart, Heart, Zap } from 'lucide-react';
import type { Product } from './types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <div
      className="glass noise-overlay relative flex flex-col rounded-2xl overflow-hidden group transition-all duration-300"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
        (e.currentTarget as HTMLElement).style.background  = 'var(--bg-card-hover)';
        (e.currentTarget as HTMLElement).style.transform   = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.background  = 'var(--bg-card)';
        (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isNew && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full font-display tracking-wider"
            style={{ background: 'var(--accent)', color: '#09090b' }}
          >
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.8)', color: '#fff', backdropFilter: 'blur(8px)' }}
          >
            Комплект
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => setWishlisted(v => !v)}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
      >
        <Heart
          size={14}
          style={{ color: wishlisted ? '#f87171' : 'var(--text-secondary)' }}
          fill={wishlisted ? '#f87171' : 'none'}
        />
      </button>

      {/* Image */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Zap size={32} style={{ color: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>No image</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.7) 0%, transparent 60%)' }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category label */}
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.category}</span>

        {/* Name */}
        <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2"
          style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Specs preview */}
        {product.specs && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
              <span key={k} className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}:</span> {v}
              </span>
            ))}
          </div>
        )}

        {/* Price + half-shift */}
        <div className="mt-auto">
          {product.priceHalf && (
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Пол-смены: {product.priceHalf.toLocaleString('ru-KZ')} ₸
            </p>
          )}
          <p className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            {product.price.toLocaleString('ru-KZ')} ₸
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background:    adding        ? 'rgba(0,245,212,0.2)' : 'var(--accent)',
            color:         adding        ? 'var(--accent)'       : '#09090b',
            border:        adding        ? '1px solid var(--accent)' : '1px solid transparent',
            cursor:        product.inStock ? 'pointer' : 'not-allowed',
            opacity:       product.inStock ? 1 : 0.4,
          }}
        >
          <ShoppingCart size={14} />
          {adding ? 'Добавлено!' : product.inStock ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </div>
  );
};
