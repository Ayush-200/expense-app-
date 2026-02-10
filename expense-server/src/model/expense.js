const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true }, // email of the person who paid
    createdAt: { type: Date, default: Date.now },
    splitAmong: [{
        email: { type: String, required: true },
        amount: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Expense', expenseSchema);
