import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Summary.css";

const Summary = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          "https://ledegermanagement-backend.onrender.com/api/transactions"
        );
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilter = (type) => {
    if (type === "All") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((transaction) => transaction.type === type)
      );
    }
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
          "All",
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

      {loading ? (
        <p>Loading transactions...</p>
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
                <p>Total Price: ₹{calculateSellSummary().totalPrice}</p>
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
