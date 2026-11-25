
import { useMemo, useState } from "react";

import {
  Package,
  Plus,
  Search,
  Tv,
  Radio,
  Wifi,
  CheckCircle2,
  XCircle,
  Layers,
  MoreVertical,
  Pencil,
  Power,
  X,
  Filter,
  CalendarDays,
  IndianRupee
} from "lucide-react";

import "./packages.css";

// Temporary sample data.
// Replace this with the Packages API response later.
const initialPackages = [
  {
    id: "PKG-001",
    name: "Basic IPTV",
    code: "IPTV-BASIC",
    service: "IPTV",
    description: "Basic IPTV subscription with standard channels.",
    price: 199,
    validity: 30,
    status: "Active",
    createdAt: "2026-08-12"
  },
  {
    id: "PKG-002",
    name: "Premium IPTV",
    code: "IPTV-PREMIUM",
    service: "IPTV",
    description: "Premium IPTV subscription with an extended channel list.",
    price: 499,
    validity: 30,
    status: "Active",
    createdAt: "2026-08-14"
  },
  {
    id: "PKG-003",
    name: "Standard OTT",
    code: "OTT-STANDARD",
    service: "OTT",
    description: "Standard OTT streaming subscription.",
    price: 299,
    validity: 30,
    status: "Active",
    createdAt: "2026-08-16"
  },
  {
    id: "PKG-004",
    name: "Family OTT",
    code: "OTT-FAMILY",
    service: "OTT",
    description: "OTT subscription for multiple household users.",
    price: 599,
    validity: 30,
    status: "Active",
    createdAt: "2026-08-18"
  },
  {
    id: "PKG-005",
    name: "50 Mbps",
    code: "NET-50",
    service: "INTERNET",
    description: "Internet plan with speeds up to 50 Mbps.",
    price: 399,
    validity: 30,
    status: "Active",
    createdAt: "2026-08-20"
  },
  {
    id: "PKG-006",
    name: "100 Mbps",
    code: "NET-100",
    service: "INTERNET",
    description: "Internet plan with speeds up to 100 Mbps.",
    price: 699,
    validity: 30,
    status: "Inactive",
    createdAt: "2026-08-22"
  }
];

// These should eventually come from your Services API.
const availableServices = [
  { name: "IPTV", code: "IPTV" },
  { name: "OTT", code: "OTT" },
  { name: "Internet", code: "INTERNET" }
];

const serviceIcons = {
  IPTV: Tv,
  OTT: Radio,
  INTERNET: Wifi
};

const ServiceIcon = ({ service }) => {
  const Icon = serviceIcons[service] || Layers;

  return (
    <div className={`package-service-icon ${service.toLowerCase()}`}>
      <Icon size={18} />
    </div>
  );
}

const PackageStatus = ({ status }) => {
  return (
    <span className={`package-status ${status.toLowerCase()}`}>
      <span className="package-status-dot" />
      {status}
    </span>
  );
}

