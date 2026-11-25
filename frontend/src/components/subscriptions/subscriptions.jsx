
import { useMemo, useState } from "react";

import {
  Users,
  CheckCircle2,
  CalendarClock,
  PauseCircle,
  Search,
  Plus,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RotateCcw,
  Filter,
  MoreVertical,
  Tv,
  Radio,
  Wifi,
  TrendingUp,
  X
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import "./subscriptions.css";

// Temporary sample data.
// Replace with data from your backend API later.
const initialSubscriptions = [
  {
    id: "SUB-1001",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    service: "IPTV",
    package: "IPTV Premium",
    integration: "Provider A",
    startDate: "2026-11-21",
    expiryDate: "2026-12-21",
    status: "Active"
  },
  {
    id: "SUB-1002",
    customer: "Arun Kumar",
    email: "arun@example.com",
    service: "OTT",
    package: "OTT Standard",
    integration: "Provider B",
    startDate: "2026-11-20",
    expiryDate: "2026-12-20",
    status: "Active"
  },
  {
    id: "SUB-1003",
    customer: "Priya Singh",
    email: "priya@example.com",
    service: "Internet",
    package: "Internet 100 Mbps",
    integration: "Provider C",
    startDate: "2026-10-01",
    expiryDate: "2026-11-01",
    status: "Expired"
  },
  {
    id: "SUB-1004",
    customer: "Vijay Kumar",
    email: "vijay@example.com",
    service: "IPTV",
    package: "IPTV Basic",
    integration: "Provider A",
    startDate: "2026-11-18",
    expiryDate: "2026-12-18",
    status: "Inactive"
  },
  {
    id: "SUB-1005",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    service: "OTT",
    package: "OTT Premium",
    integration: "Provider B",
    startDate: "2026-11-17",
    expiryDate: "2026-12-17",
    status: "Active"
  },
  {
    id: "SUB-1006",
    customer: "Karthik Raj",
    email: "karthik@example.com",
    service: "Internet",
    package: "Internet 200 Mbps",
    integration: "Provider C",
    startDate: "2026-09-15",
    expiryDate: "2026-10-15",
    status: "Expired"
  },
  {
    id: "SUB-1007",
    customer: "Meena Das",
    email: "meena@example.com",
    service: "IPTV",
    package: "IPTV Premium",
    integration: "Provider D",
    startDate: "2026-11-15",
    expiryDate: "2026-12-15",
    status: "Active"
  },
  {
    id: "SUB-1008",
    customer: "Ajay Verma",
    email: "ajay@example.com",
    service: "OTT",
    package: "OTT Standard",
    integration: "Provider B",
    startDate: "2026-11-10",
    expiryDate: "2026-12-10",
    status: "Inactive"
  }
];

const trendData = [
  { month: "Jun", count: 680 },
  { month: "Jul", count: 840 },
  { month: "Aug", count: 920 },
  { month: "Sep", count: 880 },
  { month: "Oct", count: 1050 },
  { month: "Nov", count: 1248 }
];

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`subscription-status ${status.toLowerCase()}`}>
      <span className="subscription-status-dot" />
      {status}
    </span>
  );
}

const ServiceLabel = ({ service }) => {
  const serviceIcons = {
    IPTV: Tv,
    OTT: Radio,
    Internet: Wifi
  };

  const Icon = serviceIcons[service] || Wifi;

  return (
    <span className={`subscription-service ${service.toLowerCase()}`}>
      <Icon size={16} />
      {service}
    </span>
  );
}

