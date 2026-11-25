
import axios from "axios";
import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./paymentModal.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PaymentModal = ({ price, plans = [], onClose }) => {
    const {
        services = [],
        baseAmount = 0,
        gstRate = 0,
        gstAmount = 0,
        totalPrice = 0
    } = price || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    // Format currency
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(Number(amount) || 0);

    // Match selected services with active plans.
    // This variable is available to both JSX and invoice generation.
    const selectedPlanDetails = services
        .map((service) => {
            const selectedService =
                typeof service === "string"
                    ? service
                    : service?.plan;

            if (!selectedService) {
                return null;
            }

            return plans.find(
                (plan) =>
                    plan.is_active &&
                    plan.service_name?.toLowerCase() ===
                        selectedService.toLowerCase()
            );
        })
        .filter(Boolean);

    // Check whether every selected service has a matching active plan.
    const missingServices = services.filter((service) => {
        const selectedService =
            typeof service === "string"
                ? service
                : service?.plan;

        return !plans.some(
            (plan) =>
                plan.is_active &&
                plan.service_name?.toLowerCase() ===
                    selectedService?.toLowerCase()
        );
    });

    // Handle subscription creation
    const handleSubscription = async () => {
        try {
            setLoading(true);
            setError("");

            if (!services.length) {
                throw new Error("Please select at least one service.");
            }

            if (missingServices.length > 0) {
                throw new Error(
                    "Some selected services do not have an active plan. Please review your selection."
                );
            }

            const response = await axios.post(
                `${API_URL}/api/provider/subscription`,
                price,
                {
                    withCredentials: true
                }
            );

            console.log("Subscription response:", response);

            if (response.data.status !== 201) {
                console.log("entering to if creation")
                throw new Error(
                    response.data?.message ||
                    "Failed to create subscription."
                );
            }

            console.log(
                "Subscription created:",
                response.data.message
            );

            // Display success screen inside the same modal.
            setSuccess(true);

            localStorage.setItem(
                "paymentStatus",
                JSON.stringify(true)
            );

            setTimeout(()=>{
                 navigate("/dashboard");
            },2000)



        } catch (error) {
            console.error("Subscription error:", error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to create subscription."
            );

        } finally {
            setLoading(false);
        }
    };

    // Generate invoice
    const handleDownloadInvoice = () => {
        if (missingServices.length > 0) {
            setError(
                "Cannot generate invoice because some selected services have no active plan."
            );
            return;
        }

        const doc = new jsPDF();

        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceDate = new Date().toLocaleDateString("en-IN");

        // Header
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("ServiceHub", 14, 20);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Subscription Invoice", 14, 29);

        // Invoice details
        doc.setFontSize(10);
        doc.text(`Invoice Number: ${invoiceNumber}`, 14, 45);
        doc.text(`Invoice Date: ${invoiceDate}`, 14, 52);

        // Selected services
        const tableRows = selectedPlanDetails.map((plan) => [
            plan.service_name.toUpperCase(),
            "INR " + Number(plan.monthly_price).toFixed(2)
        ]);

        autoTable(doc, {
            startY: 65,
            head: [["Service", "Monthly Price"]],
            body: tableRows,
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [49, 94, 231]
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { halign: "right" }
            }
        });

        // Price summary
        const finalY = doc.lastAutoTable.finalY + 15;

        autoTable(doc, {
            startY: finalY,
            body: [
                [
                    "Base Amount",
                    "INR " + Number(baseAmount).toFixed(2)
                ],
                [
                    `GST (${gstRate}%)`,
                    "INR " + Number(gstAmount).toFixed(2)
                ],
                [
                    "Total Amount",
                    "INR " + Number(totalPrice).toFixed(2)
                ]
            ],
            theme: "plain",
            styles: {
                fontSize: 11,
                cellPadding: 4
            },
            columnStyles: {
                0: { cellWidth: 110 },
                1: { halign: "right" }
            },
            didParseCell: (data) => {
                if (data.row.index === 2) {
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.fontSize = 13;
                }
            }
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(120);

        doc.text(
            "Thank you for choosing ServiceHub!",
            105,
            280,
            { align: "center" }
        );

        doc.save(`${invoiceNumber}.pdf`);
    };

    return (
        <div className="payment-overlay">
            <div className="payment-modal">

                {success ? (

                    /* SUCCESS STATE */

                    <div className="payment-success">

                        <div className="success-icon">
                            <span>✓</span>
                        </div>

                        <h3>Subscription Created Successfully!</h3>

                        <p>
                            Your subscription has been created successfully.
                        </p>

                        <button
                            className="payment-done-button"
                            onClick={onClose}
                        >
                            Done
                        </button>

                    </div>

                ) : (

                    /* PAYMENT DETAILS STATE */

                    <>
                        {/* Header */}

                        <div className="payment-header">

                            <div>
                                <span className="payment-eyebrow">
                                    SUBSCRIPTION SUMMARY
                                </span>

                                <h2>Complete Payment</h2>

                                <p>
                                    Review your subscription details before proceeding.
                                </p>
                            </div>

                            <button
                                className="payment-close"
                                onClick={onClose}
                                disabled={loading}
                            >
                                ×
                            </button>

                        </div>

                        {/* Payment details */}

                        <div className="payment-body">

                            {/* Selected services */}

                            <div className="payment-section-title">
                                <h3>Selected Services</h3>

                                <span>
                                    {selectedPlanDetails.length} Services
                                </span>
                            </div>

                            <div className="payment-services">

                                {selectedPlanDetails.map((plan) => (

                                    <div
                                        className="payment-service"
                                        key={plan.service_id}
                                    >
                                        <div className="payment-service-icon">
                                            {plan.service_name
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>

                                        <div className="payment-service-info">

                                            <strong>
                                                {plan.service_name.toUpperCase()}
                                            </strong>

                                            <span>
                                                Monthly Subscription
                                            </span>

                                        </div>

                                        <strong>
                                            {formatCurrency(plan.monthly_price)}
                                        </strong>

                                    </div>

                                ))}

                            </div>

                            {/* Price summary */}

                            <div className="payment-summary">

                                <div className="payment-summary-row">
                                    <span>Base Amount</span>

                                    <span>
                                        {formatCurrency(baseAmount)}
                                    </span>
                                </div>

                                <div className="payment-summary-row">
                                    <span>GST ({gstRate}%)</span>

                                    <span>
                                        {formatCurrency(gstAmount)}
                                    </span>
                                </div>

                                <div className="payment-total-row">

                                    <div>
                                        <strong>Total Payable</strong>

                                        <span>
                                            Including applicable taxes
                                        </span>
                                    </div>

                                    <strong className="payment-total-amount">
                                        {formatCurrency(totalPrice)}
                                    </strong>

                                </div>

                            </div>

                            {/* Error message */}

                            {error && (
                                <div className="payment-error">
                                    {error}
                                </div>
                            )}

                        </div>

                        {/* Footer buttons */}

                        <div className="payment-footer">

                            <button
                                className="payment-invoice-button"
                                onClick={handleDownloadInvoice}
                                disabled={loading || missingServices.length > 0}
                            >
                                Download Invoice
                            </button>

                            <button
                                className="payment-submit-button"
                                onClick={handleSubscription}
                                disabled={loading || missingServices.length > 0}
                            >

                                {loading ? (
                                    <>
                                        <span className="payment-spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    "Complete Payment"
                                )}

                            </button>

                        </div>

                        <p className="payment-secure-note">
                            Review your subscription and pricing before proceeding.
                        </p>

                    </>

                )}

            </div>
        </div>
    );
};

export default PaymentModal;
