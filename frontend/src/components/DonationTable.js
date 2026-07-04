import React from "react";

const DonationTable = ({ filteredDonations, setMessage }) => {

    const handleRequest = (item) => {
        setMessage(`Request submitted successfully for ${item.foodName}!`);
        alert(`Food request submitted for ${item.foodName}`);
    };

    return (
        <div style={{ marginTop: "40px" }}>

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#2e7d32"
                }}
            >
                Available Food Donations
            </h2>

            {filteredDonations.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                    No food donations available.
                </p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "20px"
                    }}
                >
                    {filteredDonations.map((item) => (

                        <div
                            key={item._id}
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                padding: "20px",
                                borderTop: "5px solid #2e7d32"
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    color: "#2e7d32"
                                }}
                            >
                                {item.foodName}
                            </h3>

                            <p>
                                <strong>Quantity:</strong> {item.quantity}
                            </p>

                            <p>
                                <strong>Location:</strong> {item.location}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    style={{
                                        color:
                                            item.status === "Available"
                                                ? "green"
                                                : "red",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {item.status}
                                </span>
                            </p>

                            <button
                                disabled={item.status !== "Available"}
                                onClick={() => handleRequest(item)}
                                style={{
                                    width: "100%",
                                    marginTop: "15px",
                                    backgroundColor:
                                        item.status === "Available"
                                            ? "#ff9800"
                                            : "#bdbdbd",
                                    color: "white",
                                    border: "none",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    cursor:
                                        item.status === "Available"
                                            ? "pointer"
                                            : "not-allowed"
                                }}
                            >
                                {item.status === "Available"
                                    ? "Request Food"
                                    : "Unavailable"}
                            </button>

                        </div>

                    ))}
                </div>
            )}
        </div>
    );
};

export default DonationTable;