import React from "react";

function FoodRequest({ donation }) {
  const requestFood = () => {
    alert(`Request sent for ${donation.foodName}`);
  };

  return (
    <button className="btn btn-primary" onClick={requestFood}>
      Request Food
    </button>
  );
}

export default FoodRequest;