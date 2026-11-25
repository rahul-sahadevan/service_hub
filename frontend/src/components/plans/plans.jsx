
import axios from "axios";
import { useEffect, useState } from "react";
import { Tv, MonitorPlay, Wifi } from "lucide-react";
import "./plans.css";
import PaymentModal from "../paymentModal/paymentModel";

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState(()=>{
        try{
            const savedPlans = localStorage.getItem("savedPlans")
            return savedPlans ? JSON.parse(savedPlans) : []
        }
        catch(error){
            console.log("failed to get selected plans fom local storage",error)
            return []
        }
    });
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [price, setPrice] = useState(null);
    const [error, setError] = useState("");
    const [paymentModal,setPaymentModal] = useState(()=>{
        const showPaymentModal = localStorage.getItem("showPaymentModal")
        console.log(showPaymentModal)
        return showPaymentModal ? JSON.parse(showPaymentModal) : false
    })
    console.log(paymentModal)
    const serviceDescriptions = {
        IPTV: "Manage and distribute television services to your subscribers.",
        OTT: "Deliver digital streaming and entertainment services.",
        INTERNET: "Manage broadband plans and internet connectivity."
    };

    const serviceIcons = {
        IPTV: Tv,
        OTT: MonitorPlay,
        INTERNET: Wifi
    };

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch available plans
    useEffect(() => {
        const getPlans = async () => {
            try {
                setPlansLoading(true);

                const response = await axios.get(
                    `${API_URL}/api/plans/get-plans`,
                    { withCredentials: true }
                );

                const { status, data } = response.data;

                if (status !== 200) {
                    setError("Unable to load plans. Please try again.");
                    return;
                }

                setPlans(data);
            } catch (error) {
                console.error("Error fetching plans:", error);
                setError("Unable to load plans. Please try again.");
            } finally {
                setPlansLoading(false);
            }
        };

        getPlans();
    }, [API_URL]);

    // Toggle a service selection
    const handlePlanSelection = (plan) => {
        setSelectedPlans((prevSelectedPlans) => {
            const isSelected = prevSelectedPlans.includes(
                plan.service_name
            );

            if (isSelected) {
                return prevSelectedPlans.filter(
                    (serviceName) =>
                        serviceName !== plan.service_name
                );
            }

            return [...prevSelectedPlans, plan.service_name];
        });
    };
  

    // Calculate price whenever the selected services change
    useEffect(() => {
        let isCurrentRequest = true;

        // add the selected item to local storage
        localStorage.setItem("savedPlans",JSON.stringify(selectedPlans))

        const calculatePrice = async () => {
            if (selectedPlans.length === 0) {
                setPrice(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await axios.post(
                    `${API_URL}/api/provider/price_cal`,
                    { plans: selectedPlans },
                    { withCredentials: true }
                );

                if (!isCurrentRequest) return;

                if (response.data.status !== 200) {
                    setError("Unable to calculate the price.");
                    setPrice(null);
                    return;
                }

                setPrice(response.data.data);
            } catch (error) {
                if (!isCurrentRequest) return;

                console.error("Error calculating price:", error);
                setError("Unable to calculate the price. Please try again.");
                setPrice(null);
            } finally {
                if (isCurrentRequest) {
                    setLoading(false);
                }
            }
        };

        calculatePrice();

        return () => {
            isCurrentRequest = false;
        };
    }, [selectedPlans, API_URL]);

    const isSelected = (serviceName) =>
        selectedPlans.includes(serviceName);

    return (
        <div className="plans-page">
            <div className="plans-header">
                <span className="plans-eyebrow">SERVICEHUB PROVIDER PORTAL</span>
                <h1>Choose your services</h1>
                <p>
                    Select the services you want to activate.
                    Review your subscription before proceeding to payment.
                </p>
            </div>

            {error && (
                <div className="plans-error">
                    {error}
                </div>
            )}

            {plansLoading ? (
                <div className="plans-loading">
                    Loading available services...
                </div>
            ) : (
                <div className="plans-layout">
                    <section className="plans-section">
                        <div className="section-heading">
                            <h2>Available services</h2>
                            <span>
                                {selectedPlans.length} selected
                            </span>
                        </div>

                        <div className="plans-grid">
                            {plans.map((plan) => {
                                const selected = isSelected(
                                    plan.service_name
                                );
                                const ServiceIcon =
                                    serviceIcons[plan.service_name.toUpperCase()] || Tv;

                                return (
                                    <button
                                        type="button"
                                        key={plan.plan_id ?? plan.service_name}
                                        className={`service-card ${
                                            selected ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                            handlePlanSelection(plan)
                                        }
                                        aria-pressed={selected}
                                    >
                                        <div className="service-card-top">
                                            <div className="service-icon">
                                                <ServiceIcon size={25} strokeWidth={1.8} />
                                            </div>

                                            <span
                                                className={`selection-indicator ${
                                                    selected ? "checked" : ""
                                                }`}
                                            >
                                                {selected ? "✓" : "+"}
                                            </span>
                                        </div>

                                        <div className="service-card-content">
                                            <h3>
                                                {plan.service_name.toUpperCase()}
                                            </h3>

                                            <p>
                                                {plan.description ||
                                                   serviceDescriptions[(plan.service_name).toUpperCase(
                                                   )] ||
                                                   "Explore this service and its subscription benefits."}
                                            </p>
                                        </div>

                                        <div className="service-card-price">
                                            <strong>
                                                ₹{Number(
                                                    plan.monthly_price
                                                ).toFixed(2)}
                                            </strong>
                                            <span>/ month</span>
                                        </div>

                                        <div className="service-card-footer">
                                            {selected
                                                ? "Selected"
                                                : "Select service"}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <aside className="order-summary">
                        <div className="summary-header">
                            <div>
                                <span className="summary-eyebrow">
                                    YOUR SUBSCRIPTION
                                </span>
                                <h2>Order summary</h2>
                            </div>

                            <span className="summary-count">
                                {selectedPlans.length}
                            </span>
                        </div>

                        {selectedPlans.length === 0 ? (
                            <div className="summary-empty">
                                <div className="empty-icon">＋</div>
                                <h3>No services selected</h3>
                                <p>
                                    Choose a service to see your subscription
                                    price here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="summary-services">
                                    {selectedPlans.map((serviceName) => (
                                        <div
                                            className="summary-service"
                                            key={serviceName}
                                        >
                                            <div>
                                                <span className="summary-service-name">
                                                    {serviceName.toUpperCase()}
                                                </span>
                                                <span className="summary-service-period">
                                                    30-day subscription
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-service"
                                                onClick={() =>
                                                    setSelectedPlans((prev) =>
                                                        prev.filter(
                                                            (name) =>
                                                                name !==
                                                                serviceName
                                                        )
                                                    )
                                                }
                                                aria-label={`Remove ${serviceName}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-pricing">
                                    <div className="price-row">
                                        <span>Base price</span>
                                        <strong>
                                            {price
                                                ? `₹${Number(
                                                      price.baseAmount
                                                  ).toFixed(2)}`
                                                : "—"}
                                        </strong>
                                    </div>

                                    <div className="price-row">
                                        <span>
                                            GST
                                            {price
                                                ? ` (${price.gstRate}%)`
                                                : ""}
                                        </span>
                                        <strong>
                                            {price
                                                ? `₹${Number(
                                                      price.gstAmount
                                                  ).toFixed(2)}`
                                                : "—"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <div>
                                        <span>Total payable</span>
                                        <small>For 30 days</small>
                                    </div>

                                    <strong>
                                        {price
                                            ? `₹${Number(
                                                  price.totalPrice
                                              ).toFixed(2)}`
                                            : "—"}
                                    </strong>
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            className="payment-button"
                            disabled={
                                selectedPlans.length === 0 ||
                                loading ||
                                !price
                            }
                            onClick={() => setPaymentModal(()=>{
                                localStorage.setItem("showPaymentModal",!paymentModal)
                                return !paymentModal
                            })}
                        >
                            {loading
                                ? "Calculating price..."
                                : "Continue to payment"}
                            {!loading && <span>→</span>}
                        </button>

                        <p className="summary-note">
                            Final pricing is calculated by the server.
                            Your subscription is valid for 30 days.
                        </p>
                    </aside>
                    {
                        paymentModal && (
                            <PaymentModal price={price} plans={plans} onClose={() => {
                                localStorage.setItem("showPaymentModal",JSON.stringify(false))
                                setPaymentModal(false)
                            }}/>
                        )
                    }
                </div>
            )}
        </div>
    );
};

export default Plans;
