// models/transactions.js
module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define('transactions', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    account_id: DataTypes.STRING,
    customer_id: DataTypes.STRING,
    amount_cents: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    type: DataTypes.STRING, // 'debit' or 'credit'
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    created_at: DataTypes.DATE,
  }, {
    tableName: 'transactions',
    timestamps: false,
    underscored: true,
  });

  Transactions.associate = (models) => {
    // Transaction belongs to Account
    Transactions.belongsTo(models.accounts, {
      foreignKey: 'account_id',
      as: 'account',
    });

    // Transaction belongs to Customer
    Transactions.belongsTo(models.customers, {
      foreignKey: 'customer_id',
      as: 'customer',
    });
  };

  return Transactions;
};