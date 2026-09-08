import { useEffect, useState } from 'react';
import { getReservations, getYears } from '../services/api';

function groupByCustomer(reservations) {
  const groups = new Map();

  for (const r of reservations) {
    const key = r.customer.id;
    if (!groups.has(key)) {
      groups.set(key, {
        customer: r.customer,
        tables: [],
        total: 0,
        statuses: new Set(),
      });
    }
    const group = groups.get(key);
    group.tables.push(...r.tables.map((t) => t.table_code));
    group.total += Number(r.total_amount);
    group.statuses.add(r.payment_status);
  }

  return Array.from(groups.values());
}

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [paymentStatus, setPaymentStatus] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    getYears()
      .then(setYears)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const params = { year };
    if (paymentStatus) params.payment_status = paymentStatus;
    if (customerName) params.customer_name = customerName;

    getReservations(params)
      .then(setReservations)
      .catch((err) => setError(err.message));
  }, [year, paymentStatus, customerName]);

  const grouped = groupByCustomer(reservations);

  return (
    <div>
      <h2>Reservations</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Year</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {!years.includes(year) && <option value={year}>{year}</option>}
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <label>Payment Status</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label>Search Customer</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name..."
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Tables</th>
            <th>Payment</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((g) => (
            <tr key={g.customer.id}>
              <td>{g.customer.name}</td>
              <td>{g.customer.phone}</td>
              <td>{g.tables.join(', ')}</td>
              <td>{Array.from(g.statuses).join(' / ')}</td>
              <td>{g.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {grouped.length === 0 && <p>No reservations found.</p>}
    </div>
  );
}

export default ReservationsPage;