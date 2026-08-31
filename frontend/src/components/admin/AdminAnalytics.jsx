import { useEffect, useState } from "react";
import { adminAnalytics } from "../../lib/adminApi";
import Select from "./Select";
import DatePicker from "./DatePicker";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

const pad = n => String(n).padStart(2, "0");
const toLocalIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayIso = () => toLocalIso(new Date());
const isoDaysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalIso(d);
};

// Validated categorical/status colors — see the dataviz palette reference.
const BLUE = "#2a78d6";
const ORANGE = "#eb6834";
const GREEN = "#0ca30c";
const STATUS_COLORS = { new: "#fab219", contacted: "#2a78d6", closed: "#0ca30c" };
const MESSAGE_STATUS_COLORS = { new: "#fab219", replied: "#2a78d6", spam: "#9ca3af" };
const fmtMoney = n => n.toLocaleString("en-US") + "֏";
const fmtDay = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function DayBarChart({ data, valueKey, color, formatValue }) {
  const max = Math.max(1, ...data.map(d => d[valueKey]));
  const w = 640, h = 160, gap = 4, padding = 4, baseline = h - 22;
  const barW = (w - padding * 2) / data.length - gap;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="adm-chart-svg" preserveAspectRatio="none" role="img" aria-label="Daily chart">
      <line x1={padding} y1={baseline} x2={w - padding} y2={baseline} stroke="var(--grey-200)" strokeWidth="1" />
      {data.map((d, i) => {
        const val = d[valueKey];
        const barH = val === 0 ? 2 : Math.max(4, (val / max) * (baseline - 20));
        const x = padding + i * (barW + gap);
        const y = baseline - barH;
        return (
          <rect key={d.date} x={x} y={y} width={Math.max(2, barW)} height={barH} rx={2.5} fill={color} opacity={val === 0 ? 0.18 : 1}>
            <title>{fmtDay(d.date)}: {formatValue ? formatValue(d) : val}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function BarList({ rows }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="adm-bar-list">
      {rows.length === 0 && <div className="admin-empty">No data yet.</div>}
      {rows.map(r => (
        <div className="adm-bar-list-row" key={r.key}>
          <div className="adm-bar-list-label">
            {r.dot && <span className="adm-status-dot" style={{ background: r.dot }} />}
            {r.label}
          </div>
          <div className="adm-bar-list-track">
            <div className="adm-bar-list-fill" style={{ width: `${(r.value / max) * 100}%`, background: r.dot || BLUE }} />
          </div>
          <div className="adm-bar-list-value">{r.display ?? r.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [range, setRange] = useState("14");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  function onRangeChange(value) {
    setRange(value);
    if (value === "custom" && !customStart && !customEnd) {
      setCustomEnd(todayIso());
      setCustomStart(isoDaysAgo(13));
    }
  }

  useEffect(() => {
    if (range === "custom" && (!customStart || !customEnd)) return;
    setLoading(true);
    const params = range === "custom" ? { start: customStart, end: customEnd } : { days: range };
    adminAnalytics(params).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  if (!data) return null;

  const statusRows = ["new", "contacted", "closed"].map(key => ({
    key, label: key, value: data.status_breakdown[key] || 0, dot: STATUS_COLORS[key],
  }));
  const messageStatusRows = ["new", "replied", "spam"].map(key => ({
    key, label: key, value: data.message_status_breakdown[key] || 0, dot: MESSAGE_STATUS_COLORS[key],
  }));
  const productRows = data.top_products.map(p => ({
    key: p.product_id, label: p.name, value: p.qty, display: `${p.qty} · ${fmtMoney(p.revenue)}`,
  }));
  const categoryRows = data.top_categories.map(c => ({
    key: c.category_id, label: c.label, value: c.qty, display: `${c.qty} · ${fmtMoney(c.revenue)}`,
  }));

  return (
    <div className={"adm-analytics" + (loading ? " adm-analytics-loading" : "")}>
      <div className="adm-analytics-head">
        <h2 className="adm-analytics-title">Overview</h2>
        <div className="adm-range-controls">
          <Select className="adm-select-sm" value={range} onChange={onRangeChange} options={RANGE_OPTIONS} />
          {range === "custom" && (
            <div className="adm-date-range">
              <DatePicker value={customStart} onChange={setCustomStart} max={customEnd || todayIso()} />
              <span className="adm-date-range-sep">–</span>
              <DatePicker value={customEnd} onChange={setCustomEnd} min={customStart} max={todayIso()} />
            </div>
          )}
        </div>
      </div>

      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{fmtMoney(data.total_revenue)}</div>
          <div className="admin-stat-label">Total revenue (booked)</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{data.total_bookings}</div>
          <div className="admin-stat-label">Total bookings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{fmtMoney(data.avg_booking_value)}</div>
          <div className="admin-stat-label">Avg. booking value</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{data.total_customers}</div>
          <div className="admin-stat-label">Registered members</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{data.total_messages}</div>
          <div className="admin-stat-label">Total messages</div>
        </div>
      </div>

      <div className="adm-analytics-grid">
        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head">
            <h3>Bookings{data.is_custom ? "" : `, last ${data.days} days`}</h3>
            <span className="adm-chart-range">{fmtDay(data.bookings_by_day[0].date)} – {fmtDay(data.bookings_by_day.at(-1).date)}</span>
          </div>
          <DayBarChart data={data.bookings_by_day} valueKey="count" color={BLUE} formatValue={d => `${d.count} booking${d.count === 1 ? "" : "s"}, ${fmtMoney(d.revenue)}`} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head">
            <h3>Messages{data.is_custom ? "" : `, last ${data.days} days`}</h3>
            <span className="adm-chart-range">{fmtDay(data.messages_by_day[0].date)} – {fmtDay(data.messages_by_day.at(-1).date)}</span>
          </div>
          <DayBarChart data={data.messages_by_day} valueKey="count" color="#eb6834" formatValue={d => `${d.count} message${d.count === 1 ? "" : "s"}`} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head">
            <h3>New members{data.is_custom ? "" : `, last ${data.days} days`}</h3>
            <span className="adm-chart-range">{fmtDay(data.new_customers_by_day[0].date)} – {fmtDay(data.new_customers_by_day.at(-1).date)}</span>
          </div>
          <DayBarChart data={data.new_customers_by_day} valueKey="count" color={GREEN} formatValue={d => `${d.count} new member${d.count === 1 ? "" : "s"}`} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head"><h3>Booking status</h3></div>
          <BarList rows={statusRows} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head"><h3>Message status</h3></div>
          <BarList rows={messageStatusRows} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head"><h3>Top products booked</h3></div>
          <BarList rows={productRows} />
        </div>

        <div className="admin-card adm-chart-card">
          <div className="adm-chart-head"><h3>Top categories booked</h3></div>
          <BarList rows={categoryRows} />
        </div>
      </div>
    </div>
  );
}
