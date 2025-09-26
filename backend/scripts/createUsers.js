const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Unit = require('../models/Unit');
require('dotenv').config();

const createUsers = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lucasmtanaka:bondegusto2024@cluster0.mglbuhf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Conectado ao MongoDB');

    // Buscar ou criar uma unidade
    let unit = await Unit.findOne({ name: 'Bondegusto - Matriz' });
    if (!unit) {
      unit = new Unit({
        name: 'Bondegusto - Matriz',
        displayName: 'Bondegusto - Matriz',
        address: 'Endereço da Matriz',
        phone: '(11) 99999-9999'
      });
      await unit.save();
      console.log('Unidade criada:', unit.name);
    }

    const unitToUse = unit || await Unit.findOne();

    // Dados dos usuários
    const usersData = [
      {
        name: 'Maria Eduarda Lima',
        username: 'maria.eduarda',
        email: 'maria.eduarda@bondegusto.com',
        password: 'senha123',
        phone: '+5511987654321',
        unit: unitToUse._id,
        isAdmin: false,
        isActive: true
      },
      {
        name: 'João Paulo',
        username: 'joao.paulo',
        email: 'joao.paulo@bondegusto.com',
        password: 'senha123',
        phone: '+5511987651234',
        unit: unitToUse._id,
        isAdmin: false,
        isActive: true
      }
    ];

    // Criar os usuários
    for (const userData of usersData) {
      // Verificar se o usuário já existe
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  Usuário ${userData.name} já existe`);
        continue;
      }

      // Garantir que createdBy seja definido
      userData.createdBy = unitToUse._id;

      // Criar o usuário (a senha será criptografada automaticamente pelo middleware pre-save)
      const user = new User(userData);
      await user.save();
      
      console.log(`✅ Usuário criado: ${userData.name}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Username: ${userData.username}`);
      console.log(`   - Unidade: ${unitToUse.name}`);
      console.log(`   - Senha: senha123`);
      console.log('');
    }

    console.log('🎉 Todos os usuários foram criados com sucesso!');
    console.log('\n📋 Resumo dos usuários criados:');
    console.log('1. Maria Eduarda Lima (maria.eduarda@bondegusto.com / maria.eduarda)');
    console.log('2. João Paulo (joao.paulo@bondegusto.com / joao.paulo)');
    console.log('\n🔑 Senha padrão para ambos: senha123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

createUsers();