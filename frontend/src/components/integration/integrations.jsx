import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileJson,
  Filter,
  Globe,
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import "./integrations.css";

const SERVICE_OPTIONS = ["IPTV", "OTT", "INTERNET"];
const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const AUTH_OPTIONS = ["API Key", "Bearer Token", "Basic Auth", "OAuth 2.0", "None"];

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialIntegrations = [
  {
    id: "int-1",
    name: "ABC IPTV Provider",
    provider: "ABC Digital",
    service: "IPTV",
    baseUrl: "https://api.abcprovider.com",
    authType: "API Key",
    status: "Active",
    lastTested: "Today, 10:42 AM",
    credentialConfigured: true,
    actions: [
      {
        id: "act-1",
        name: "Create Subscriber",
        code: "subscriber.create",
        method: "POST",
        endpoint: "/v1/subscribers",
        description: "Create a new subscriber in the provider system.",
        headers: '{\n  "Content-Type": "application/json",\n  "X-API-Key": "{{api_key}}"\n}',
        queryParams: "{}",
        body: '{\n  "customer_name": "{{customer.name}}",\n  "mobile_number": "{{customer.phone}}",\n  "package_id": "{{package.external_id}}"\n}',
        responseMapping: '{\n  "external_customer_id": "$.data.subscriber_id",\n  "status": "$.data.status"\n}',
      },
      {
        id: "act-2",
        name: "Get Subscriber",
        code: "subscriber.get",
        method: "GET",
        endpoint: "/v1/subscribers/{subscriber_id}",
        description: "Fetch subscriber details and current status.",
        headers: '{\n  "X-API-Key": "{{api_key}}"\n}',
        queryParams: "{}",
        body: "",
        responseMapping: '{\n  "status": "$.data.status",\n  "expiry_date": "$.data.expiry"\n}',
      },
      {
        id: "act-3",
        name: "Renew Subscription",
        code: "subscription.renew",
        method: "POST",
        endpoint: "/v1/subscriptions/renew",
        description: "Extend an existing subscriber subscription.",
        headers: '{\n  "Content-Type": "application/json",\n  "X-API-Key": "{{api_key}}"\n}',
        queryParams: "{}",
        body: '{\n  "subscriber_id": "{{subscriber.external_id}}",\n  "package_id": "{{package.external_id}}",\n  "days": "{{subscription.duration_days}}"\n}',
        responseMapping: '{\n  "success": "$.success",\n  "new_expiry": "$.data.expiry"\n}',
      },
    ],
  },
  {
    id: "int-2",
    name: "Stream OTT Gateway",
    provider: "StreamWorks",
    service: "OTT",
    baseUrl: "https://gateway.streamworks.io/api",
    authType: "Bearer Token",
    status: "Active",
    lastTested: "Yesterday",
    credentialConfigured: true,
    actions: [
      {
        id: "act-4",
        name: "Activate Account",
        code: "subscriber.create",
        method: "POST",
        endpoint: "/accounts/activate",
        description: "Activate an OTT account.",
        headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{access_token}}"\n}',
        queryParams: "{}",
        body: '{\n  "name": "{{customer.name}}",\n  "phone": "{{customer.phone}}",\n  "plan": "{{package.external_id}}"\n}',
        responseMapping: '{\n  "account_id": "$.account.id",\n  "status": "$.account.status"\n}',
      },
      {
        id: "act-5",
        name: "Deactivate Account",
        code: "subscriber.suspend",
        method: "PATCH",
        endpoint: "/accounts/{account_id}/status",
        description: "Suspend an OTT account.",
        headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{access_token}}"\n}',
        queryParams: "{}",
        body: '{\n  "status": "suspended"\n}',
        responseMapping: '{\n  "status": "$.account.status"\n}',
      },
    ],
  },
  {
    id: "int-3",
    name: "FastNet Broadband",
    provider: "FastNet",
    service: "INTERNET",
    baseUrl: "https://api.fastnet.example",
    authType: "Basic Auth",
    status: "Inactive",
    lastTested: "Nov 18, 2026",
    credentialConfigured: true,
    actions: [
      {
        id: "act-6",
        name: "Create Connection",
        code: "connection.create",
        method: "POST",
        endpoint: "/api/v2/connections",
        description: "Provision a new broadband connection.",
        headers: '{\n  "Content-Type": "application/json"\n}',
        queryParams: "{}",
        body: '{\n  "name": "{{customer.name}}",\n  "address": "{{customer.address}}",\n  "plan_code": "{{package.external_id}}"\n}',
        responseMapping: '{\n  "connection_id": "$.result.id"\n}',
      },
    ],
  },
];

