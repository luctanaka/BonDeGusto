const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Unit = require('../models/Unit');
const router = express.Router();

// Unified login for users and admins
router.post('/login', async (req, res) => {
  try {
    const { email, password, unit } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/usuário e senha são obrigatórios'
      });
    }

    // Try to find user using the new findByCredentials method (supports email or username)
    try {
      const user = await User.findByCredentials(email, password);
      
      // Populate unit information
      await user.populate('unit', 'name key isActive');
      
      // For non-admin users, unit is required
        if (!user.isAdmin && !user.unit) {
          return res.status(400).json({
            success: false,
            message: 'Unidade é obrigatória para usuários regulares'
          });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts && user.loginAttempts > 0) {
          await user.resetLoginAttempts();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            username: user.username,
            unit: user.unit ? user.unit.key : null,
            unitId: user.unit ? user.unit._id : null,
            isAdmin: user.isAdmin,
            adminRole: user.isAdmin ? user.adminRole : null,
            type: user.isAdmin ? 'admin' : 'user'
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        // Return user data (excluding sensitive information)
        const userData = {
          _id: user._id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          unit: user.unit ? {
            _id: user.unit._id,
            name: user.unit.name,
            key: user.unit.key,
            isActive: user.unit.isActive
          } : null,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin || false,
          adminRole: user.isAdmin ? user.adminRole : null
        };

        res.json({
          success: true,
          message: 'Login realizado com sucesso',
          user: userData,
          token
        });

      } catch (authError) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

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
    const user = await User.findById(decoded.userId).select('-password').populate('unit', 'name key isActive');
    
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
        name: user.fullName,
        email: user.email,
        username: user.username,
        unit: user.unit ? {
          _id: user.unit._id,
          name: user.unit.name,
          key: user.unit.key,
          isActive: user.unit.isActive
        } : null,
        isAdmin: user.isAdmin,
        adminRole: user.adminRole
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