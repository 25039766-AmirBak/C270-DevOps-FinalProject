import React from "react";

function FoodRequest({ donation }) {

  const requestFood = () => {
    alert(`Request sent for ${donation.foodName}`);
  };

  return (
    <button onClick={requestFood}>
      Request Food
    </button>
  );
}

export default FoodRequest;