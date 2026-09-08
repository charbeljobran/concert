import { useEffect, useState } from 'react';
import { createTable } from '../../services/api';
import '../Reservation/TableDetailModal.css';

function AddTableForm({ open, placementMode, pendingClick, onStartPlacement, onCancelPlacement, onTableAdded }) {
  const [tableCode, setTableCode] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const showModal = open || (placementMode && pendingClick);

  useEffect(() => {
    if (!showModal) return;
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
  }, [showModal]);

  const handleStart = (e) => {
    e.preventDefault();
    if (!tableCode) return;
    onStartPlacement();
  };

  const handleConfirmPlacement = async () => {
    setError(null);
    setSaving(true);
    try {
      await createTable({
        table_code: tableCode,
        x_position: pendingClick.x,
        y_position: pendingClick.y,
      });
      setTableCode('');
      onTableAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (placementMode && !pendingClick) {
    return (
      <div className="floating-action-bar">
        <span>Click anywhere on the map to place "{tableCode}"</span>
        <button className="btn-secondary" onClick={onCancelPlacement}>Cancel</button>
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={onCancelPlacement}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {error && <p className="modal-error">{error}</p>}

        {pendingClick ? (
          <>
            <div className="modal-header">
              <h2>Place Table</h2>
            </div>
            <p>Place "{tableCode}" at this spot on the map?</p>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleConfirmPlacement} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
              <button className="btn-secondary" onClick={onCancelPlacement}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <h2>Add New Table</h2>
            </div>
            <form onSubmit={handleStart}>
              <div className="modal-section">
                <label>Table Code</label>
                <input type="text" value={tableCode} onChange={(e) => setTableCode(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary btn-full">Place on Map</button>
            </form>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onCancelPlacement}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AddTableForm;