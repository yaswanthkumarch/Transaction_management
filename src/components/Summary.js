import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Summary.css";

const Summary = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("");  // State to track selected filter type

  // Fetch transactions from the API on page load but don't set them to filteredTransactions until a filter is applied
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);  // Set loading to true when fetching
        const response = await axios.get(
          "https://ledegermanagement-backend.onrender.com/api/transactions"
        );
        setTransactions(response.data);  // Store all transactions but don't display them yet
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);  // Set loading to false after fetching is done
      }
    };

    fetchTransactions();
  }, []);

  const handleFilter = (type) => {
    setSelectedType(type);  // Update the selected type
    setFilteredTransactions(
      transactions.filter((transaction) => transaction.type === type)  // Filter transactions based on the type
    );
  };

  const calculateAmount = (transaction) => {
    if (
      ["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery"].includes(
        transaction.type
      )
    ) {
      return transaction.quantity * transaction.price;
    }
    return transaction.amount || 0;
  };

  const calculateTotalAmount = () => {
    const total = filteredTransactions.reduce(
      (total, transaction) => total + calculateAmount(transaction),
      0
    );
    return total.toLocaleString("en-IN");  // Format the total with commas for better readability
  };

  const calculateSellSummary = () => {
    let totalQuantity = 0;
    let totalPrice = 0;

    filteredTransactions.forEach((transaction) => {
      if (
        ["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery", "Sell Miripa"].includes(
          transaction.type
        )
      ) {
        totalQuantity += transaction.quantity;
        totalPrice += calculateAmount(transaction);
      }
    });

    return {
      totalQuantity,
      totalPrice,
      averagePrice: totalQuantity ? (totalPrice / totalQuantity).toFixed(2) : 0,
    };
  };

  const calculateTotalKarra = () => {
    return filteredTransactions.reduce((total, transaction) => {
      if (transaction.type === "Barnee Karra Tobacco") {
        return total + (transaction.numberOfKarra || 0);
      }
      return total;
    }, 0);
  };

  const renderColumns = (transactionType) => {
    const columns = {
      "Barnee Karra Tobacco": (
        <>
          <th>SNo</th>
          <th>Date</th>
          <th>Description</th>
          <th>Barn Type</th>
          <th>Number of Karra</th>
        </>
      ),
      "Sell Transactions": (
        <>
          <th>SNo</th>
          <th>Date</th>
          <th>Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Amount</th>
        </>
      ),
      Default: (
        <>
          <th>SNo</th>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
        </>
      ),
    };

    if (
      ["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery", "Sell Miripa"].includes(
        transactionType
      )
    ) {
      return columns["Sell Transactions"];
    }

    return columns[transactionType] || columns.Default;
  };

  return (
    <div className="summary-container">
      <h2>Transaction Summary</h2>

      <div className="filter-buttons">
        {[
          "Tobacco Mastri",
          "Cows Adduluu Araka",
          "Tobacco Investment",
          "Tobacco Nursery Investment",
          "Chenega Investment",
          "Sell Tobacco",
          "Sell Chenega",
          "Sell Tobacco Nursery",
          "Barnee Karra Tobacco",
        ].map((type) => (
          <button key={type} onClick={() => handleFilter(type)}>
            {type}
          </button>
        ))}
      </div>

      {/* Conditional Rendering of Header based on the selected filter */}
      {selectedType && <h1>{selectedType} Ledger</h1>}  {/* Displays the type of the selected filter */}

      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredTransactions.length > 0 ? (
        <>
          <table className="transaction-table">
            <thead>
              <tr>{renderColumns(filteredTransactions[0]?.type)}</tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={transaction.id || index}>
                  <td>{index + 1}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>

                  {transaction.type === "Barnee Karra Tobacco" && (
                    <>
                      <td>{transaction.barnType}</td>
                      <td>{transaction.numberOfKarra}</td>
                    </>
                  )}

                  {["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery", "Sell Miripa"].includes(
                    transaction.type
                  ) && (
                    <>
                      <td>{transaction.quantity}</td>
                      <td>{transaction.price}</td>
                      <td>{calculateAmount(transaction)}</td>
                    </>
                  )}

                  {!["Barnee Karra Tobacco", "Sell Transactions"].includes(
                    transaction.type
                  ) && <td>{transaction.amount}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-summary">
            {["Chenega Investment", "Tobacco Investment", "Tobacco Nursery Investment"].includes(
              filteredTransactions[0]?.type
            ) && <p>Total Investment: ₹{calculateTotalAmount()}</p>}

            {["Tobacco Mastri", "Cows Adduluu Araka"].includes(
              filteredTransactions[0]?.type
            ) && <p>Total Sum of Amount: ₹{calculateTotalAmount()}</p>}

            {["Sell Tobacco", "Sell Chenega", "Sell Tobacco Nursery", "Sell Miripa"].includes(
              filteredTransactions[0]?.type
            ) && (
              <>
                <p>Total Quantity: {calculateSellSummary().totalQuantity}</p>
                <p>Total Price: ₹{calculateSellSummary().totalPrice.toLocaleString("en-IN")}</p>
                <p>Average Price: ₹{calculateSellSummary().averagePrice}</p>
              </>
            )}

            {filteredTransactions[0]?.type === "Barnee Karra Tobacco" && (
              <p>Total Karra: {calculateTotalKarra()}</p>
            )}
          </div>
        </>
      ) : (
        <p>No transactions available for the selected filter.</p>
      )}
    </div>
  );
};

export default Summary;