const SummaryCard = ({ title, value, icon: Icon, color, description }) => {
  return (
    <div className="subscription-summary-card">
      <div className="subscription-summary-top">
        <div className={`subscription-summary-icon ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h3>{value.toLocaleString("en-IN")}</h3>
      <p>{title}</p>
      <span>{description}</span>
    </div>
  );
}

const SubscriptionRowActions = ({ subscription, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  const changeStatus = (status) => {
    onStatusChange(subscription.id, status);
    setOpen(false);
  };

  return (
    <div className="subscription-row-actions">
      <button
        type="button"
        className="subscription-action-trigger"
        aria-label={`Actions for ${subscription.id}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="subscription-menu-backdrop"
            aria-label="Close actions menu"
            onClick={() => setOpen(false)}
          />

          <div className="subscription-action-menu">
            {subscription.status !== "Active" && (
              <button type="button" onClick={() => changeStatus("Active")}>
                Activate
              </button>
            )}

            {subscription.status === "Active" && (
              <button type="button" onClick={() => changeStatus("Inactive")}>
                Suspend
              </button>
            )}

            {subscription.status !== "Expired" && (
              <button type="button" onClick={() => changeStatus("Expired")}>
                Mark as expired
              </button>
            )}

            <button
              type="button"
              className="danger-action"
              onClick={() => changeStatus("Inactive")}
            >
              Deactivate
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const Subscriptions = ({ onNewSubscription }) => {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    service: "All",
    package: "All",
    status: "All",
    fromDate: "",
    toDate: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const packageOptions = useMemo(() => {
    const availablePackages = subscriptions
      .filter(
        (item) =>
          serviceFilter === "All" || item.service === serviceFilter
      )
      .map((item) => item.package);

    return [...new Set(availablePackages)].sort();
  }, [subscriptions, serviceFilter]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText) ||
        item.customer.toLowerCase().includes(searchText) ||
        item.email.toLowerCase().includes(searchText) ||
        item.package.toLowerCase().includes(searchText) ||
        item.integration.toLowerCase().includes(searchText);

      const matchesService =
        appliedFilters.service === "All" ||
        item.service === appliedFilters.service;

      const matchesPackage =
        appliedFilters.package === "All" ||
        item.package === appliedFilters.package;

      const matchesStatus =
        appliedFilters.status === "All" ||
        item.status === appliedFilters.status;

      const matchesFromDate =
        !appliedFilters.fromDate ||
        item.startDate >= appliedFilters.fromDate;

      const matchesToDate =
        !appliedFilters.toDate ||
        item.startDate <= appliedFilters.toDate;

      return (
        matchesSearch &&
        matchesService &&
        matchesPackage &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [subscriptions, search, appliedFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / pageSize)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSubscriptions = filteredSubscriptions.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const activeCount = subscriptions.filter(
    (item) => item.status === "Active"
  ).length;

  const expiredCount = subscriptions.filter(
    (item) => item.status === "Expired"
  ).length;

  const inactiveCount = subscriptions.filter(
    (item) => item.status === "Inactive"
  ).length;

  const applyFilters = () => {
    setAppliedFilters({
      service: serviceFilter,
      package: packageFilter,
      status: statusFilter,
      fromDate,
      toDate
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setServiceFilter("All");
    setPackageFilter("All");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setSearch("");

    setAppliedFilters({
      service: "All",
      package: "All",
      status: "All",
      fromDate: "",
      toDate: ""
    });

    setCurrentPage(1);
  };

  const updateSubscriptionStatus = (id, status) => {
    setSubscriptions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const handleServiceChange = (value) => {
    setServiceFilter(value);
    setPackageFilter("All");
  };

  return (
    <div className="subscriptions-page">

      {/* Page heading */}
      <div className="subscriptions-heading">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage your active and past subscriptions</p>
        </div>

        <button
          type="button"
          className="new-subscription-btn"
          onClick={onNewSubscription}
        >
          <Plus size={18} />
          New Subscription
        </button>
      </div>

      {/* Summary cards */}
      <section className="subscription-summary-grid">
        <SummaryCard
          title="Total Subscriptions"
          value={subscriptions.length}
          icon={Users}
          color="blue"
          description="All subscription records"
        />

        <SummaryCard
          title="Active Subscriptions"
          value={activeCount}
          icon={CheckCircle2}
          color="green"
          description="Currently active"
        />

        <SummaryCard
          title="Expired Subscriptions"
          value={expiredCount}
          icon={CalendarClock}
          color="orange"
          description="Require renewal"
        />

        <SummaryCard
          title="Inactive Subscriptions"
          value={inactiveCount}
          icon={PauseCircle}
          color="purple"
          description="Deactivated or suspended"
        />
      </section>

      {/* Search and filters */}
      <section className="subscription-filter-panel">

        <div className="subscription-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by subscription ID, customer or package..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="subscription-filter-row">
          <select
            value={serviceFilter}
            onChange={(event) => handleServiceChange(event.target.value)}
            aria-label="Filter by service"
          >
            <option value="All">All Services</option>
            <option value="IPTV">IPTV</option>
            <option value="OTT">OTT</option>
            <option value="Internet">Internet</option>
          </select>

          <select
            value={packageFilter}
            onChange={(event) => setPackageFilter(event.target.value)}
            aria-label="Filter by package"
          >
            <option value="All">All Packages</option>
            {packageOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="subscription-date-filter">
            <CalendarDays size={16} />
            <input
              type="date"
              aria-label="Start date from"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              aria-label="Start date to"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="subscription-filter-buttons">
            <button
              type="button"
              className="reset-filter-btn"
              onClick={resetFilters}
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              type="button"
              className="apply-filter-btn"
              onClick={applyFilters}
            >
              <Filter size={15} />
              Apply Filters
            </button>
          </div>
        </div>
      </section>

      {/* Subscription records */}
      <section className="subscription-records-panel">

        <div className="subscription-records-heading">
          <div>
            <h2>
              <Users size={19} />
              Subscription Records
            </h2>
            <p>View and manage your subscription records</p>
          </div>

          <div className="subscription-record-count">
            Showing{" "}
            {filteredSubscriptions.length === 0
              ? 0
              : (safeCurrentPage - 1) * pageSize + 1}
            –
            {Math.min(safeCurrentPage * pageSize, filteredSubscriptions.length)}
            {" "}of {filteredSubscriptions.length}
          </div>
        </div>

        <div className="subscription-table-wrapper">
          <table className="subscription-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Package</th>
                <th>Integration</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSubscriptions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong className="subscription-id">{item.id}</strong>
                  </td>

                  <td>
                    <div className="subscription-customer">
                      <strong>{item.customer}</strong>
                      <span>{item.email}</span>
                    </div>
                  </td>

                  <td>
                    <ServiceLabel service={item.service} />
                  </td>

                  <td>{item.package}</td>

                  <td>{item.integration}</td>

                  <td>{formatDate(item.startDate)}</td>

                  <td>{formatDate(item.expiryDate)}</td>

                  <td>
                    <StatusBadge status={item.status} />
                  </td>

                  <td>
                    <SubscriptionRowActions
                      subscription={item}
                      onStatusChange={updateSubscriptionStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && (
            <div className="subscription-empty-state">
              <Search size={28} />
              <h3>No subscriptions found</h3>
              <p>Try changing your search or filter criteria.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredSubscriptions.length > 0 && (
          <div className="subscription-pagination">
            <div className="subscription-page-size">
              <span>Rows per page</span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="subscription-page-controls">
              <span>
                Page {safeCurrentPage} of {totalPages}
              </span>

              <button
                type="button"
                aria-label="Previous page"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                aria-label="Next page"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Trend and quick actions */}
      <section className="subscription-bottom-grid">

        <div className="subscription-trend-panel">
          <div className="subscription-section-heading">
            <div>
              <h2>
                <TrendingUp size={19} />
                Subscription Trend
              </h2>
              <p>Subscription growth over the last six months</p>
            </div>
          </div>

          <div className="subscription-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 15, right: 12, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="subscriptionPageGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2874e8"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2874e8"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#edf1f7"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8995a8", fontSize: 11 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8995a8", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5eaf2",
                    borderRadius: "9px",
                    fontSize: "12px"
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2874e8"
                  strokeWidth={2.5}
                  fill="url(#subscriptionPageGradient)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="subscription-quick-actions">
          <div className="subscription-section-heading">
            <div>
              <h2>
                <Plus size={19} />
                Quick Actions
              </h2>
              <p>Common subscription operations</p>
            </div>
          </div>

          <button
            type="button"
            className="subscription-quick-action"
            onClick={onNewSubscription}
          >
            <Plus size={18} />
            New Subscription
          </button>

          <p className="subscription-quick-note">
            Create a subscription by selecting a customer, service, package
            and compatible integration.
          </p>
        </div>

      </section>
    </div>
  );
}

export default Subscriptions;
