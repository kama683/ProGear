import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { getReviews, createReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../ui/Spinner';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={onChange ? 26 : 14}
          style={{ cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#f59e0b' : 'var(--color-border-strong)', fill: n <= (hover || value) ? '#f59e0b' : 'transparent', transition: 'color 0.1s' }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ReviewsList({ equipmentId }: { equipmentId: number }) {
  const { user, isCustomer } = useAuth();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reviews', equipmentId],
    queryFn: () => getReviews(equipmentId),
  });

  const mutation = useMutation({
    mutationFn: () => createReview(equipmentId, { Rating: rating, Comment: comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', equipmentId] });
      success('Review submitted!', 'Thank you for your feedback');
      setComment(''); setRating(5); setShowForm(false);
    },
    onError: (err: Error) => toastError('Cannot submit review', err.message),
  });

  const userHasReviewed = summary?.Reviews?.some(r => r.UserID === user?.ID);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={14} />
          Reviews
          {summary && summary.TotalReviews > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <StarRating value={Math.round(summary.AverageRating)} />
              <span style={{ color: 'var(--color-text-muted)' }}>({summary.TotalReviews})</span>
            </span>
          )}
        </span>
        {isCustomer && !userHasReviewed && !showForm && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Review form */}
        {showForm && (
          <div style={{ border: '1.5px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)', padding: 16, background: 'var(--color-primary-light)' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Your Review</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>Rating</div>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Comment</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Spinner size="sm" white /> : null}
                Submit
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading reviews...</div>}

        {!isLoading && (!summary || summary.TotalReviews === 0) && !showForm && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            No reviews yet. Be the first!
          </div>
        )}

        {summary?.Reviews?.map(r => (
          <div key={r.ID} style={{ paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.UserName}</div>
                <StarRating value={r.Rating} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(r.CreatedAt)}</div>
            </div>
            {r.Comment && <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5, marginTop: 6 }}>{r.Comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