const emptyIntegration = {
  name: "",
  provider: "",
  service: "IPTV",
  baseUrl: "",
  authType: "API Key",
  credential: "",
};

const emptyAction = {
  name: "",
  code: "",
  method: "POST",
  endpoint: "",
  description: "",
  headers: '{\n  "Content-Type": "application/json"\n}',
  queryParams: "{}",
  body: '{\n}',
  responseMapping: "{\n}",
};

function parseJson(value, label) {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must contain valid JSON.`);
  }
}

function serviceClass(service) {
  return service.toLowerCase();
}

function MethodBadge({ method }) {
  return <span className={`method-badge method-${method.toLowerCase()}`}>{method}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className={`integration-status-pill ${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function IntegrationModal({ initialValue, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...emptyIntegration,
    ...initialValue,
    credential: "",
  }));
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.provider.trim() || !form.baseUrl.trim()) {
      setError("Integration name, provider name and base URL are required.");
      return;
    }
    try {
      const url = new URL(form.baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        setError("Base URL must use HTTP or HTTPS.");
        return;
      }
    } catch {
      setError("Enter a valid base URL, including https://.");
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      provider: form.provider.trim(),
      baseUrl: form.baseUrl.trim().replace(/\/+$/, ""),
      credentialConfigured: Boolean(form.credential) || Boolean(initialValue?.credentialConfigured),
    });
  };

  return (
    <div className="integration-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="integration-modal integration-modal-wide" onSubmit={submit}>
        <div className="integration-modal-heading">
          <div>
            <span className="eyebrow">CONNECTION SETTINGS</span>
            <h2>{initialValue ? "Edit integration" : "Add integration"}</h2>
            <p>Connect a provider API to one of your ServiceHub services.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="integration-form-section">
          <h3><Globe size={16} /> Integration details</h3>
          <div className="integration-form-grid">
            <label className="integration-field">
              <span>Integration name <b>*</b></span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. ABC IPTV Provider" />
            </label>
            <label className="integration-field">
              <span>Provider name <b>*</b></span>
              <input value={form.provider} onChange={(e) => update("provider", e.target.value)} placeholder="e.g. ABC Digital" />
            </label>
            <label className="integration-field">
              <span>Service <b>*</b></span>
              <select value={form.service} onChange={(e) => update("service", e.target.value)}>
                {SERVICE_OPTIONS.map((service) => <option key={service}>{service}</option>)}
              </select>
            </label>
            <label className="integration-field">
              <span>Authentication type</span>
              <select value={form.authType} onChange={(e) => update("authType", e.target.value)}>
                {AUTH_OPTIONS.map((auth) => <option key={auth}>{auth}</option>)}
              </select>
            </label>
            <label className="integration-field full">
              <span>Base URL <b>*</b></span>
              <input value={form.baseUrl} onChange={(e) => update("baseUrl", e.target.value)} placeholder="https://api.provider.com" />
              <small>Action endpoint paths are appended to this base URL.</small>
            </label>
            {form.authType !== "None" && (
              <label className="integration-field full">
                <span>{form.authType} credential {initialValue?.credentialConfigured && <em>(leave blank to keep existing)</em>}</span>
                <div className="secret-field">
                  <KeyRound size={16} />
                  <input
                    type={showSecret ? "text" : "password"}
                    value={form.credential}
                    onChange={(e) => update("credential", e.target.value)}
                    placeholder={initialValue?.credentialConfigured ? "Credential is configured" : "Enter credential"}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowSecret((value) => !value)} aria-label="Toggle credential visibility">
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small>Demo UI only: credentials are not sent to a backend or stored securely yet.</small>
              </label>
            )}
          </div>
        </div>

        {error && <div className="integration-form-error">{error}</div>}
        <div className="integration-modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button-primary"><Check size={15} /> Save integration</button>
        </div>
      </form>
    </div>
  );
}

