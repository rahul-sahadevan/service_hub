
import { useMemo, useState } from "react";

import {
  Tv,
  Radio,
  Wifi,
  Plus,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  Package,
  Plug,
  MoreVertical,
  Pencil,
  Power,
  X,
  ArrowUpRight,
  Filter
} from "lucide-react";

import "./services.css";

// Temporary sample data.
// Replace with the Services API response later.
const initialServices = [
  {
    id: "SRV-001",
    name: "IPTV",
    code: "IPTV",
    description: "Internet Protocol Television services and subscriptions.",
    packages: 6,
    integrations: 3,
    status: "Active",
    createdAt: "2026-08-12"
  },
  {
    id: "SRV-002",
    name: "OTT",
    code: "OTT",
    description: "Over-the-top streaming and digital entertainment services.",
    packages: 5,
    integrations: 2,
    status: "Active",
    createdAt: "2026-08-15"
  },
  {
    id: "SRV-003",
    name: "Internet",
    code: "INTERNET",
    description: "Broadband and internet connectivity services.",
    packages: 5,
    integrations: 3,
    status: "Active",
    createdAt: "2026-08-20"
  }
];

const serviceIcons = {
  IPTV: Tv,
  OTT: Radio,
  INTERNET: Wifi
};

const ServiceIcon = ({ code }) => {
  const Icon = serviceIcons[code] || Layers;

  return (
    <div className={`service-card-icon ${code.toLowerCase()}`}>
      <Icon size={23} />
    </div>
  );
}

const ServiceStatus = ({ status }) => {
  return (
    <span className={`service-status ${status.toLowerCase()}`}>
      <span className="service-status-dot" />
      {status}
    </span>
  );
}

