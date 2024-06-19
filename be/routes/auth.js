const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Endpoint untuk registrasi
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Received data:', req.body); // Log untuk debugging

    // Periksa apakah email sudah digunakan
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Buat user baru
    const newUser = new User(username, email, password); // Perbaiki inisialisasi
    const result = await newUser.save();

    res.status(201).json({ message: "Registrasi berhasil", result });
  } catch (error) {
    console.error('Error during registration:', error); // Log untuk debugging
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
  }
});

// Endpoint untuk login
router.post('/login', async (req, res) => {
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

    res.json({ success: true, token: 'Bearer ' + token, username : user.username });
  } catch (error) {
    console.error('Error during login:', error); // Log untuk debugging
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
