import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const LOGO_PATH = "/msp-logo.png";
const DEFAULT_EXCHANGE_RATE = 520;
const ADMIN_PASSWORD = "MSP2026";

const SUPABASE_URL = "https://esxpwgxlsctpbnsfunca.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DuFXNM7oShrjYEvMAvIvOw_w5ASgmgd";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PayPal
// Cambia este valor por tu Client ID real de PayPal Developer.
const PAYPAL_CLIENT_ID =
  "AcKNyk7RxozOiDdhGN_UINeOPabVgwzaeIYPS8FrSIWLewT3DLIOk4S257W-A0mEdMIgrgmYq2PpuioS";
const PAYPAL_PLAN_ID = "P-91D724252K054240WNHX4BAQ";

const PLAN = { key: "monthly_app", name: "MSP Finance App", priceUsd: 4.99 };
const SINPE = {
  phone: "+506 7068-4958",
  whatsapp: "50670684958",
  owner: "margarita penon portmann",
};

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const shortMonths = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const frequencies = [
  { key: "daily", label: "Diario", factor: 30 },
  { key: "weekly", label: "Semanal", factor: 52 / 12 },
  { key: "biweekly", label: "Bi semanal", factor: 26 / 12 },
  { key: "quincenal", label: "Quincenal", factor: 2 },
  { key: "monthly", label: "Mensual", factor: 1 },
  { key: "quarterly", label: "Trimestral", factor: 1 / 3 },
  { key: "semiannual", label: "Semestral", factor: 1 / 6 },
  { key: "annual", label: "Anual", factor: 1 / 12 },
];
const incomeCategories = [
  "Salario",
  "Servicios profesionales",
  "Negocio",
  "Ingreso extra",
  "Otros",
];
const expenseCategories = [
  "Vivienda",
  "Alimentación",
  "Servicios",
  "Transporte",
  "Educación",
  "Salud",
  "Entretenimiento",
  "Deudas",
  "Suscripciones",
  "Otros",
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
function nextMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
function monthFromDate(date) {
  return date ? String(date).slice(0, 7) : currentMonth();
}
function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${shortMonths[Number(month) - 1] || month} ${year}`;
}
function toCRC(amount, currency, rate) {
  return currency === "USD"
    ? Number(amount || 0) * Number(rate || DEFAULT_EXCHANGE_RATE)
    : Number(amount || 0);
}
function money(valueCRC, currency, rate) {
  const value = Number(valueCRC || 0);
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value / Number(rate || DEFAULT_EXCHANGE_RATE));
  }
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(value);
}
function originalMoney(value, currency) {
  if (currency === "USD")
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value || 0));
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
function monthlyValue(item, rate) {
  const factor = frequencies.find((x) => x.key === item.frequency)?.factor || 1;
  return toCRC(item.amount, item.currency || "CRC", rate) * factor;
}
function initialPayload() {
  return {
    incomes: [
      {
        id: makeId(),
        name: "Ingreso principal",
        category: "Salario",
        amount: 450000,
        currency: "CRC",
        frequency: "monthly",
        date: today(),
      },
    ],
    expenses: [
      {
        id: makeId(),
        name: "Vivienda",
        category: "Vivienda",
        amount: 180000,
        currency: "CRC",
        frequency: "monthly",
        date: today(),
      },
      {
        id: makeId(),
        name: "Alimentación",
        category: "Alimentación",
        amount: 55000,
        currency: "CRC",
        frequency: "weekly",
        date: today(),
      },
    ],
    debts: [
      {
        id: makeId(),
        name: "Tarjeta de crédito",
        balance: 350000,
        originalBalance: 500000,
        minPayment: 25000,
        currency: "CRC",
        interest: 34,
        date: today(),
        payments: [],
      },
    ],
    savings: [
      {
        id: makeId(),
        name: "Fondo de emergencia",
        goal: 300000,
        saved: 75000,
        currency: "CRC",
        date: today(),
        contributions: [],
      },
    ],
    currencyType: "CRC",
    exchangeRate: DEFAULT_EXCHANGE_RATE,
    selectedMonth: currentMonth(),
  };
}

function Logo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
      <img
        src={LOGO_PATH}
        alt="MSP Finance"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/70 ${className}`}
    >
      {children}
    </div>
  );
}
function Stat({ title, value, subtitle, emoji, color = "blue" }) {
  const map = {
    blue: "from-blue-600 to-cyan-400",
    green: "from-emerald-600 to-teal-400",
    red: "from-rose-600 to-orange-400",
    yellow: "from-yellow-500 to-orange-400",
    purple: "from-violet-600 to-fuchsia-500",
  };
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900">{value}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className={`rounded-2xl bg-gradient-to-br ${map[color]} p-3 text-2xl text-white`}
        >
          {emoji}
        </div>
      </div>
    </Card>
  );
}
function Progress({ value }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
        style={{ width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }}
      />
    </div>
  );
}
function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function PayPalSubscribeButton({ customerEmail, onMessage }) {
  useEffect(() => {
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === "TU_CLIENT_ID_DE_PAYPAL")
      return;

    function renderButton() {
      const container = document.getElementById(
        "paypal-subscription-button-container"
      );
      if (!container || !window.paypal) return;
      container.innerHTML = "";
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "pill",
            label: "subscribe",
          },
          createSubscription: function (data, actions) {
            return actions.subscription.create({
              plan_id: PAYPAL_PLAN_ID,
              custom_id: customerEmail || "msp-finance-client",
            });
          },
          onApprove: function (data) {
            onMessage(
              `Suscripción PayPal creada. ID: ${data.subscriptionID}. Si aún no tienes acceso automático, valida el correo o envía comprobante.`
            );
          },
          onError: function () {
            onMessage(
              "No se pudo completar PayPal. Intenta nuevamente o usa SINPE."
            );
          },
        })
        .render("#paypal-subscription-button-container");
    }

    const existing = document.getElementById("paypal-sdk-subscription");
    if (existing) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk-subscription";
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = renderButton;
    document.body.appendChild(script);
  }, [customerEmail, onMessage]);

  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === "TU_CLIENT_ID_DE_PAYPAL") {
    return (
      <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
        PayPal está listo. Falta colocar tu Client ID real en App.js.
      </div>
    );
  }
  return <div id="paypal-subscription-button-container" className="mt-4" />;
}