const ServiceFormModal = ({ service, onClose, onSave }) => {
  const [name, setName] = useState(service?.name || "");
  const [code, setCode] = useState(service?.code || "");
  const [description, setDescription] = useState(
    service?.description || ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      setError("Service name and service code are required.");
      return;
    }

    onSave({
      name: trimmedName,
      code: trimmedCode,
      description: description.trim()
    });
  };

  return (
    <div className="service-modal-overlay" onMouseDown={onClose}>
      <div
        className="service-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="service-modal-header">
          <div>
            <h2 id="service-modal-title">
              {service ? "Edit Service" : "Add New Service"}
            </h2>
            <p>
              {service
                ? "Update the service information."
                : "Create a new service category for ServiceHub."}
            </p>
          </div>

          <button
            type="button"
            className="service-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="service-form-group">
            <label htmlFor="service-name">Service Name *</label>
            <input
              id="service-name"
              type="text"
              placeholder="Example: IPTV"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
            />
          </div>

          <div className="service-form-group">
            <label htmlFor="service-code">Service Code *</label>
            <input
              id="service-code"
              type="text"
              placeholder="Example: IPTV"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase())
              }
              maxLength={30}
              required
            />
            <span className="service-form-hint">
              Use a unique code. It will be used internally to identify this service.
            </span>
          </div>

          <div className="service-form-group">
            <label htmlFor="service-description">Description</label>
            <textarea
              id="service-description"
              placeholder="Enter a short description about this service..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={250}
            />
          </div>

          {error && <div className="service-form-error">{error}</div>}

          <div className="service-modal-actions">
            <button
              type="button"
              className="service-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="service-save-btn">
              {service ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ServiceRowActions = ({ service, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="service-row-actions">
      <button
        type="button"
        className="service-action-trigger"
        aria-label={`Actions for ${service.name}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="service-menu-backdrop"
            aria-label="Close service actions"
            onClick={() => setOpen(false)}
          />

          <div className="service-action-menu">
            <button
              type="button"
              onClick={() => {
                onEdit(service);
                setOpen(false);
              }}
            >
              <Pencil size={14} />
              Edit Service
            </button>

            <button
              type="button"
              onClick={() => {
                onToggle(service.id);
                setOpen(false);
              }}
            >
              <Power size={14} />
              {service.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const Services = () => {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const activeCount = services.filter(
    (service) => service.status === "Active"
  ).length;

  const inactiveCount = services.filter(
    (service) => service.status === "Inactive"
  ).length;

  const totalPackages = services.reduce(
    (total, service) => total + service.packages,
    0
  );

  const totalIntegrations = services.reduce(
    (total, service) => total + service.integrations,
    0
  );

  const filteredServices = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        !searchText ||
        service.name.toLowerCase().includes(searchText) ||
        service.code.toLowerCase().includes(searchText) ||
        service.description.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const openCreateModal = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingService(null);
  };

  const saveService = (formData) => {
    if (editingService) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingService.id
            ? { ...service, ...formData }
            : service
        )
      );
    } else {
      const duplicate = services.some(
        (service) =>
          service.code.toLowerCase() === formData.code.toLowerCase() ||
          service.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (duplicate) {
        window.alert("A service with this name or code already exists.");
        return;
      }

      setServices((current) => [
        ...current,
        {
          id: `SRV-${String(current.length + 1).padStart(3, "0")}`,
          ...formData,
          packages: 0,
          integrations: 0,
          status: "Active",
          createdAt: new Date().toISOString().slice(0, 10)
        }
      ]);
    }

    closeModal();
  };

  const toggleServiceStatus = (id) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              status:
                service.status === "Active" ? "Inactive" : "Active"
            }
          : service
      )
    );
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="services-page">

      {/* Page heading */}
      <div className="services-heading">
        <div>
          <h1>Services</h1>
          <p>Manage the service categories available on ServiceHub.</p>
        </div>

        <button
          type="button"
          className="add-service-btn"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {/* Summary cards */}
      <section className="services-summary-grid">

        <div className="services-summary-card">
          <div className="services-summary-icon blue">
            <Layers size={21} />
          </div>
          <h3>{services.length}</h3>
          <p>Total Services</p>
          <span>All registered service categories</span>
        </div>

        <div className="services-summary-card">
          <div className="services-summary-icon green">
            <CheckCircle2 size={21} />
          </div>
          <h3>{activeCount}</h3>
          <p>Active Services</p>
          <span>Available for configuration</span>
        </div>

        <div className="services-summary-card">
          <div className="services-summary-icon orange">
            <XCircle size={21} />
          </div>
          <h3>{inactiveCount}</h3>
          <p>Inactive Services</p>
          <span>Currently unavailable</span>
        </div>

        <div className="services-summary-card">
          <div className="services-summary-icon purple">
            <Package size={21} />
          </div>
          <h3>{totalPackages}</h3>
          <p>Associated Packages</p>
          <span>Across all listed services</span>
        </div>

      </section>

      {/* Service category cards */}
      <section className="service-category-section">
        <div className="service-section-heading">
          <div>
            <h2>Service Categories</h2>
            <p>Overview of the services available in your platform.</p>
          </div>

          <span className="service-section-count">
            {services.length} Services
          </span>
        </div>

        <div className="service-category-grid">
          {services.map((service) => (
            <div className="service-category-card" key={service.id}>
              <div className="service-category-top">
                <ServiceIcon code={service.code} />
                <ServiceStatus status={service.status} />
              </div>

              <h3>{service.name}</h3>
              <span className="service-category-code">
                {service.code}
              </span>

              <p>{service.description || "No description provided."}</p>

              <div className="service-category-metrics">
                <div>
                  <Package size={16} />
                  <strong>{service.packages}</strong>
                  <span>Packages</span>
                </div>

                <div>
                  <Plug size={16} />
                  <strong>{service.integrations}</strong>
                  <span>Integrations</span>
                </div>
              </div>

              <div className="service-category-footer">
                <span>Created {service.createdAt}</span>

                <button
                  type="button"
                  onClick={() => openEditModal(service)}
                >
                  Edit <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services table */}
      <section className="services-records-panel">

        <div className="service-section-heading">
          <div>
            <h2>All Services</h2>
            <p>View and manage all registered services.</p>
          </div>
        </div>

        <div className="services-toolbar">
          <div className="services-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search service name or code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="services-toolbar-actions">
            <div className="services-status-filter">
              <Filter size={15} />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter services by status"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              type="button"
              className="services-reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="services-table-wrapper">
          <table className="services-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Service Code</th>
                <th>Description</th>
                <th>Packages</th>
                <th>Integrations</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="services-table-name">
                      <ServiceIcon code={service.code} />
                      <strong>{service.name}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="service-code-label">
                      {service.code}
                    </span>
                  </td>

                  <td>
                    <span className="service-table-description">
                      {service.description || "-"}
                    </span>
                  </td>

                  <td>{service.packages}</td>
                  <td>{service.integrations}</td>
                  <td>{service.createdAt}</td>

                  <td>
                    <ServiceStatus status={service.status} />
                  </td>

                  <td>
                    <ServiceRowActions
                      service={service}
                      onEdit={openEditModal}
                      onToggle={toggleServiceStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredServices.length === 0 && (
            <div className="services-empty-state">
              <Layers size={29} />
              <h3>No services found</h3>
              <p>Try changing your search or status filter.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="services-table-footer">
          Showing {filteredServices.length} of {services.length} services
        </div>

      </section>

      {modalOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={closeModal}
          onSave={saveService}
        />
      )}

    </div>
  );
}

export default Services;
