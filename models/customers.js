// models/customers.js
module.exports = (sequelize, DataTypes) => {
  const Customers = sequelize.define('customers', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'customers',
    timestamps: false,
    underscored: true,
  });

  Customers.associate = (models) => {
    // Customer has many Accounts
    Customers.hasMany(models.accounts, {
      foreignKey: 'customer',
      as: 'accounts',
    });

    // Customer has many Transactions
    Customers.hasMany(models.transactions, {
      foreignKey: 'customer_id',
      as: 'transactions',
    });

    // Customer has many Cases
    Customers.hasMany(models.cases, {
      foreignKey: 'customer_id',
      as: 'cases',
    });
  };

  return Customers;
};