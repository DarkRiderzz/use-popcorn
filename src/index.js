import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarRating from "./StarRating";
import TextExpendeture from "./TextExpendeture";
import CurrencyConverter from "./CurrencyConverter";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />

    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating size={24} color="red" className="test" defaultRating={2} />
    <Test />\ */}

    {/* <TextExpendeture /> chllenge! done by myself😊 */}
    {/* <CurrencyConverter />  challnege2 */}
  </React.StrictMode>
);

function Test() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      <StarRating maxRating={6} onSetRating={setMovieRating} />
      <p> The rating value is {movieRating}</p>
    </div>
  );
}