function ActionModal({ integration, initialValue, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...emptyAction, ...initialValue }));
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.code.trim() || !form.endpoint.trim()) {
      setError("Action name, action code and endpoint path are required.");
      return;
    }
    if (!form.endpoint.startsWith("/")) {
      setError("Endpoint path must start with /, for example /v1/subscribers.");
      return;
    }
    try {
      parseJson(form.headers, "Headers");
      parseJson(form.queryParams, "Query parameters");
      if (form.method !== "GET" && form.method !== "DELETE") parseJson(form.body, "Request body");
      parseJson(form.responseMapping, "Response mapping");
    } catch (validationError) {
      setError(validationError.message);
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
      endpoint: form.endpoint.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <div className="integration-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="integration-modal action-modal" onSubmit={submit}>
        <div className="integration-modal-heading">
          <div>
            <span className="eyebrow">API ACTION CONFIGURATION</span>
            <h2>{initialValue ? "Edit API action" : "Add API action"}</h2>
            <p>Configure an operation for <strong>{integration.name}</strong>.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="action-form-callout">
          <Code2 size={17} />
          <div><strong>One action = one API operation</strong><span>HTTP method and endpoint are configured separately for every action.</span></div>
        </div>

        <div className="integration-form-section">
          <h3><Zap size={16} /> Action definition</h3>
          <div className="integration-form-grid">
            <label className="integration-field">
              <span>Action name <b>*</b></span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Create Subscriber" />
            </label>
            <label className="integration-field">
              <span>Action code <b>*</b></span>
              <input value={form.code} onChange={(e) => update("code", e.target.value)} placeholder="subscriber.create" />
            </label>
            <label className="integration-field">
              <span>HTTP method <b>*</b></span>
              <select value={form.method} onChange={(e) => update("method", e.target.value)}>
                {METHOD_OPTIONS.map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
            <label className="integration-field">
              <span>Endpoint path <b>*</b></span>
              <input value={form.endpoint} onChange={(e) => update("endpoint", e.target.value)} placeholder="/v1/subscribers" />
            </label>
            <label className="integration-field full">
              <span>Description</span>
              <input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this action do?" />
            </label>
          </div>
          <div className="endpoint-preview">
            <span>REQUEST URL</span>
            <code>{integration.baseUrl || "https://provider.example"}{form.endpoint || "/endpoint"}</code>
          </div>
        </div>

        <div className="integration-form-section">
          <h3><Settings2 size={16} /> Request configuration</h3>
          <div className="integration-form-grid">
            <label className="integration-field">
              <span>Request headers <small>JSON object</small></span>
              <textarea spellCheck="false" value={form.headers} onChange={(e) => update("headers", e.target.value)} rows={5} />
            </label>
            <label className="integration-field">
              <span>Query parameters <small>JSON object</small></span>
              <textarea spellCheck="false" value={form.queryParams} onChange={(e) => update("queryParams", e.target.value)} rows={5} />
            </label>
            <label className="integration-field full">
              <span>Request body / payload <small>JSON template · not required for GET/DELETE</small></span>
              <textarea spellCheck="false" value={form.body} onChange={(e) => update("body", e.target.value)} rows={7} disabled={form.method === "GET" || form.method === "DELETE"} />
            </label>
          </div>
        </div>

        <div className="integration-form-section">
          <h3><FileJson size={16} /> Response mapping</h3>
          <label className="integration-field">
            <span>Map provider response to ServiceHub fields <small>JSON object</small></span>
            <textarea spellCheck="false" value={form.responseMapping} onChange={(e) => update("responseMapping", e.target.value)} rows={5} />
            <small>Example: {"{ \"external_id\": \"$.data.id\" }"} maps the provider response ID to a canonical ServiceHub field.</small>
          </label>
        </div>

        {error && <div className="integration-form-error">{error}</div>}
        <div className="integration-modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button-primary"><Check size={15} /> Save API action</button>
        </div>
      </form>
    </div>
  );
}

function ActionMenu({ integration, onEdit, onToggle, onDelete, onManage }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="row-menu-wrap">
      <button className="icon-button subtle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Integration options">
        <MoreHorizontal size={18} />
      </button>
      {open && <>
        <button className="menu-dismiss" aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="row-menu">
          <button onClick={() => { setOpen(false); onManage(); }}><Settings2 size={14} /> Manage API actions</button>
          <button onClick={() => { setOpen(false); onEdit(); }}><Edit3 size={14} /> Edit integration</button>
          <button onClick={() => { setOpen(false); onToggle(); }}><Activity size={14} /> {integration.status === "Active" ? "Deactivate" : "Activate"}</button>
          <button className="danger" onClick={() => { setOpen(false); onDelete(); }}><Trash2 size={14} /> Delete integration</button>
        </div>
      </>}
    </div>
  );
}

