// models/accounts.js
module.exports = (sequelize, DataTypes) => {
  const Accounts = sequelize.define('accounts', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    balance_cents: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    customer: DataTypes.STRING, // Foreign key to customers
    iban: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'accounts',
    timestamps: false,
    underscored: true,
  });

  // Define relationships
  Accounts.associate = (models) => {
    // Account belongs to Customer
    Accounts.belongsTo(models.customers, {
      foreignKey: 'customer',
      as: 'customerDetails',
    });

    // Account has many Transactions
    Accounts.hasMany(models.transactions, {
      foreignKey: 'account_id',
      as: 'transactions',
    });
  };

  return Accounts;
};