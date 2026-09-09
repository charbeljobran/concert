import { useEffect, useState } from 'react';
import { getTables } from '../../services/api';
import './VenueMap.css';

const GRID_ORIGIN_X = 100;
const GRID_ORIGIN_Y = 100;
const GRID_SPACING_X = 130;
const GRID_SPACING_Y = 110;

function snapToGrid(value, origin, spacing) {
  return origin + Math.round((value - origin) / spacing) * spacing;
}

function VenueMap({ selectedTableIds, onToggleSelect, onReservedClick, highlightedTableIds, placementMode, onPlaceTable }) {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTables()
      .then(setTables)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;

  const handleClick = (table) => {
    if (table.is_reserved) {
      onReservedClick(table);
    } else {
      onToggleSelect(table.id);
    }
  };

  const handleMapClick = (e) => {
    if (!placementMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const x = snapToGrid(rawX, GRID_ORIGIN_X, GRID_SPACING_X);
    const y = snapToGrid(rawY, GRID_ORIGIN_Y, GRID_SPACING_Y);

    onPlaceTable(x, y);
  };

  // Draw grid lines that pass exactly through each table's center point
  // (table buttons are 42px, so the center is 21px past its left/top).
  const CELL_SIZE = 42;
  const gridBackgroundStyle = {
    backgroundImage: `
      repeating-linear-gradient(to right, var(--border) 0, var(--border) 1px, transparent 1px, transparent ${GRID_SPACING_X}px),
      repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 1px, transparent 1px, transparent ${GRID_SPACING_Y}px)
    `,
    backgroundPosition: `${GRID_ORIGIN_X + CELL_SIZE / 2}px 0, 0 ${GRID_ORIGIN_Y + CELL_SIZE / 2}px`,
  };

  return (
    <div className="venue-map-wrapper">
      <div
        className="venue-map"
        onClick={handleMapClick}
        style={{ cursor: placementMode ? 'crosshair' : 'default', ...gridBackgroundStyle }}
      >
        {tables.map((table) => {
          const isSelected = selectedTableIds.includes(table.id);
          let statusClass = 'available';
          if (table.is_reserved) statusClass = 'reserved';
          else if (isSelected) statusClass = 'selected';

          const classes = ['table-button', statusClass];
          if (highlightedTableIds.length > 0) {
            classes.push(highlightedTableIds.includes(table.id) ? 'highlighted' : 'faded');
          }

          return (
            <button
              key={table.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(table);
              }}
              className={classes.join(' ')}
              style={{ left: `${table.x_position}px`, top: `${table.y_position}px` }}
            >
              {table.table_code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VenueMap;
