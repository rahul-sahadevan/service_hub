
import {
  Users,
  CalendarClock,
  PauseCircle,
  Layers,
  Package,
  Plug,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Wifi,
  Tv,
  Radio
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

import "./dashboard.css";

// Temporary dashboard data.
// Replace this with API response data later.
const stats = [
  {
    title: "Total Subscriptions",
    value: "1,248",
    change: "+12.5%",
    description: "Compared to last month",
    icon: Users,
    color: "blue",
    trend: "up"
  },
  {
    title: "Active Subscriptions",
    value: "986",
    change: "+8.2%",
    description: "Currently active",
    icon: CheckCircle2,
    color: "green",
    trend: "up"
  },
  {
    title: "Expired Subscriptions",
    value: "142",
    change: "+4.3%",
    description: "Require attention",
    icon: CalendarClock,
    color: "orange",
    trend: "down"
  },
  {
    title: "Inactive Subscriptions",
    value: "120",
    change: "-2.1%",
    description: "Deactivated or suspended",
    icon: PauseCircle,
    color: "purple",
    trend: "up"
  },
  {
    title: "Integrations",
    value: "08",
    change: "6 active",
    description: "2 inactive",
    icon: Plug,
    color: "cyan"
  },
  {
    title: "Services",
    value: "03",
    change: "Available services",
    description: "IPTV, OTT, Internet",
    icon: Layers,
    color: "indigo"
  },
  {
    title: "Packages",
    value: "16",
    change: "12 active",
    description: "4 inactive",
    icon: Package,
    color: "pink"
  },
  {
    title: "Operators",
    value: "00",
    change: "Coming soon",
    description: "Operator management",
    icon: Users,
    color: "gray"
  }
];

const subscriptionTrend = [
  { month: "Jan", subscriptions: 420 },
  { month: "Feb", subscriptions: 510 },
  { month: "Mar", subscriptions: 480 },
  { month: "Apr", subscriptions: 620 },
  { month: "May", subscriptions: 710 },
  { month: "Jun", subscriptions: 680 },
  { month: "Jul", subscriptions: 840 },
  { month: "Aug", subscriptions: 920 },
  { month: "Sep", subscriptions: 880 },
  { month: "Oct", subscriptions: 1050 },
  { month: "Nov", subscriptions: 1248 }
];

const serviceData = [
  {
    name: "IPTV",
    description: "Television subscriptions",
    count: 620,
    percentage: 50,
    icon: Tv,
    color: "service-blue"
  },
  {
    name: "OTT",
    description: "Streaming subscriptions",
    count: 380,
    percentage: 30,
    icon: Radio,
    color: "service-purple"
  },
  {
    name: "Internet",
    description: "Internet connections",
    count: 248,
    percentage: 20,
    icon: Wifi,
    color: "service-orange"
  }
];

const integrations = [
  {
    name: "IPTV Provider A",
    service: "IPTV",
    status: "Active",
    lastChecked: "2 minutes ago"
  },
  {
    name: "OTT Provider B",
    service: "OTT",
    status: "Active",
    lastChecked: "5 minutes ago"
  },
  {
    name: "Internet Provider C",
    service: "Internet",
    status: "Failed",
    lastChecked: "15 minutes ago"
  },
  {
    name: "IPTV Provider D",
    service: "IPTV",
    status: "Inactive",
    lastChecked: "1 hour ago"
  }
];

const recentSubscriptions = [
  {
    id: "SUB-1001",
    customer: "Rahul Sharma",
    service: "IPTV",
    package: "IPTV Premium",
    date: "21 Nov 2026",
    status: "Active"
  },
  {
    id: "SUB-1002",
    customer: "Arun Kumar",
    service: "OTT",
    package: "OTT Standard",
    date: "20 Nov 2026",
    status: "Active"
  },
  {
    id: "SUB-1003",
    customer: "Priya Singh",
    service: "Internet",
    package: "Internet 100 Mbps",
    date: "19 Nov 2026",
    status: "Expired"
  },
  {
    id: "SUB-1004",
    customer: "Vijay Kumar",
    service: "IPTV",
    package: "IPTV Basic",
    date: "18 Nov 2026",
    status: "Inactive"
  }
];

const apiActivity = [
  {
    action: "subscriber.create",
    integration: "IPTV Provider A",
    time: "10:42 AM",
    response: "200 OK",
    status: "Success"
  },
  {
    action: "subscription.renew",
    integration: "OTT Provider B",
    time: "10:35 AM",
    response: "200 OK",
    status: "Success"
  },
  {
    action: "subscriber.create",
    integration: "Internet Provider C",
    time: "10:21 AM",
    response: "500 Error",
    status: "Failed"
  },
  {
    action: "subscriber.suspend",
    integration: "IPTV Provider A",
    time: "09:58 AM",
    response: "200 OK",
    status: "Success"
  }
];

const StatusBadge = ({ status }) => {
  const statusClass = status.toLowerCase();

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

const StatCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${item.color}`}>
          <Icon size={20} />
        </div>

        {item.trend && (
          <span className={`stat-change ${item.trend}`}>
            {item.trend === "up" ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {item.change}
          </span>
        )}
      </div>

      <div className="stat-value">{item.value}</div>
      <div className="stat-title">{item.title}</div>

      <div className="stat-description">
        {item.description}
      </div>

      {!item.trend && (
        <div className="stat-extra">{item.change}</div>
      )}
    </div>
  );
}

const Dashboard = () => {
  return (
    <div className="dashboard-page">

      {/* Page heading */}
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Monitor your subscriptions, services and integrations.
          </p>
        </div>

        <div className="dashboard-date">
          <CalendarClock size={16} />
          <span>November 2026</span>
        </div>
      </div>

      {/* Statistics */}
      <section className="dashboard-stats">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </section>

      {/* Chart and service overview */}
      <section className="dashboard-middle">

        <div className="dashboard-panel subscription-chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Subscription Overview</h2>
              <p>Subscription growth over the last 11 months</p>
            </div>

            <span className="panel-period">Monthly</span>
          </div>

          <div className="chart-summary">
            <div>
              <h3>1,248</h3>
              <span>Total subscriptions</span>
            </div>

            <span className="chart-growth">
              <TrendingUp size={15} />
              12.5%
            </span>
          </div>

          <div className="subscription-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={subscriptionTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="subscriptionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b82f6"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="#3b82f6"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f5"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "13px"
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#subscriptionGradient)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel service-panel">
          <div className="panel-heading">
            <div>
              <h2>Services Overview</h2>
              <p>Subscriptions by service</p>
            </div>

            <Layers size={19} className="panel-heading-icon" />
          </div>

          <div className="service-total">
            <h3>1,248</h3>
            <span>Total subscriptions</span>
          </div>

          <div className="service-list">
            {serviceData.map((service) => {
              const Icon = service.icon;

              return (
                <div className="service-item" key={service.name}>
                  <div className="service-item-top">
                    <div className="service-info">
                      <div className={`service-icon ${service.color}`}>
                        <Icon size={17} />
                      </div>

                      <div>
                        <h4>{service.name}</h4>
                        <span>{service.description}</span>
                      </div>
                    </div>

                    <div className="service-count">
                      <strong>{service.count}</strong>
                      <span>{service.percentage}%</span>
                    </div>
                  </div>

                  <div className="service-progress">
                    <div
                      className={`service-progress-fill ${service.color}`}
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Integration health */}
      <section className="dashboard-panel integration-panel">
        <div className="panel-heading">
          <div>
            <h2>Integration Health</h2>
            <p>Monitor your connected service providers</p>
          </div>

          <span className="integration-total">08 Integrations</span>
        </div>

        <div className="integration-list">
          {integrations.map((integration) => (
            <div className="integration-item" key={integration.name}>
              <div className="integration-provider-icon">
                <Plug size={19} />
              </div>

              <div className="integration-provider">
                <h4>{integration.name}</h4>
                <span>{integration.service}</span>
              </div>

              <div className="integration-checked">
                <span>Last checked</span>
                <strong>{integration.lastChecked}</strong>
              </div>

              <StatusBadge status={integration.status} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent subscriptions and API activity */}
      <section className="dashboard-bottom">

        <div className="dashboard-panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Subscriptions</h2>
              <p>Latest subscription records</p>
            </div>

            <span className="panel-link">
              View all <ArrowUpRight size={15} />
            </span>
          </div>

          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Service / Package</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>
                      <strong>{subscription.customer}</strong>
                      <span className="table-subtext">
                        {subscription.id}
                      </span>
                    </td>

                    <td>
                      <strong>{subscription.service}</strong>
                      <span className="table-subtext">
                        {subscription.package}
                      </span>
                    </td>

                    <td>{subscription.date}</td>

                    <td>
                      <StatusBadge status={subscription.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel api-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent API Activity</h2>
              <p>Latest provider API executions</p>
            </div>

            <Activity size={19} className="panel-heading-icon" />
          </div>

          <div className="api-activity-list">
            {apiActivity.map((activity, index) => (
              <div className="api-activity-item" key={`${activity.action}-${index}`}>
                <div className={`api-activity-icon ${activity.status.toLowerCase()}`}>
                  {activity.status === "Success" ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertCircle size={17} />
                  )}
                </div>

                <div className="api-activity-info">
                  <h4>{activity.action}</h4>
                  <span>{activity.integration}</span>
                  <span className="api-time">
                    <Clock size={12} />
                    {activity.time}
                  </span>
                </div>

                <div className="api-response">
                  <strong>{activity.response}</strong>
                  <span className={activity.status.toLowerCase()}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;
