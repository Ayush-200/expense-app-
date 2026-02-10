const expenseDao = require("../dao/expenseDao");
const groupDao = require("../dao/groupDao");

const expenseController = {
    create: async (request, response) => {
        try {
            const { groupId, title, amount, splitAmong } = request.body;
            const paidBy = request.user.email;

            // Validate that the user is a member of the group
            const group = await groupDao.getGroupById(groupId);
            
            if (!group) {
                return response.status(404).json({ message: "Group not found" });
            }

            if (!group.membersEmail.includes(paidBy)) {
                return response.status(403).json({ message: "You are not a member of this group" });
            }

            const newExpense = await expenseDao.createExpense({
                groupId,
                title,
                amount,
                paidBy,
                splitAmong
            });

            response.status(201).json({
                message: 'Expense created successfully',
                expense: newExpense
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    getByGroup: async (request, response) => {
        try {
            const { groupId } = request.params;
            const userEmail = request.user.email;

            // Validate that the user is a member of the group
            const group = await groupDao.getGroupById(groupId);
            
            if (!group) {
                return response.status(404).json({ message: "Group not found" });
            }

            if (!group.membersEmail.includes(userEmail)) {
                return response.status(403).json({ message: "You are not a member of this group" });
            }

            const expenses = await expenseDao.getExpensesByGroup(groupId);
            response.status(200).json(expenses);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error fetching expenses" });
        }
    },

    getGroupDetails: async (request, response) => {
        try {
            const { groupId } = request.params;
            const userEmail = request.user.email;

            // Get group details directly by ID
            const group = await groupDao.getGroupById(groupId);
            
            if (!group) {
                return response.status(404).json({ message: "Group not found" });
            }

            // Check if user is a member of this group
            if (!group.membersEmail.includes(userEmail)) {
                return response.status(403).json({ message: "You are not a member of this group" });
            }

            // Get all expenses for this group
            const expenses = await expenseDao.getExpensesByGroup(groupId);

            // Calculate balances for each member
            const balances = {};
            
            // Initialize all members with 0 balance
            group.membersEmail.forEach(email => {
                balances[email] = 0;
            });

            // Calculate balances based on expenses
            expenses.forEach(expense => {
                // Person who paid gets positive balance
                balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
                
                // People who owe get negative balance
                expense.splitAmong.forEach(split => {
                    balances[split.email] = (balances[split.email] || 0) - split.amount;
                });
            });

            response.status(200).json({
                group,
                expenses,
                balances
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error fetching group details" });
        }
    },

    delete: async (request, response) => {
        try {
            const { expenseId } = request.params;
            const userEmail = request.user.email;

            const expense = await expenseDao.getExpenseById(expenseId);
            
            if (!expense) {
                return response.status(404).json({ message: "Expense not found" });
            }

            // Only the person who created the expense can delete it
            if (expense.paidBy !== userEmail) {
                return response.status(403).json({ message: "You can only delete your own expenses" });
            }

            await expenseDao.deleteExpense(expenseId);
            response.status(200).json({ message: "Expense deleted successfully" });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error deleting expense" });
        }
    }
};

module.exports = expenseController;
