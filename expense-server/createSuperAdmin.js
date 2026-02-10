require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/model/users');

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_CONNECTION_URI);
        console.log('MongoDB Connected');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: 'superAdmin@gmail.com' });
        
        if (existingAdmin) {
            console.log('Super admin already exists!');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('#Ayushbhatia123', salt);

        // Create super admin
        const superAdmin = new User({
            name: 'Super Admin',
            email: 'superAdmin@gmail.com',
            password: hashedPassword,
            role: 'superadmin'
        });

        await superAdmin.save();
        console.log('Super admin created successfully!');
        console.log('Email: superAdmin@gmail.com');
        console.log('Password: #Ayushbhatia123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
