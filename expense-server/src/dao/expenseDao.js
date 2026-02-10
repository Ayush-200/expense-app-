const Expense = require("../model/expense");

const expenseDao = {
    createExpense: async (data) => {
        const newExpense = new Expense(data);
        return await newExpense.save();
    },

    getExpensesByGroup: async (groupId) => {
        return await Expense.find({ groupId }).sort({ createdAt: -1 });
    },

    getExpenseById: async (expenseId) => {
        return await Expense.findById(expenseId);
    },

    deleteExpense: async (expenseId) => {
        return await Expense.findByIdAndDelete(expenseId);
    }
};

module.exports = expenseDao;