function ActionMenuInline({ onEdit, onDelete, onTest }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="row-menu-wrap">
      <button className="icon-button subtle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Action options">
        <MoreHorizontal size={18} />
      </button>
      {open && <>
        <button className="menu-dismiss" aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="row-menu">
          <button onClick={() => { setOpen(false); onTest(); }}><Zap size={14} /> Test action</button>
          <button onClick={() => { setOpen(false); onEdit(); }}><Edit3 size={14} /> Edit action</button>
          <button className="danger" onClick={() => { setOpen(false); onDelete(); }}><Trash2 size={14} /> Delete action</button>
        </div>
      </>}
    </div>
  );
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState(null);
  const [integrationModal, setIntegrationModal] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All services");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [actionSearch, setActionSearch] = useState("");
  const [notice, setNotice] = useState("");

  const selectedIntegration = integrations.find((item) => item.id === selectedIntegrationId) || null;

  const filteredIntegrations = useMemo(() => integrations.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [item.name, item.provider, item.baseUrl, item.service].some((value) => value.toLowerCase().includes(term));
    const matchesService = serviceFilter === "All services" || item.service === serviceFilter;
    const matchesStatus = statusFilter === "All statuses" || item.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  }), [integrations, search, serviceFilter, statusFilter]);

  const totalActions = integrations.reduce((total, item) => total + item.actions.length, 0);
  const activeCount = integrations.filter((item) => item.status === "Active").length;
  const inactiveCount = integrations.length - activeCount;

  const updateIntegration = (id, changes) => {
    setIntegrations((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  };

  const saveIntegration = (value) => {
    if (integrationModal?.id) {
      updateIntegration(integrationModal.id, value);
      setNotice("Integration details updated.");
    } else {
      const created = { ...value, id: makeId(), status: "Draft", lastTested: "Not tested", actions: [] };
      setIntegrations((current) => [created, ...current]);
      setNotice("Integration created. Add API actions to configure its operations.");
    }
    setIntegrationModal(null);
  };

const saveAction = (value) => {
  // Prevent saving if the action modal is already closed
  if (!actionModal?.integrationId) {
    return;
  }

  const currentModal = actionModal;
  const integrationId = currentModal.integrationId;
  const actionId = currentModal.action?.id;

  setIntegrations((current) =>
    current.map((item) => {
      if (item.id !== integrationId) return item;

      if (actionId) {
        return {
          ...item,
          actions: item.actions.map((action) =>
            action.id === actionId
              ? { ...value, id: actionId }
              : action
          ),
        };
      }

      return {
        ...item,
        actions: [...item.actions, { ...value, id: makeId() }],
      };
    })
  );

  setActionModal(null);
  setNotice(actionId ? "API action updated." : "API action added.");
};

  const deleteIntegration = (integration) => {
    if (!window.confirm(`Delete "${integration.name}" and all its API actions?`)) return;
    setIntegrations((current) => current.filter((item) => item.id !== integration.id));
    if (selectedIntegrationId === integration.id) setSelectedIntegrationId(null);
    setNotice("Integration deleted.");
  };

  const deleteAction = (integration, action) => {
    if (!window.confirm(`Delete the "${action.name}" action?`)) return;
    updateIntegration(integration.id, { actions: integration.actions.filter((item) => item.id !== action.id) });
    setNotice("API action deleted.");
  };

  const openActionForm = (integration, action = null) => {
    setActionModal({ integrationId: integration.id, action });
  };

  const testAction = (action) => {
    setNotice(`"${action.name}" is configured. Live testing requires a backend test endpoint; this frontend demo does not send provider requests.`);
  };

  const visibleActions = selectedIntegration
    ? selectedIntegration.actions.filter((action) => {
        const term = actionSearch.trim().toLowerCase();
        return !term || [action.name, action.code, action.method, action.endpoint].some((value) => value.toLowerCase().includes(term));
      })
    : [];

  return (
    <div className="integrations-page">
      <div className="integrations-heading">
        <div>
          <div className="integrations-breadcrumb">WORKSPACE <ChevronRight size={13} /> CONFIGURATION</div>
          <h1>{selectedIntegration ? "Integration details" : "Integrations"}</h1>
          <p>{selectedIntegration ? "Manage this provider connection and its API operations." : "Connect external providers and configure the API operations used by your services."}</p>
        </div>
        {selectedIntegration ? (
          <button className="button-secondary" onClick={() => setSelectedIntegrationId(null)}><ArrowLeft size={15} /> All integrations</button>
        ) : (
          <button className="button-primary" onClick={() => setIntegrationModal({})}><Plus size={16} /> Add integration</button>
        )}
      </div>

      {notice && (
        <div className="integration-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button>
        </div>
      )}

      {!selectedIntegration ? (
        <>
          <div className="integration-stats-grid">
            <div className="integration-stat-card"><div className="stat-icon blue"><Globe size={18} /></div><span>Total integrations</span><strong>{integrations.length}</strong><small>Configured provider connections</small></div>
            <div className="integration-stat-card"><div className="stat-icon green"><Activity size={18} /></div><span>Active integrations</span><strong>{activeCount}</strong><small>Available for API operations</small></div>
            <div className="integration-stat-card"><div className="stat-icon amber"><Clock3 size={18} /></div><span>Inactive / draft</span><strong>{inactiveCount}</strong><small>Not currently active</small></div>
            <div className="integration-stat-card"><div className="stat-icon violet"><Code2 size={18} /></div><span>Configured API actions</span><strong>{totalActions}</strong><small>Operations across all integrations</small></div>
          </div>

          <section className="integration-panel">
            <div className="panel-heading">
              <div><h2>Provider integrations</h2><p>Each integration belongs to one ServiceHub service and contains its own API actions.</p></div>
              <span className="record-count">{filteredIntegrations.length} records</span>
            </div>
            <div className="integration-toolbar">
              <div className="integration-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integration, provider or URL..." />{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button>}</div>
              <div className="integration-filters">
                <label><Filter size={14} /><select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}><option>All services</option>{SERVICE_OPTIONS.map((service) => <option key={service}>{service}</option>)}</select><ChevronDown size={13} /></label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All statuses</option><option>Active</option><option>Inactive</option><option>Draft</option></select>
                <button className="button-secondary compact" onClick={() => { setSearch(""); setServiceFilter("All services"); setStatusFilter("All statuses"); }}>Reset</button>
              </div>
            </div>

            <div className="integration-table-scroll">
              <table className="integration-table">
                <thead><tr><th>INTEGRATION</th><th>SERVICE</th><th>BASE URL</th><th>AUTHENTICATION</th><th>API ACTIONS</th><th>LAST TESTED</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {filteredIntegrations.map((integration) => (
                    <tr key={integration.id}>
                      <td><button className="integration-name-button" onClick={() => setSelectedIntegrationId(integration.id)}><span className={`provider-avatar ${serviceClass(integration.service)}`}><Server size={17} /></span><span><strong>{integration.name}</strong><small>{integration.provider}</small></span></button></td>
                      <td><span className={`service-tag ${serviceClass(integration.service)}`}>{integration.service}</span></td>
                      <td><span className="base-url-cell" title={integration.baseUrl}>{integration.baseUrl}</span></td>
                      <td><span className="auth-cell"><KeyRound size={14} />{integration.authType}</span></td>
                      <td><button className="action-count-button" onClick={() => setSelectedIntegrationId(integration.id)}><Code2 size={13} />{integration.actions.length} actions <ChevronRight size={13} /></button></td>
                      <td className="muted-cell">{integration.lastTested}</td>
                      <td><StatusBadge status={integration.status} /></td>
                      <td><ActionMenu integration={integration} onManage={() => setSelectedIntegrationId(integration.id)} onEdit={() => setIntegrationModal(integration)} onToggle={() => updateIntegration(integration.id, { status: integration.status === "Active" ? "Inactive" : "Active" })} onDelete={() => deleteIntegration(integration)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIntegrations.length === 0 && <div className="integration-empty"><Search size={25} /><strong>No integrations found</strong><span>Try changing your search or filters.</span></div>}
            </div>
            <div className="integration-table-footer"><span>Showing {filteredIntegrations.length} of {integrations.length} integrations</span><span>API methods are configured per action, not per integration.</span></div>
          </section>

          <div className="integration-guidance">
            <div className="guidance-icon"><ShieldCheck size={19} /></div>
            <div><strong>Keep provider credentials secure</strong><p>This screen is currently a frontend prototype. Before production, store credentials encrypted on the server, redact secrets from logs, and validate outbound URLs to prevent SSRF.</p></div>
          </div>
        </>
      ) : (
        <>
          <section className="integration-detail-card">
            <div className="detail-main">
              <span className={`provider-avatar large ${serviceClass(selectedIntegration.service)}`}><Server size={22} /></span>
              <div><div className="detail-title-line"><h2>{selectedIntegration.name}</h2><StatusBadge status={selectedIntegration.status} /></div><p>{selectedIntegration.provider} <span>·</span> {selectedIntegration.service}</p><a href={selectedIntegration.baseUrl} target="_blank" rel="noreferrer">{selectedIntegration.baseUrl} <ArrowUpRight size={13} /></a></div>
            </div>
            <div className="detail-meta">
              <div><span>AUTHENTICATION</span><strong><KeyRound size={14} />{selectedIntegration.authType}</strong></div>
              <div><span>API ACTIONS</span><strong><Code2 size={14} />{selectedIntegration.actions.length} configured</strong></div>
              <div><span>LAST TESTED</span><strong><Clock3 size={14} />{selectedIntegration.lastTested}</strong></div>
            </div>
            <div className="detail-buttons">
              <button className="button-secondary compact" onClick={() => setIntegrationModal(selectedIntegration)}><Edit3 size={14} /> Edit integration</button>
              <button className="button-primary compact" onClick={() => openActionForm(selectedIntegration)}><Plus size={15} /> Add API action</button>
            </div>
          </section>

          <section className="integration-panel actions-panel">
            <div className="panel-heading">
              <div><h2>API Actions</h2><p>Define each operation that ServiceHub can execute through this provider integration.</p></div>
              <button className="button-primary compact" onClick={() => openActionForm(selectedIntegration)}><Plus size={15} /> Add API action</button>
            </div>
            <div className="action-toolbar">
              <div className="integration-search"><Search size={16} /><input value={actionSearch} onChange={(e) => setActionSearch(e.target.value)} placeholder="Search action name, code or endpoint..." />{actionSearch && <button onClick={() => setActionSearch("")} aria-label="Clear search"><X size={14} /></button>}</div>
              <span className="record-count">{visibleActions.length} actions</span>
            </div>
            <div className="integration-table-scroll">
              <table className="integration-table action-table">
                <thead><tr><th>ACTION</th><th>ACTION CODE</th><th>METHOD</th><th>ENDPOINT PATH</th><th>REQUEST CONFIG</th><th /></tr></thead>
                <tbody>
                  {visibleActions.map((action) => (
                    <tr key={action.id}>
                      <td><div className="action-name-cell"><span className="action-icon"><Zap size={15} /></span><span><strong>{action.name}</strong><small>{action.description || "No description provided"}</small></span></div></td>
                      <td><code className="action-code">{action.code}</code></td>
                      <td><MethodBadge method={action.method} /></td>
                      <td><code className="endpoint-cell">{action.endpoint}</code></td>
                      <td><span className="request-config-label"><FileJson size={14} />Headers · Params · {action.method === "GET" || action.method === "DELETE" ? "No body" : "Body"}</span></td>
                      <td><ActionMenuInline onEdit={() => openActionForm(selectedIntegration, action)} onDelete={() => deleteAction(selectedIntegration, action)} onTest={() => testAction(action)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleActions.length === 0 && <div className="integration-empty"><Code2 size={26} /><strong>{selectedIntegration.actions.length ? "No matching actions" : "No API actions configured"}</strong><span>{selectedIntegration.actions.length ? "Try another search term." : "Add the first action for this integration to define an API operation."}</span>{selectedIntegration.actions.length === 0 && <button className="button-primary compact" onClick={() => openActionForm(selectedIntegration)}><Plus size={14} /> Add first action</button>}</div>}
            </div>
            <div className="integration-table-footer"><span>Actions: {selectedIntegration.actions.length}</span><span>Each action has its own HTTP method, endpoint and request/response mapping.</span></div>
          </section>

          <div className="integration-guidance">
            <div className="guidance-icon"><CircleHelp size={19} /></div>
            <div><strong>How action configuration works</strong><p>Use a stable action code such as <code>subscriber.create</code>. Map ServiceHub's standard fields to the provider's expected request fields, then map the provider response back to ServiceHub fields. Live execution and response validation must be implemented in the backend.</p></div>
          </div>
        </>
      )}

      {integrationModal && <IntegrationModal initialValue={integrationModal.id ? integrationModal : null} onClose={() => setIntegrationModal(null)} onSave={saveIntegration} />}
      {actionModal && <ActionModal integration={integrations.find((item) => item.id === actionModal.integrationId)} initialValue={actionModal.action} onClose={() => setActionModal(null)} onSave={saveAction} />}
    </div>
  );
}
