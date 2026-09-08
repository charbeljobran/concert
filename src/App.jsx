import { useState } from 'react';
import VenueMap from './components/Map/VenueMap';
import AddTableForm from './components/Map/AddTableForm';
import TableDetailModal from './components/Reservation/TableDetailModal';
import CreateReservationModal from './components/Reservation/CreateReservationModal';
import PriceManager from './components/Price/PriceManager';
import ReservationsPage from './pages/ReservationsPage';
import { addTablesToReservation } from './services/api';

function App() {
  const [view, setView] = useState('map');

  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [viewingTableId, setViewingTableId] = useState(null);
  const [highlightedTableIds, setHighlightedTableIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [addingToReservationId, setAddingToReservationId] = useState(null);
  const [addError, setAddError] = useState(null);

  const [addTableModalOpen, setAddTableModalOpen] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [pendingClick, setPendingClick] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleToggleSelect = (tableId) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    );
  };

  const handleReservationCreated = () => {
    setSelectedTableIds([]);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCloseViewModal = () => {
    setViewingTableId(null);
    setHighlightedTableIds([]);
  };

  const handleStartAdding = (reservationId) => {
    setAddingToReservationId(reservationId);
    setViewingTableId(null);
  };

  const handleCancelAdding = () => {
    setAddingToReservationId(null);
    setSelectedTableIds([]);
    setHighlightedTableIds([]);
    setAddError(null);
  };

  const handleConfirmAddTables = async () => {
    setAddError(null);
    try {
      await addTablesToReservation(addingToReservationId, selectedTableIds);
      setAddingToReservationId(null);
      setSelectedTableIds([]);
      setHighlightedTableIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setAddError(err.message);
    }
  };

  return (
    <div>
      <h1>Concert Table Reservations</h1>

      <nav>
        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>Map</button>
        <button className={view === 'reservations' ? 'active' : ''} onClick={() => setView('reservations')}>Reservations</button>
      </nav>

      <PriceManager />

      {view === 'map' && (
        <>
          <button className="btn-secondary" onClick={() => setAddTableModalOpen(true)}>
            + Add Table
          </button>

          <AddTableForm
            open={addTableModalOpen}
            placementMode={placementMode}
            pendingClick={pendingClick}
            onStartPlacement={() => {
              setAddTableModalOpen(false);
              setPlacementMode(true);
            }}
            onCancelPlacement={() => {
              setAddTableModalOpen(false);
              setPlacementMode(false);
              setPendingClick(null);
            }}
            onTableAdded={() => {
              setAddTableModalOpen(false);
              setPlacementMode(false);
              setPendingClick(null);
              setRefreshKey((prev) => prev + 1);
            }}
          />

          {addingToReservationId && (
            <p>
              Adding tables to reservation #{addingToReservationId} — click available tables on the map, then confirm.
            </p>
          )}
          {addError && <p style={{ color: 'red' }}>{addError}</p>}

          <VenueMap
            key={refreshKey}
            selectedTableIds={selectedTableIds}
            onToggleSelect={handleToggleSelect}
            onReservedClick={(table) => setViewingTableId(table.id)}
            highlightedTableIds={highlightedTableIds}
            placementMode={placementMode}
            onPlaceTable={(x, y) => setPendingClick({ x, y })}
          />

          {selectedTableIds.length > 0 && !addingToReservationId && (
            <div className="floating-action-bar">
              <span>{selectedTableIds.length} table(s) selected</span>
              <button onClick={() => setShowCreateModal(true)}>
                Reserve {selectedTableIds.length} Table(s)
              </button>
            </div>
          )}

          {addingToReservationId && selectedTableIds.length > 0 && (
            <div className="floating-action-bar">
              <span>{selectedTableIds.length} table(s) selected</span>
              <button onClick={handleConfirmAddTables}>
                Confirm: Add {selectedTableIds.length} Table(s)
              </button>
            </div>
          )}

          {addingToReservationId && (
            <button onClick={handleCancelAdding}>Cancel</button>
          )}

          {viewingTableId && (
            <TableDetailModal
              tableId={viewingTableId}
              onClose={handleCloseViewModal}
              onTableLoaded={setHighlightedTableIds}
              onReservationChanged={() => setRefreshKey((prev) => prev + 1)}
              onAddMore={handleStartAdding}
            />
          )}

          {showCreateModal && (
            <CreateReservationModal
              tableIds={selectedTableIds}
              onClose={() => setShowCreateModal(false)}
              onReservationCreated={handleReservationCreated}
            />
          )}
        </>
      )}

      {view === 'reservations' && <ReservationsPage />}
    </div>
  );
}

export default App;