const PackageFormModal = ({ packageData, onClose, onSave }) => {
  const [name, setName] = useState(packageData?.name || "");
  const [code, setCode] = useState(packageData?.code || "");
  const [packageId,setPackageId] = useState(packageData?.id || "");
  const [service, setService] = useState(
    packageData?.service || ""
  );
  const [description, setDescription] = useState(
    packageData?.description || ""
  );
  const [price, setPrice] = useState(
    packageData?.price?.toString() || ""
  );
  const [validity, setValidity] = useState(
    packageData?.validity?.toString() || "30"
  );
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const parsedPrice = Number(price);
    const parsedValidity = Number(validity);

    if (!trimmedName || !trimmedCode || !service) {
      setError("Package name, code and service are required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid package price.");
      return;
    }

    if (
      !Number.isInteger(parsedValidity) ||
      parsedValidity <= 0
    ) {
      setError("Validity must be a positive number of days.");
      return;
    }

    onSave({
      name: trimmedName,
      code: trimmedCode,
      service,
      description: description.trim(),
      price: parsedPrice,
      validity: parsedValidity
    });
  };

  return (
    <div className="package-modal-overlay" onMouseDown={onClose}>
      <div
        className="package-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="package-modal-header">
          <div>
            <h2 id="package-modal-title">
              {packageData ? "Edit Package" : "Add New Package"}
            </h2>
            <p>
              {packageData
                ? "Update the package details."
                : "Create a package under an existing service."}
            </p>
          </div>

          <button
            type="button"
            className="package-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="package-form-grid">
            <div className="package-form-group">
              <label htmlFor="package-service">Service *</label>
              <select
                id="package-service"
                value={service}
                onChange={(event) => setService(event.target.value)}
                required
              >
                <option value="">Select service</option>
                {availableServices.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="package-form-group">
              <label htmlFor="package-name">Package Name *</label>
              <input
                id="package-name"
                type="text"
                placeholder="Example: Premium IPTV"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
              />
            </div>

            <div className="package-form-group">
              <label htmlFor="package-code">Package Code *</label>
              <input
                id="package-code"
                type="text"
                placeholder="Example: IPTV-PREMIUM"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                maxLength={40}
                required
              />
            </div>

            <div className="package-form-group">
              <label htmlFor="package-price">Price (₹) *</label>
              <div className="package-input-with-icon">
                <IndianRupee size={15} />
                <input
                  id="package-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="499.00"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="package-form-group">
              <label htmlFor="package-code">Package ID / Bundle ID</label>
              <input
                id="package-code"
                type="text"
                placeholder="Example: 1234567890"
                value={packageId}
                onChange={(event) =>
                  setPackageId(event.target.value)
                }
                maxLength={40}
                required
              />
            </div>

            <div className="package-form-group">
              <label htmlFor="package-validity">Validity (Days) *</label>
              <div className="package-input-with-icon">
                <CalendarDays size={15} />
                <input
                  id="package-validity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="30"
                  value={validity}
                  onChange={(event) => setValidity(event.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="package-form-group">
            <label htmlFor="package-description">Description</label>
            <textarea
              id="package-description"
              placeholder="Enter a short description about this package..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={250}
            />
          </div>

          {error && (
            <div className="package-form-error">{error}</div>
          )}

          <div className="package-modal-actions">
            <button
              type="button"
              className="package-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="package-save-btn">
              {packageData ? "Save Changes" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PackageRowActions = ({ packageData, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="package-row-actions">
      <button
        type="button"
        className="package-action-trigger"
        aria-label={`Actions for ${packageData.name}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="package-menu-backdrop"
            aria-label="Close package actions"
            onClick={() => setOpen(false)}
          />

          <div className="package-action-menu">
            <button
              type="button"
              onClick={() => {
                onEdit(packageData);
                setOpen(false);
              }}
            >
              <Pencil size={14} />
              Edit Package
            </button>

            <button
              type="button"
              onClick={() => {
                onToggle(packageData.id);
                setOpen(false);
              }}
            >
              <Power size={14} />
              {packageData.status === "Active"
                ? "Deactivate"
                : "Activate"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const Packages = () => {
  const [packages, setPackages] = useState(initialPackages);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const activeCount = packages.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = packages.filter(
    (item) => item.status === "Inactive"
  ).length;

  const totalValue = packages
    .filter((item) => item.status === "Active")
    .reduce((total, item) => total + item.price, 0);

  const filteredPackages = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return packages.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText) ||
        item.code.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText);

      const matchesService =
        serviceFilter === "All" || item.service === serviceFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [packages, search, serviceFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPackage(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPackage(null);
  };

  const savePackage = (formData) => {
    const duplicate = packages.some(
      (item) =>
        item.id !== editingPackage?.id &&
        (
          item.code.toLowerCase() === formData.code.toLowerCase() ||
          (
            item.service === formData.service &&
            item.name.toLowerCase() === formData.name.toLowerCase()
          )
        )
    );

    if (duplicate) {
      window.alert(
        "This package code already exists, or this package name is already used under the selected service."
      );
      return;
    }

    if (editingPackage) {
      setPackages((current) =>
        current.map((item) =>
          item.id === editingPackage.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      setPackages((current) => [
        ...current,
        {
          id: `PKG-${String(current.length + 1).padStart(3, "0")}`,
          ...formData,
          status: "Active",
          createdAt: new Date().toISOString().slice(0, 10)
        }
      ]);
    }

    closeModal();
  };

  const togglePackageStatus = (id) => {
    setPackages((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active"
            }
          : item
      )
    );
  };

  const resetFilters = () => {
    setSearch("");
    setServiceFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="packages-page">

      {/* Page heading */}
      <div className="packages-heading">
        <div>
          <h1>Packages</h1>
          <p>
            Create and manage packages under your available services.
          </p>
        </div>

        <button
          type="button"
          className="add-package-btn"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Add Package
        </button>
      </div>

      {/* Summary cards */}
      <section className="packages-summary-grid">

        <div className="packages-summary-card">
          <div className="packages-summary-icon blue">
            <Package size={21} />
          </div>
          <h3>{packages.length}</h3>
          <p>Total Packages</p>
          <span>Across all services</span>
        </div>

        <div className="packages-summary-card">
          <div className="packages-summary-icon green">
            <CheckCircle2 size={21} />
          </div>
          <h3>{activeCount}</h3>
          <p>Active Packages</p>
          <span>Available for subscriptions</span>
        </div>

        <div className="packages-summary-card">
          <div className="packages-summary-icon orange">
            <XCircle size={21} />
          </div>
          <h3>{inactiveCount}</h3>
          <p>Inactive Packages</p>
          <span>Unavailable for new subscriptions</span>
        </div>

        <div className="packages-summary-card">
          <div className="packages-summary-icon purple">
            <Layers size={21} />
          </div>
          <h3>{availableServices.length}</h3>
          <p>Services Covered</p>
          <span>Services with package categories</span>
        </div>

      </section>

      {/* Package overview cards */}
      <section className="package-overview-section">
        <div className="package-section-heading">
          <div>
            <h2>Packages by Service</h2>
            <p>Package distribution across your service categories.</p>
          </div>
        </div>

        <div className="package-overview-grid">
          {availableServices.map((service) => {
            const servicePackages = packages.filter(
              (item) => item.service === service.code
            );

            const serviceActiveCount = servicePackages.filter(
              (item) => item.status === "Active"
            ).length;

            return (
              <button
                type="button"
                className="package-overview-card"
                key={service.code}
                onClick={() => setServiceFilter(service.code)}
              >
                <div className="package-overview-top">
                  <ServiceIcon service={service.code} />
                  <span>{service.name}</span>
                </div>

                <div className="package-overview-count">
                  <strong>{servicePackages.length}</strong>
                  <span>Packages</span>
                </div>

                <div className="package-overview-footer">
                  <span>{serviceActiveCount} active</span>
                  <span>View packages →</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Package records */}
      <section className="packages-records-panel">

        <div className="package-section-heading">
          <div>
            <h2>All Packages</h2>
            <p>View and manage packages configured for each service.</p>
          </div>

          <span className="package-record-count">
            {filteredPackages.length} Packages
          </span>
        </div>

        {/* Search and filters */}
        <div className="packages-toolbar">
          <div className="packages-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search package name or code..."
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

          <div className="packages-toolbar-actions">
            <div className="package-filter-select">
              <Filter size={15} />
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                aria-label="Filter by service"
              >
                <option value="All">All Services</option>
                {availableServices.map((service) => (
                  <option key={service.code} value={service.code}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="package-status-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              type="button"
              className="packages-reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="packages-table-wrapper">
          <table className="packages-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Package Code</th>
                <th>Service</th>
                <th>Price</th>
                <th>Validity</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPackages.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="package-table-name">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="package-code-label">
                      {item.code}
                    </span>
                  </td>

                  <td>
                    <div className="package-service-cell">
                      <ServiceIcon service={item.service} />
                      <span>
                        {availableServices.find(
                          (service) => service.code === item.service
                        )?.name || item.service}
                      </span>
                    </div>
                  </td>

                  <td className="package-price">
                    ₹{item.price.toFixed(2)}
                  </td>

                  <td>{item.validity} days</td>
                  <td>{item.createdAt}</td>

                  <td>
                    <PackageStatus status={item.status} />
                  </td>

                  <td>
                    <PackageRowActions
                      packageData={item}
                      onEdit={openEditModal}
                      onToggle={togglePackageStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPackages.length === 0 && (
            <div className="packages-empty-state">
              <Package size={30} />
              <h3>No packages found</h3>
              <p>Try changing your search or filters.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="packages-table-footer">
          Showing {filteredPackages.length} of {packages.length} packages
        </div>

      </section>

      {modalOpen && (
        <PackageFormModal
          packageData={editingPackage}
          onClose={closeModal}
          onSave={savePackage}
        />
      )}

    </div>
  );
}

export default Packages;