function MonthFilter({ selectedMonth, setSelectedMonth }) {
  const d = new Date(`${selectedMonth}-01T00:00:00`);
  const year = d.getFullYear();
  const monthIndex = d.getMonth();
  const years = Array.from(
    { length: 7 },
    (_, i) => new Date().getFullYear() - 3 + i
  );
  const move = (amount) => {
    const next = new Date(`${selectedMonth}-01T00:00:00`);
    next.setMonth(next.getMonth() + amount);
    setSelectedMonth(next.toISOString().slice(0, 7));
  };
  return (
    <Card>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Mes de trabajo
          </p>
          <h3 className="text-2xl font-black text-slate-900">
            {monthLabel(selectedMonth)}
          </h3>
          <p className="text-sm text-slate-500">
            Filtra el dashboard por mes y año.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[auto_1fr_1fr_auto_auto]">
          <button
            onClick={() => move(-1)}
            className="rounded-2xl bg-slate-100 px-4 py-3 font-black"
          >
            ←
          </button>
          <select
            value={monthIndex}
            onChange={(e) =>
              setSelectedMonth(
                `${year}-${String(Number(e.target.value) + 1).padStart(2, "0")}`
              )
            }
            className="rounded-2xl border px-4 py-3 font-bold"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) =>
              setSelectedMonth(
                `${e.target.value}-${String(monthIndex + 1).padStart(2, "0")}`
              )
            }
            className="rounded-2xl border px-4 py-3 font-bold"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => move(1)}
            className="rounded-2xl bg-slate-100 px-4 py-3 font-black"
          >
            →
          </button>
          <button
            onClick={() => setSelectedMonth(currentMonth())}
            className="col-span-2 rounded-2xl bg-blue-600 px-4 py-3 font-black text-white sm:col-span-1"
          >
            Mes actual
          </button>
        </div>
      </div>
    </Card>
  );
}

