const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const user = await User.findByEmail(req.body.email);
        if (user) {
            return res.status(400).json({ email: 'Email sudah ada' });
        }
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };
        await User.create(newUser);
        res.status(201).json({ message: 'terdaftar' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari pengguna berdasarkan email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ email: 'User not found' });
        }

        // Cocokkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ password: 'Incorrect password' });
        }

        // Buat token JWT
        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: '1h' });

        res.json({ success: true, token: 'Bearer ' + token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
