const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password, location } = req.body;

    // Validate input
    if (!email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha e localização são obrigatórios'
      });
    }

    // Find user by email and location
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      location: location,
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas ou usuário não encontrado para esta localização'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Conta bloqueada devido a muitas tentativas de login. Tente novamente mais tarde.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        location: user.location,
        type: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (excluding sensitive information)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// User logout (optional - mainly for token invalidation if implemented)
router.post('/logout', async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Verify token (for protected routes)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

module.exports = router;