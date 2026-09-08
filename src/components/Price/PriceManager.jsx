import { useEffect, useState } from 'react';
import { getPrices, setPrice } from '../../services/api';
import './PriceManager.css';

function PriceManager() {
  const [prices, setPrices] = useState([]);
  const [viewYear, setViewYear] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadPrices = () => {
    getPrices()
      .then((data) => {
        setPrices(data);
        if (data.length > 0 && viewYear === null) {
          setViewYear(data[0].year);
        }
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await setPrice(Number(year), Number(amount));
      setAmount('');
      loadPrices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedPrice = prices.find((p) => p.year === Number(viewYear));

  return (
    <div className="price-manager">
      <h2>Prices</h2>
      {error && <p className="modal-error">{error}</p>}

      {prices.length > 0 && (
        <div className="price-lookup">
          <select value={viewYear ?? ''} onChange={(e) => setViewYear(Number(e.target.value))}>
            {prices.map((p) => (
              <option key={p.year} value={p.year}>{p.year}</option>
            ))}
          </select>
          <span className="price-lookup-value">
            {selectedPrice ? `${selectedPrice.amount_per_table} per table` : '—'}
          </span>
        </div>
      )}
      {prices.length === 0 && <p className="price-empty">No prices set yet.</p>}

      <form onSubmit={handleSubmit} className="price-form">
        <div className="price-form-row">
          <div>
            <label>Year</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>
          <div>
            <label>Price per Table</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Set Price'}
        </button>
      </form>
    </div>
  );
}

export default PriceManager;