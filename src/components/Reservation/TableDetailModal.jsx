import { useEffect, useState } from 'react';
import { getTable, updateReservation, removeTableFromReservation } from '../../services/api';
import './TableDetailModal.css';

function TableDetailModal({ tableId, onClose, onTableLoaded, onReservationChanged, onAddMore }) {
  const [table, setTable] = useState(null);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTable();
  }, [tableId]);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const loadTable = () => {
    getTable(tableId)
      .then((data) => {
        setTable(data);
        if (data.reservations?.[0]) {
          const reservation = data.reservations[0];
          setPaymentStatus(reservation.payment_status);
          setNotes(reservation.notes || '');
          onTableLoaded(reservation.tables.map((t) => t.id));
        }
      })
      .catch((err) => setError(err.message));
  };

  const reservation = table?.reservations?.[0];

  const handleSaveStatus = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateReservation(reservation.id, { payment_status: paymentStatus, notes });
      loadTable();
      onReservationChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTable = async (removeTableId) => {
    setError(null);
    try {
      await removeTableFromReservation(reservation.id, removeTableId);
      onClose();
      onReservationChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {error && <p className="modal-error">{error}</p>}
        {!table && !error && <p>Loading...</p>}

        {table && reservation && (
          <>
            <div className="modal-header">
              <h2>Table {table.table_code}</h2>
              <span className="modal-subtitle">Reserved</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Customer</span>
              <span className="detail-value">{reservation.customer.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{reservation.customer.phone}</span>
            </div>

            <div className="modal-section">
              <label>Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="modal-section">
              <label>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <button className="btn-primary btn-full" onClick={handleSaveStatus} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <div className="modal-section">
              <label>Tables in this reservation</label>
              <div className="table-list">
                {reservation.tables.map((t) => (
                  <div className="table-list-row" key={t.id}>
                    <span className="table-code-badge">{t.table_code}</span>
                    <button className="btn-remove" onClick={() => handleRemoveTable(t.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => onAddMore(reservation.id)}>
                Add More Tables
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {table && !reservation && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableDetailModal;