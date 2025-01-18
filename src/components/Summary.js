import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Summary.css";

const Summary = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://ledegermanagement-backend.onrender.com/api/transactions")
      .then((response) => {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      });
  }, []);

  const handleFilter = (type) => {
    if (type === "All") {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) => transaction.type === type
      );
      setFilteredTransactions(filtered);
    }
  };

  const calculateAmount = (transaction) => {
    if (
      transaction.type === "Sell Tobacco" ||
      transaction.type === "Sell Chenega" ||
      transaction.type === "Sell Tobacco Nursery"
    ) {
      return transaction.quantity * transaction.price;
    }
    return transaction.amount;
  };

  const calculateTotalAmount = () => {
    return filteredTransactions.reduce(
      (total, transaction) => total + calculateAmount(transaction),
      0
    );
  };

  const calculateSellSummary = () => {
    let totalQuantity = 0;
    let totalPrice = 0;
    filteredTransactions.forEach((transaction) => {
      if (
        [
          "Sell Tobacco",
          "Sell Chenega",
          "Sell Tobacco Nursery",
          "Sell Miripa",
        ].includes(transaction.type)
      ) {
        totalQuantity += transaction.quantity;
        totalPrice += calculateAmount(transaction);
      }
    });
    const averagePrice = totalQuantity ? totalPrice / totalQuantity : 0;
    return { totalQuantity, totalPrice, averagePrice };
  };

  const calculateTotalKarra = () => {
    return filteredTransactions.reduce((total, transaction) => {
      if (transaction.type === "Barnee Karra Tobacco") {
        total += transaction.numberOfKarra || 0;
      }
      return total;
    }, 0);
  };

  const getColumns = (transactionType) => {
    switch (transactionType) {
      case "Barnee Karra Tobacco":
        return (
          <>
            <th>SNo</th>
            <th>Date</th>
            <th>Description</th>
            <th>Barn Type</th>
            <th>Number of Karra</th>
          </>
        );
      case "Sell Tobacco":
      case "Sell Chenega":
      case "Sell Tobacco Nursery":
      case "Sell Miripa":
        return (
          <>
            <th>SNo</th>
            <th>Date</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Amount</th>
          </>
        );
      case "Tobacco Mastri":
      case "Cows Adduluu Araka":
        return (
          <>
            <th>SNo</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </>
        );
      case "Chenega Investment":
      case "Tobacco Investment":
      case "Tobacco Nursery Investment":
        return (
          <>
            <th>SNo</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="summary-container">
      <h2>Transaction Summary</h2>

      <div className="filter-buttons">
        <button onClick={() => handleFilter("Tobacco Mastri")}>Tobacco Mastri</button>
        <button onClick={() => handleFilter("Cows Adduluu Araka")}>Cows Adduluu Araka</button>
        <button onClick={() => handleFilter("Tobacco Investment")}>Tobacco Investment</button>
        <button onClick={() => handleFilter("Tobacco Nursery Investment")}>Tobacco Nursery Investment</button>
        <button onClick={() => handleFilter("Chenega Investment")}>Chenega Investment</button>
        <button onClick={() => handleFilter("Sell Tobacco")}>Sell Tobacco</button>
        <button onClick={() => handleFilter("Sell Chenega")}>Sell Chenega</button>
        <button onClick={() => handleFilter("Sell Tobacco Nursery")}>Sell Tobacco Nursery</button>
        <button onClick={() => handleFilter("Barnee Karra Tobacco")}>Barnee Karra Tobacco</button>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <>
          {filteredTransactions.length > 0 ? (
            <table className="transaction-table">
              <thead>
                <tr>{getColumns(filteredTransactions[0]?.type)}</tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    {transaction.type === "Barnee Karra Tobacco" && (
                      <>
                        <td>{transaction.barnType}</td>
                        <td>{transaction.numberOfKarra}</td>
                      </>
                    )}
                    {[
                      "Sell Tobacco",
                      "Sell Chenega",
                      "Sell Tobacco Nursery",
                      "Sell Miripa",
                    ].includes(transaction.type) && (
                      <>
                        <td>{transaction.quantity}</td>
                        <td>{transaction.price}</td>
                        <td>{calculateAmount(transaction)}</td>
                      </>
                    )}
                    {["Tobacco Mastri", "Cows Adduluu Araka"].includes(transaction.type) && (
                      <>
                        <td>{transaction.amount}</td>
                      </>
                    )}
                    {["Chenega Investment", "Tobacco Investment", "Tobacco Nursery Investment"].includes(transaction.type) && (
                      <>
                        <td>{transaction.amount}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions available for the selected filter.</p>
          )}

          <div className="total-summary">
            {["Chenega Investment", "Tobacco Investment", "Tobacco Nursery Investment"].includes(filteredTransactions[0]?.type) && (
              <p>Total Investment: ₹{calculateTotalAmount()}</p>
            )}

            {["Tobacco Mastri", "Cows Adduluu Araka"].includes(filteredTransactions[0]?.type) && (
              <p>Total Sum of Amount: ₹{calculateTotalAmount()}</p>
            )}

            {["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery", "Sell Miripa"].includes(filteredTransactions[0]?.type) && (
              <>
                <p>Total Quantity: {calculateSellSummary().totalQuantity}</p>
                <p>Total Price: ₹{calculateSellSummary().totalPrice}</p>
                <p>Average Price: ₹{calculateSellSummary().averagePrice}</p>
              </>
            )}

            {filteredTransactions[0]?.type === "Barnee Karra Tobacco" && (
              <p>Total Karra: {calculateTotalKarra()}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Summary;
