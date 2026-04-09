"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  async function load() {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError("");
    // no-store: чтобы изменения в БД отражались сразу
    const res = await fetch("/api/orders-summary", { cache: "no-store" });
    const data = await res.json();

    // Если более новый запрос уже стартовал, игнорируем устаревший ответ.
    if (requestId !== requestIdRef.current) return;

    if (!res.ok || data.error) {
      setRows([]);
      setError(data.error || "Не удалось загрузить данные");
      setLoading(false);
      return;
    }

    setRows(data.rows ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      setRows([]);
      setError("Не удалось загрузить данные");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = useMemo(
    () => rows.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [rows],
  );
  const xTicks = useMemo(() => rows.map((r) => r.day), [rows]);
  const chartKey = useMemo(() => {
    const first = rows[0]?.day || "none";
    const last = rows[rows.length - 1]?.day || "none";
    return `all:${rows.length}:${first}:${last}`;
  }, [rows]);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="title">
          <h1>Дашборд заказов</h1>
          <p>Источник: Supabase</p>
        </div>
      </div>

      <section className="grid">
        <div className="card">
          <div className="cardHeader">
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Данные</div>
              <div style={{ fontSize: 16, letterSpacing: "-0.01em" }}>Все заказы из базы</div>
            </div>
          </div>

          <div className="cardBody">
            <div className="filters">
              <button
                className="btn btnPrimary"
                onClick={() =>
                  load().catch(() => {
                    setRows([]);
                    setError("Не удалось загрузить данные");
                    setLoading(false);
                  })
                }
              >
                Обновить
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="kpi">
              <div className="kpiValue">{totalRevenue.toLocaleString("ru-RU")} ₸</div>
              <div className="kpiCaption">Выручка за выбранный период</div>
            </div>
          </div>
          <div className="cardBody">
            <p className="loading" style={{ margin: 0 }}>
              {loading ? "Загрузка данных…" : error ? error : "Готово"}
            </p>
          </div>
        </div>
      </section>

      <div style={{ height: 14 }} />

      <section className="card">
        <div className="cardHeader">
          <div style={{ fontSize: 16, letterSpacing: "-0.01em" }}>Динамика</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Заказы и выручка по дням</div>
        </div>
        <div className="cardBody chartWrap">
          {loading ? (
            <p className="loading">Загрузка…</p>
          ) : error ? (
            <p className="loading">{error}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={chartKey} data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis
                  dataKey="day"
                  type="category"
                  ticks={xTicks}
                  allowDuplicatedCategory={false}
                  interval={0}
                  minTickGap={24}
                  tickFormatter={(v) => String(v)}
                  tick={{ fill: "rgba(0,0,0,0.55)", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "rgba(0,0,0,0.55)", fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="linear"
                  dataKey="orders_count"
                  stroke="var(--blue)"
                  strokeWidth={2.25}
                  dot={false}
                  name="Заказы"
                />
                <Line
                  type="linear"
                  dataKey="revenue"
                  stroke="var(--green)"
                  strokeWidth={2.25}
                  dot={false}
                  name="Выручка"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </main>
  );
}