function BarChart({ title, data, currency, rate }) {
  const max = Math.max(...data.map((x) => Math.abs(x.value)), 1);
  const colors = {
    green: "from-emerald-500 to-teal-300",
    red: "from-rose-500 to-orange-300",
    yellow: "from-yellow-500 to-orange-300",
    purple: "from-violet-500 to-fuchsia-300",
    blue: "from-blue-600 to-cyan-300",
  };
  return (
    <Card>
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <div className="mt-5 flex h-56 items-end gap-4 overflow-x-auto rounded-3xl bg-slate-50 p-5">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex min-w-[70px] flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className={`w-full max-w-[70px] rounded-t-2xl bg-gradient-to-t ${
                colors[item.color] || colors.blue
              }`}
              style={{
                height: `${Math.max(12, (Math.abs(item.value) / max) * 180)}px`,
              }}
            />
            <p className="text-center text-xs font-bold text-slate-700">
              {item.label}
            </p>
            <p className="text-center text-[11px] text-slate-500">
              {money(item.value, currency, rate)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
function HistoryChart({ history, currency, rate, selectedMonth }) {
  const rows = history.length
    ? history.slice(-6)
    : [
        {
          label: monthLabel(selectedMonth),
          ingresos: 0,
          gastos: 0,
          deudas: 0,
          ahorros: 0,
          neto: 0,
        },
      ];
  const max = Math.max(
    ...rows.flatMap((row) => [
      row.ingresos,
      row.gastos,
      row.deudas,
      row.ahorros,
      Math.abs(row.neto),
    ]),
    1
  );
  const series = [
    ["Ingresos", "ingresos", "bg-emerald-500"],
    ["Gastos", "gastos", "bg-rose-500"],
    ["Deudas", "deudas", "bg-yellow-500"],
    ["Ahorros", "ahorros", "bg-blue-500"],
  ];
  return (
    <Card className="lg:col-span-2">
      <h3 className="text-lg font-black text-slate-900">Evolución mensual</h3>
      <p className="text-sm text-slate-500">Últimos meses registrados.</p>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-3 flex justify-between">
              <p className="font-black text-slate-800">{row.label}</p>
              <p
                className={`text-sm font-black ${
                  row.neto >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                Neto: {money(row.neto, currency, rate)}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {series.map(([label, key, color]) => (
                <div key={key}>
                  <div className="flex h-24 items-end rounded-2xl bg-white p-2">
                    <div
                      className={`w-full rounded-xl ${color}`}
                      style={{
                        height: `${Math.max(
                          6,
                          (Number(row[key] || 0) / max) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[11px] font-bold text-slate-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
function buildHistory(incomes, expenses, debts, savings, rate) {
  const map = {};
  const ensure = (key) => {
    if (!map[key])
      map[key] = {
        key,
        label: monthLabel(key),
        ingresos: 0,
        gastos: 0,
        deudas: 0,
        ahorros: 0,
        neto: 0,
      };
    return map[key];
  };
  incomes.forEach(
    (x) => (ensure(monthFromDate(x.date)).ingresos += monthlyValue(x, rate))
  );
  expenses.forEach(
    (x) => (ensure(monthFromDate(x.date)).gastos += monthlyValue(x, rate))
  );
  debts.forEach((d) => {
    ensure(monthFromDate(d.date)).deudas += toCRC(
      d.minPayment,
      d.currency,
      rate
    );
    (d.payments || []).forEach(
      (p) =>
        (ensure(monthFromDate(p.date)).deudas += toCRC(
          p.amount,
          d.currency,
          rate
        ))
    );
  });
  savings.forEach((g) => {
    ensure(monthFromDate(g.date)).ahorros += toCRC(g.saved, g.currency, rate);
    (g.contributions || []).forEach(
      (c) =>
        (ensure(monthFromDate(c.date)).ahorros += toCRC(
          c.amount,
          g.currency,
          rate
        ))
    );
  });
  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((row) => ({
      ...row,
      neto: row.ingresos - row.gastos - row.deudas - row.ahorros,
    }));
}

function MovementForm({ type, onAdd, selectedMonth }) {
  const isIncome = type === "income";
  const [form, setForm] = useState({
    name: "",
    amount: "",
    currency: "CRC",
    frequency: "monthly",
    category: isIncome ? incomeCategories[0] : expenseCategories[0],
    date: `${selectedMonth}-01`,
  });
  const categories = isIncome ? incomeCategories : expenseCategories;
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.amount) <= 0) return;
    onAdd({ ...form, id: makeId(), amount: Number(form.amount) });
    setForm({ ...form, name: "", amount: "", date: `${selectedMonth}-01` });
  };
  return (
    <Card>
      <h3 className="text-lg font-black text-slate-900">
        {isIncome ? "Nuevo ingreso" : "Nuevo gasto"}
      </h3>
      <form
        onSubmit={submit}
        className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        <Field
          label="Nombre"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          label="Monto"
          type="number"
          value={form.amount}
          onChange={(v) => setForm({ ...form, amount: v })}
        />
        <Select
          label="Moneda"
          value={form.currency}
          onChange={(v) => setForm({ ...form, currency: v })}
          options={["CRC", "USD"]}
        />
        <Select
          label="Categoría"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
          options={categories}
        />
        <Field
          label="Fecha"
          type="date"
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
        />
        <Select
          label="Frecuencia"
          value={form.frequency}
          onChange={(v) => setForm({ ...form, frequency: v })}
          options={frequencies}
        />
        <button
          className={`rounded-2xl px-5 py-3 font-black text-white md:col-span-2 ${
            isIncome ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          Agregar
        </button>
      </form>
    </Card>
  );
}
function ItemList({ title, items, onDelete, currency, rate }) {
  return (
    <Card>
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-slate-500">
            No hay registros para este mes.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
          >
            <div>
              <p className="font-black text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.date} • {item.category} •{" "}
                {originalMoney(item.amount, item.currency)} • Mensual:{" "}
                {money(monthlyValue(item, rate), currency, rate)}
              </p>
            </div>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-xl bg-white px-3 py-2 text-rose-600"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Debts({ debts, setDebts, selectedMonth }) {
  const [form, setForm] = useState({
    name: "",
    balance: "",
    minPayment: "",
    interest: "",
    currency: "CRC",
    date: `${selectedMonth}-01`,
  });
  const [payments, setPayments] = useState({});
  const ordered = [...debts].sort(
    (a, b) => Number(a.balance || 0) - Number(b.balance || 0)
  );
  const add = (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.balance) <= 0) return;
    setDebts((prev) => [
      {
        id: makeId(),
        ...form,
        balance: Number(form.balance),
        originalBalance: Number(form.balance),
        minPayment: Number(form.minPayment || 0),
        interest: Number(form.interest || 0),
        payments: [],
      },
      ...prev,
    ]);
    setForm({
      name: "",
      balance: "",
      minPayment: "",
      interest: "",
      currency: "CRC",
      date: `${selectedMonth}-01`,
    });
  };
  const pay = (debt) => {
    const amount = Number(payments[debt.id] || 0);
    if (amount <= 0) return;
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debt.id
          ? {
              ...d,
              balance: Math.max(0, Number(d.balance) - amount),
              payments: [
                ...(d.payments || []),
                {
                  id: makeId(),
                  amount,
                  date: `${selectedMonth}-${String(
                    new Date().getDate()
                  ).padStart(2, "0")}`,
                },
              ],
            }
          : d
      )
    );
    setPayments((prev) => ({ ...prev, [debt.id]: "" }));
  };
  return (
    <div className="space-y-5">
      <form onSubmit={add}>
        <Card>
          <h3 className="text-lg font-black">Nueva deuda</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field
              label="Nombre"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Saldo"
              type="number"
              value={form.balance}
              onChange={(v) => setForm({ ...form, balance: v })}
            />
            <Field
              label="Pago mínimo"
              type="number"
              value={form.minPayment}
              onChange={(v) => setForm({ ...form, minPayment: v })}
            />
            <Field
              label="Interés"
              type="number"
              value={form.interest}
              onChange={(v) => setForm({ ...form, interest: v })}
            />
            <Select
              label="Moneda"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={["CRC", "USD"]}
            />
            <Field
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
            />
          </div>
          <button className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">
            Agregar deuda
          </button>
        </Card>
      </form>
      <Card>
        <h3 className="text-xl font-black">Bola de nieve</h3>
        <div className="mt-4 space-y-4">
          {ordered.length === 0 && (
            <p className="text-sm text-slate-500">No hay deudas.</p>
          )}
          {ordered.map((debt, index) => {
            const progress =
              ((Number(debt.originalBalance || debt.balance) -
                Number(debt.balance || 0)) /
                Number(debt.originalBalance || debt.balance || 1)) *
              100;
            return (
              <div
                key={debt.id}
                className={`rounded-3xl border p-4 ${
                  index === 0
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <p className="text-xs font-black uppercase text-blue-700">
                  #{index + 1} prioridad
                </p>
                <h4 className="text-lg font-black">{debt.name}</h4>
                <p className="text-sm text-slate-500">
                  Saldo: {originalMoney(debt.balance, debt.currency)} • Mínimo:{" "}
                  {originalMoney(debt.minPayment, debt.currency)}
                </p>
                <div className="mt-3">
                  <Progress value={progress} />
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="number"
                    value={payments[debt.id] || ""}
                    onChange={(e) =>
                      setPayments((prev) => ({
                        ...prev,
                        [debt.id]: e.target.value,
                      }))
                    }
                    placeholder={`Pago en ${debt.currency}`}
                    className="flex-1 rounded-2xl border px-4 py-3"
                  />
                  <button
                    onClick={() => pay(debt)}
                    className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() =>
                      setDebts((prev) => prev.filter((x) => x.id !== debt.id))
                    }
                    className="rounded-2xl bg-white px-4 py-2 font-bold text-rose-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Savings({ savings, setSavings, selectedMonth }) {
  const [form, setForm] = useState({
    name: "",
    goal: "",
    saved: "",
    currency: "CRC",
    date: `${selectedMonth}-01`,
  });
  const [amounts, setAmounts] = useState({});
  const add = (event) => {
    event.preventDefault();
    if (!form.name.trim() || Number(form.goal) <= 0) return;
    setSavings((prev) => [
      {
        id: makeId(),
        ...form,
        goal: Number(form.goal),
        saved: Number(form.saved || 0),
        contributions: [],
      },
      ...prev,
    ]);
    setForm({
      name: "",
      goal: "",
      saved: "",
      currency: "CRC",
      date: `${selectedMonth}-01`,
    });
  };
  const contribute = (goal) => {
    const amount = Number(amounts[goal.id] || 0);
    if (amount <= 0) return;
    setSavings((prev) =>
      prev.map((item) =>
        item.id === goal.id
          ? {
              ...item,
              saved: Math.min(Number(item.goal), Number(item.saved) + amount),
              contributions: [
                ...(item.contributions || []),
                {
                  id: makeId(),
                  amount,
                  date: `${selectedMonth}-${String(
                    new Date().getDate()
                  ).padStart(2, "0")}`,
                },
              ],
            }
          : item
      )
    );
    setAmounts((prev) => ({ ...prev, [goal.id]: "" }));
  };
  return (
    <div className="space-y-5">
      <form onSubmit={add}>
        <Card>
          <h3 className="text-lg font-black">Nueva meta</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field
              label="Nombre"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Meta total"
              type="number"
              value={form.goal}
              onChange={(v) => setForm({ ...form, goal: v })}
            />
            <Field
              label="Ya ahorrado"
              type="number"
              value={form.saved}
              onChange={(v) => setForm({ ...form, saved: v })}
            />
            <Select
              label="Moneda"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={["CRC", "USD"]}
            />
            <Field
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
            />
          </div>
          <button className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white">
            Crear meta
          </button>
        </Card>
      </form>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {savings.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">No hay metas.</p>
          </Card>
        )}
        {savings.map((goal) => {
          const progress =
            (Number(goal.saved || 0) / Number(goal.goal || 1)) * 100;
          return (
            <Card key={goal.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{goal.name}</h3>
                  <p className="text-sm text-slate-500">
                    {originalMoney(goal.saved, goal.currency)} /{" "}
                    {originalMoney(goal.goal, goal.currency)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSavings((prev) => prev.filter((x) => x.id !== goal.id))
                  }
                  className="rounded-2xl bg-rose-50 px-3 py-2 text-rose-600"
                >
                  🗑️
                </button>
              </div>
              <div className="mt-4">
                <Progress value={progress} />
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  value={amounts[goal.id] || ""}
                  onChange={(e) =>
                    setAmounts((prev) => ({
                      ...prev,
                      [goal.id]: e.target.value,
                    }))
                  }
                  placeholder={`Aporte en ${goal.currency}`}
                  className="flex-1 rounded-2xl border px-4 py-3"
                />
                <button
                  onClick={() => contribute(goal)}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white"
                >
                  Guardar
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LandingPage({ onStart, onDemo, onAdmin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-70" />
      <div className="relative mx-auto max-w-6xl px-5 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-xl font-black">MSP Finance</p>
              <p className="text-xs text-blue-100">
                Tu dinero, más claro cada mes
              </p>
            </div>
          </div>
          <button
            onClick={onAdmin}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-bold"
          >
            Admin
          </button>
        </nav>
        <section className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100">
              ✨ App financiera premium
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
              Controla tu dinero con una experiencia financiera premium.
            </h1>
            <p className="mt-5 text-lg leading-8 text-blue-100">
              Organiza ingresos, gastos, deudas y ahorros por mes, visualiza tu
              progreso y mantén tus datos seguros en la nube.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onStart}
                className="rounded-2xl bg-blue-500 px-6 py-4 font-black text-white"
              >
                Ingresar / Activar acceso
              </button>
              <button
                onClick={onDemo}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-bold"
              >
                Probar demo
              </button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
              <h3 className="text-2xl font-black">Vista premium</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">Dinero proyectado</p>
                  <p className="text-3xl font-black">₡450,000</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Mes activo</p>
                  <p className="text-3xl font-black">
                    {monthLabel(currentMonth())}
                  </p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">Deudas organizadas</p>
                  <p className="text-2xl font-black">Bola de nieve</p>
                  <div className="mt-3">
                    <Progress value={68} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LoginPage({ onHome, onUnlock }) {
  const [email, setEmail] = useState(
    localStorage.getItem("mspUserEmail") || ""
  );
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("paypal");
  const [rate, setRate] = useState(DEFAULT_EXCHANGE_RATE);

  async function validate() {
    if (!email.trim()) {
      setMessage("Ingresa tu correo.");
      return;
    }
    const clean = email.trim().toLowerCase();
    localStorage.setItem("mspUserEmail", clean);
    const { data, error } = await supabase
      .from("user_finance_data")
      .select("subscription_status, subscription_expires_at")
      .eq("user_email", clean)
      .single();
    if (error || !data) {
      setMessage("No encontramos una suscripción activa para este correo.");
      return;
    }
    const active =
      data.subscription_status === "active" &&
      (!data.subscription_expires_at ||
        new Date(data.subscription_expires_at) > new Date());
    if (!active) {
      setMessage("Tu acceso está pendiente, vencido o inactivo.");
      return;
    }
    onUnlock(clean);
  }
  const whatsapp = `https://wa.me/${SINPE.whatsapp}?text=${encodeURIComponent(
    `Hola, quiero activar MSP Finance. Mi correo es: ${email}`
  )}`;
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_35%),radial-gradient(circle_at_bottom_right,#06b6d4,transparent_30%)] opacity-70" />
      <div className="relative mx-auto max-w-6xl px-5 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-xl font-black">MSP Finance</p>
              <p className="text-xs text-blue-100">Login / Pago</p>
            </div>
          </div>
          <button
            onClick={onHome}
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold"
          >
            Sitio principal
          </button>
        </nav>
        <section className="py-12 text-center">
          <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100">
            🔒 Acceso mensual premium
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black sm:text-6xl">
            Ingresa a MSP Finance
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Coloca tu correo para validar tu acceso mensual o activar tu cuenta.
          </p>
        </section>
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-2xl font-black">Acceso de cliente</h2>
            <p className="mt-2 text-sm text-blue-100">
              Ingresa el correo asociado a tu suscripción.
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-5 w-full rounded-2xl bg-white px-4 py-4 text-slate-950"
            />
            <button
              onClick={validate}
              className="mt-4 w-full rounded-2xl bg-blue-500 px-5 py-4 font-black text-white"
            >
              Ingresar a mi dashboard
            </button>
            {message && (
              <p className="mt-4 text-sm font-bold text-cyan-200">{message}</p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-2xl font-black">Plan mensual MSP</h2>
            <div className="mt-5 rounded-3xl bg-white p-5 text-slate-950">
              <p className="text-sm text-slate-500">Monto</p>
              <p className="text-5xl font-black">
                ${PLAN.priceUsd}
                <span className="text-base"> / mes</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Referencia SINPE: {money(PLAN.priceUsd * rate, "CRC", rate)}
              </p>
              <input
                type="number"
                value={rate}
                onChange={(e) =>
                  setRate(Number(e.target.value) || DEFAULT_EXCHANGE_RATE)
                }
                className="mt-4 w-full rounded-2xl border px-4 py-3"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("paypal")}
                className={`rounded-2xl px-4 py-3 font-black ${
                  method === "paypal"
                    ? "bg-white text-slate-950"
                    : "bg-white/10"
                }`}
              >
                PayPal
              </button>
              <button
                onClick={() => setMethod("sinpe")}
                className={`rounded-2xl px-4 py-3 font-black ${
                  method === "sinpe" ? "bg-white text-slate-950" : "bg-white/10"
                }`}
              >
                SINPE
              </button>
            </div>
            {method === "paypal" && (
              <PayPalSubscribeButton
                customerEmail={email}
                onMessage={setMessage}
              />
            )}
            {method === "sinpe" && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-2xl bg-emerald-500 px-5 py-4 text-center font-black text-white"
              >
                Enviar comprobante SINPE
              </a>
            )}
            <p className="mt-4 text-xs text-blue-100">
              SINPE: {SINPE.phone} • {SINPE.owner}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminPage({ onHome }) {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [expires, setExpires] = useState(nextMonthDate());
  const [message, setMessage] = useState("");
  async function save(event) {
    event.preventDefault();
    if (!email.trim()) return;
    const clean = email.trim().toLowerCase();
    const existing = await supabase
      .from("user_finance_data")
      .select("payload")
      .eq("user_email", clean)
      .single();
    const payload = existing.data?.payload || initialPayload();
    const { error } = await supabase.from("user_finance_data").upsert(
      {
        user_email: clean,
        subscription_status: status,
        combo: PLAN.key,
        subscription_started_at: new Date().toISOString(),
        subscription_expires_at: new Date(expires).toISOString(),
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );
    setMessage(error ? error.message : `Cliente ${clean} actualizado.`);
    if (!error) setEmail("");
  }
  if (!ok)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            password === ADMIN_PASSWORD
              ? setOk(true)
              : setMessage("Contraseña incorrecta.");
          }}
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        >
          <h1 className="text-2xl font-black">MSP Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="mt-5 w-full rounded-2xl border px-4 py-3"
          />
          <button className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 font-black text-white">
            Entrar
          </button>
          {message && (
            <p className="mt-3 text-sm font-bold text-rose-600">{message}</p>
          )}
          <button
            type="button"
            onClick={onHome}
            className="mt-4 text-sm font-bold text-slate-500"
          >
            Volver
          </button>
        </form>
      </div>
    );
  return (
    <div className="min-h-screen bg-slate-100 p-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between rounded-3xl bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-black">MSP Finance Admin</p>
              <p className="text-xs text-slate-500">Activación manual</p>
            </div>
          </div>
          <button
            onClick={onHome}
            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
          >
            Salir
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={save}>
            <Card>
              <h1 className="text-2xl font-black">Activar cliente</h1>
              <div className="mt-5 space-y-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo del cliente"
                  className="w-full rounded-2xl border px-4 py-3"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                  <option value="past_due">Pago pendiente</option>
                  <option value="cancelled">Cancelada</option>
                </select>
                <input
                  type="date"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3"
                />
              </div>
              <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white">
                Guardar acceso
              </button>
              {message && (
                <p className="mt-3 text-sm font-bold text-blue-700">
                  {message}
                </p>
              )}
            </Card>
          </form>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
            <h2 className="text-2xl font-black">Flujo MSP Finance</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <p>1. Cliente paga por PayPal o SINPE.</p>
              <p>2. Confirmas el pago.</p>
              <p>3. Activás el correo desde este panel.</p>
              <p>4. Cliente entra con su correo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({
  userEmail: initialEmail,
  onLogin,
  onLogout,
  demoMode = false,
}) {
  const seed = initialPayload();
  const [incomes, setIncomes] = useState(seed.incomes);
  const [expenses, setExpenses] = useState(seed.expenses);
  const [debts, setDebts] = useState(seed.debts);
  const [savings, setSavings] = useState(seed.savings);
  const [currency, setCurrency] = useState(seed.currencyType);
  const [rate, setRate] = useState(seed.exchangeRate);
  const [selectedMonth, setSelectedMonth] = useState(seed.selectedMonth);
  const [tab, setTab] = useState("dashboard");
  const [menu, setMenu] = useState(false);
  const [email, setEmail] = useState(
    initialEmail || localStorage.getItem("mspUserEmail") || ""
  );
  const [message, setMessage] = useState("");
  const monthIncomes = incomes.filter(
    (x) => monthFromDate(x.date) === selectedMonth
  );
  const monthExpenses = expenses.filter(
    (x) => monthFromDate(x.date) === selectedMonth
  );
  const monthDebts = debts.filter(
    (x) =>
      monthFromDate(x.date) === selectedMonth ||
      (x.payments || []).some((p) => monthFromDate(p.date) === selectedMonth)
  );
  const monthSavings = savings.filter(
    (x) =>
      monthFromDate(x.date) === selectedMonth ||
      (x.contributions || []).some(
        (c) => monthFromDate(c.date) === selectedMonth
      )
  );
  const totals = useMemo(() => {
    const income = monthIncomes.reduce(
      (sum, x) => sum + monthlyValue(x, rate),
      0
    );
    const expense = monthExpenses.reduce(
      (sum, x) => sum + monthlyValue(x, rate),
      0
    );
    const debt = monthDebts.reduce(
      (sum, d) =>
        sum +
        toCRC(d.minPayment, d.currency, rate) +
        (d.payments || [])
          .filter((p) => monthFromDate(p.date) === selectedMonth)
          .reduce((a, p) => a + toCRC(p.amount, d.currency, rate), 0),
      0
    );
    const saving = monthSavings.reduce(
      (sum, g) =>
        sum +
        toCRC(g.saved, g.currency, rate) +
        (g.contributions || [])
          .filter((c) => monthFromDate(c.date) === selectedMonth)
          .reduce((a, c) => a + toCRC(c.amount, g.currency, rate), 0),
      0
    );
    return {
      income,
      expense,
      debt,
      saving,
      free: income - expense - debt - saving,
      ratio: income > 0 ? ((expense + debt + saving) / income) * 100 : 0,
    };
  }, [
    monthIncomes,
    monthExpenses,
    monthDebts,
    monthSavings,
    rate,
    selectedMonth,
  ]);
  const history = useMemo(
    () => buildHistory(incomes, expenses, debts, savings, rate),
    [incomes, expenses, debts, savings, rate]
  );
  const nav = [
    ["dashboard", "📊", "Dashboard"],
    ["movements", "➕", "Movimientos"],
    ["debts", "💳", "Deudas"],
    ["savings", "🐷", "Ahorros"],
  ];
  async function save() {
    if (demoMode) {
      setMessage("Demo limitado: activa tu acceso mensual para guardar datos.");
      return;
    }
    if (!email.trim()) {
      setMessage("Ingresa tu correo.");
      return;
    }
    const clean = email.trim().toLowerCase();
    const payload = {
      incomes,
      expenses,
      debts,
      savings,
      currencyType: currency,
      exchangeRate: rate,
      selectedMonth,
    };
    const { error } = await supabase
      .from("user_finance_data")
      .upsert(
        { user_email: clean, payload, updated_at: new Date().toISOString() },
        { onConflict: "user_email" }
      );
    setMessage(error ? `Error: ${error.message}` : "Información guardada.");
  }
  async function load() {
    if (demoMode) {
      setMessage("Demo limitado: activa tu acceso mensual para cargar datos.");
      return;
    }
    if (!email.trim()) {
      setMessage("Ingresa tu correo.");
      return;
    }
    const clean = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("user_finance_data")
      .select("payload, subscription_status, subscription_expires_at")
      .eq("user_email", clean)
      .single();
    if (error || !data) {
      setMessage("No encontramos datos para este correo.");
      return;
    }
    const active =
      data.subscription_status === "active" &&
      (!data.subscription_expires_at ||
        new Date(data.subscription_expires_at) > new Date());
    if (!active) {
      setMessage("Tu suscripción no está activa.");
      return;
    }
    setIncomes(data.payload?.incomes || seed.incomes);
    setExpenses(data.payload?.expenses || seed.expenses);
    setDebts(data.payload?.debts || seed.debts);
    setSavings(data.payload?.savings || seed.savings);
    setCurrency(data.payload?.currencyType || "CRC");
    setRate(data.payload?.exchangeRate || DEFAULT_EXCHANGE_RATE);
    setSelectedMonth(data.payload?.selectedMonth || currentMonth());
    setMessage("Información cargada.");
  }
  const headerControls = (
    <>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo cliente"
        className="w-56 rounded-2xl border px-4 py-2 text-sm"
      />
      {!demoMode ? (
        <>
          <button
            onClick={load}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            Cargar
          </button>
          <button
            onClick={save}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
          >
            Guardar
          </button>
        </>
      ) : (
        <button
          onClick={onLogin}
          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
        >
          Desbloquear PRO
        </button>
      )}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-2xl border px-3 py-2 text-sm"
      >
        <option>CRC</option>
        <option>USD</option>
      </select>
      <input
        type="number"
        value={rate}
        onChange={(e) =>
          setRate(Number(e.target.value) || DEFAULT_EXCHANGE_RATE)
        }
        className="w-24 rounded-2xl border px-3 py-2 text-sm"
      />
    </>
  );
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-black">MSP Finance</p>
              <p className="text-xs text-slate-500">
                {demoMode ? "Demo" : "Dashboard"}
              </p>
            </div>
          </div>
          <div className="hidden flex-1 items-center justify-end gap-2 xl:flex">
            {nav.map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-2xl px-4 py-2 font-bold ${
                  tab === key ? "bg-blue-600 text-white" : "hover:bg-slate-100"
                }`}
              >
                {icon} {label}
              </button>
            ))}
            <button
              onClick={onLogin}
              className="rounded-2xl px-4 py-2 font-bold hover:bg-slate-100"
            >
              🏠 Login
            </button>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-rose-50 px-4 py-2 font-bold text-rose-600"
            >
              Cerrar sesión
            </button>
            {headerControls}
          </div>
          <button
            onClick={() => setMenu(!menu)}
            className="rounded-2xl bg-slate-100 p-3 xl:hidden"
          >
            {menu ? "✕" : "☰"}
          </button>
        </div>
        {menu && (
          <div className="space-y-3 border-t bg-white px-4 pb-4 xl:hidden">
            <div className="grid grid-cols-2 gap-2 pt-3">
              {nav.map(([key, icon, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setMenu(false);
                  }}
                  className={`rounded-2xl px-3 py-3 text-left font-bold ${
                    tab === key ? "bg-blue-600 text-white" : "bg-slate-100"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
            <button
              onClick={onLogin}
              className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-left font-bold"
            >
              🏠 Login
            </button>
            <button
              onClick={onLogout}
              className="w-full rounded-2xl bg-rose-50 px-4 py-3 text-left font-bold text-rose-600"
            >
              Cerrar sesión
            </button>
            <div className="space-y-3">{headerControls}</div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-28">
        <MonthFilter
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
        {demoMode && (
          <section className="rounded-[2rem] border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-blue-50 p-5 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-700">
                  Demo PRO limitado
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  Explora la experiencia. Desbloquea el control completo.
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Activa tu acceso mensual para guardar, cargar y usar todas las
                  funciones.
                </p>
              </div>
              <button
                onClick={onLogin}
                className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white"
              >
                🔓 Activar acceso completo
              </button>
            </div>
          </section>
        )}
        {message && (
          <div className="rounded-3xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
            {message}
          </div>
        )}
        <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white shadow-2xl">
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
            📅 Trabajando: {monthLabel(selectedMonth)} • 💱 ₡{rate} por $1
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">
            Resumen financiero del mes
          </h1>
          <p className="mt-3 text-blue-100">Disponible estimado</p>
          <p
            className={`mt-2 text-5xl font-black ${
              totals.free >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {money(totals.free, currency, rate)}
          </p>
        </section>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Ingresos"
            value={money(totals.income, currency, rate)}
            subtitle={monthLabel(selectedMonth)}
            emoji="📈"
            color="green"
          />
          <Stat
            title="Gastos"
            value={money(totals.expense, currency, rate)}
            subtitle={monthLabel(selectedMonth)}
            emoji="📉"
            color="red"
          />
          <Stat
            title="Deudas"
            value={money(totals.debt, currency, rate)}
            subtitle="Pagos del mes"
            emoji="💳"
            color="yellow"
          />
          <Stat
            title="Ahorros"
            value={money(totals.saving, currency, rate)}
            subtitle="Aportes del mes"
            emoji="🐷"
            color="purple"
          />
        </section>
        {tab === "dashboard" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <HistoryChart
              history={history}
              currency={currency}
              rate={rate}
              selectedMonth={selectedMonth}
            />
            <BarChart
              title="Resumen del mes"
              data={[
                { label: "Ingresos", value: totals.income, color: "green" },
                { label: "Gastos", value: totals.expense, color: "red" },
                { label: "Deudas", value: totals.debt, color: "yellow" },
                { label: "Ahorro", value: totals.saving, color: "purple" },
                {
                  label: "Libre",
                  value: Math.max(totals.free, 0),
                  color: "blue",
                },
              ]}
              currency={currency}
              rate={rate}
            />
            <Card className="bg-slate-950 text-white">
              <h3 className="text-xl font-black">Insight MSP</h3>
              <p className="mt-2 text-sm text-slate-300">
                {totals.ratio > 90
                  ? "Tus compromisos están altos este mes."
                  : totals.ratio > 70
                  ? "Tu mes está en observación."
                  : "Tu mes se ve saludable."}
              </p>
            </Card>
          </div>
        )}
        {tab === "movements" && (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <MovementForm
                type="income"
                selectedMonth={selectedMonth}
                onAdd={(x) => setIncomes((prev) => [x, ...prev])}
              />
              <MovementForm
                type="expense"
                selectedMonth={selectedMonth}
                onAdd={(x) => setExpenses((prev) => [x, ...prev])}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ItemList
                title={`Ingresos - ${monthLabel(selectedMonth)}`}
                items={monthIncomes}
                onDelete={(x) =>
                  setIncomes((prev) => prev.filter((i) => i.id !== x))
                }
                currency={currency}
                rate={rate}
              />
              <ItemList
                title={`Gastos - ${monthLabel(selectedMonth)}`}
                items={monthExpenses}
                onDelete={(x) =>
                  setExpenses((prev) => prev.filter((i) => i.id !== x))
                }
                currency={currency}
                rate={rate}
              />
            </div>
          </>
        )}
        {tab === "debts" && (
          <Debts
            debts={monthDebts}
            setDebts={setDebts}
            selectedMonth={selectedMonth}
          />
        )}
        {tab === "savings" && (
          <Savings
            savings={monthSavings}
            setSavings={setSavings}
            selectedMonth={selectedMonth}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("mspUserEmail") || ""
  );
  const login = () => setPage("subscription");
  const logout = () => {
    localStorage.removeItem("mspUserEmail");
    setUserEmail("");
    setPage("subscription");
  };
  const unlock = (email) => {
    setUserEmail(email);
    localStorage.setItem("mspUserEmail", email);
    setPage("dashboard");
  };
  if (page === "admin") return <AdminPage onHome={() => setPage("landing")} />;
  if (page === "demo")
    return (
      <DashboardPage
        demoMode
        userEmail="demo@mspfinance.com"
        onLogin={login}
        onLogout={() => setPage("landing")}
      />
    );
  if (page === "subscription")
    return <LoginPage onHome={() => setPage("landing")} onUnlock={unlock} />;
  if (page === "dashboard")
    return (
      <DashboardPage userEmail={userEmail} onLogin={login} onLogout={logout} />
    );
  return (
    <LandingPage
      onStart={login}
      onDemo={() => setPage("demo")}
      onAdmin={() => setPage("admin")}
    />
  );
}
