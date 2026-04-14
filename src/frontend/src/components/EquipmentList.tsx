import { useState, useEffect } from 'react';
import { listEquipment } from '../api/equipment';
import { bookRental } from '../api/rentals';
import { request } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Equipment, User, BookingResponse } from '../types/api';

export function EquipmentList() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<Equipment[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [meResult, setMeResult] = useState<User | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [bookingItem, setBookingItem] = useState<Equipment | null>(null);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  useEffect(() => {
    listEquipment()
      .then(setItems)
      .catch((e: Error) => setListError(e.message))
      .finally(() => setListLoading(false));
  }, []);

  async function handleMe() {
    setMeLoading(true);
    setMeResult(null);
    try {
      const me = await request<User>('/users/me', { auth: true });
      setMeResult(me);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error fetching profile');
    } finally {
      setMeLoading(false);
    }
  }

  function openBooking(item: Equipment) {
    setBookingItem(item);
    setBookingError('');
    setBookingResult(null);
    setStartAt('');
    setEndAt('');
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingItem) return;
    setBookingError('');
    setBookingLoading(true);
    try {
      const res = await bookRental({
        EquipmentID: bookingItem.ID,
        StartAt: new Date(startAt).toISOString(),
        EndAt: new Date(endAt).toISOString(),
      });
      setBookingResult(res);
      setBookingItem(null);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  }

  if (listLoading) return <p>Loading equipment…</p>;
  if (listError) return <p>Error: {listError}</p>;

  return (
    <div>
      <h2>Equipment</h2>

      <p>
        Logged in as: <strong>{user?.Name}</strong> ({user?.Role})
        {' | '}
        <button onClick={handleMe} disabled={meLoading}>
          {meLoading ? '…' : 'Кто я?'}
        </button>
        {' | '}
        <button onClick={logout}>Logout</button>
      </p>

      {meResult && (
        <pre>
          ID: {meResult.ID}{'\n'}
          Name: {meResult.Name}{'\n'}
          Email: {meResult.Email}{'\n'}
          Role: {meResult.Role}
        </pre>
      )}

      {bookingResult && (
        <p>
          Reservation #{bookingResult.ReservationID} created — Status:{' '}
          {bookingResult.Status}, Estimated cost: {bookingResult.EstimatedCost}
          {' '}
          <button onClick={() => setBookingResult(null)}>×</button>
        </p>
      )}

      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Daily Rate</th>
            <th>Qty</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ID}>
              <td>{item.ID}</td>
              <td>{item.Name}</td>
              <td>{item.Category}</td>
              <td>{item.Type}</td>
              <td>{item.DailyRate}</td>
              <td>{item.Quantity}</td>
              <td>
                {user?.Role === 'customer' ? (
                  <button onClick={() => openBooking(item)}>Арендовать</button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bookingItem && (
        <div>
          <h3>Book: {bookingItem.Name}</h3>
          <form onSubmit={handleBook}>
            <div>
              <label>
                Start:{' '}
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                End:{' '}
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </label>
            </div>
            {bookingError && <p>{bookingError}</p>}
            <button type="submit" disabled={bookingLoading}>
              {bookingLoading ? 'Booking…' : 'Confirm'}
            </button>{' '}
            <button type="button" onClick={() => setBookingItem(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}