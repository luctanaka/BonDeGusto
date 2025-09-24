const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Admin model
const Admin = require('../models/Admin');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    console.log('🔧 Iniciando criação do administrador...');
    
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne();
    
    if (existingAdmin) {
      console.log('⚠️  Já existe um administrador no sistema.');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Criado em: ${existingAdmin.createdAt}`);
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Deseja criar outro administrador? (s/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase());
        });
      });
      
      if (answer !== 's' && answer !== 'sim' && answer !== 'y' && answer !== 'yes') {
        console.log('❌ Operação cancelada.');
        process.exit(0);
      }
    }
    
    // Get admin details from command line arguments or use defaults
    const args = process.argv.slice(2);
    let username, email, password, role;
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--username' && args[i + 1]) {
        username = args[i + 1];
      } else if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
      } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1];
      } else if (args[i] === '--role' && args[i + 1]) {
        role = args[i + 1];
      }
    }
    
    // Use defaults if not provided
    username = username || 'admin';
    email = email || 'admin@bondegusto.com';
    password = password || 'Admin123!';
    role = role || 'super_admin';
    
    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      console.error('❌ Role deve ser "admin" ou "super_admin"');
      process.exit(1);
    }
    
    // Check if username or email already exists
    const existingUser = await Admin.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      console.error('❌ Username ou email já existe no sistema.');
      console.error(`   Conflito: ${existingUser.username === username ? 'Username' : 'Email'}`);
      process.exit(1);
    }
    
    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role,
      permissions: {
        menu: {
          read: true,
          write: true,
          delete: true
        },
        gallery: {
          read: true,
          write: true,
          delete: true
        },
        reviews: {
          read: true,
          moderate: true,
          delete: role === 'super_admin'
        },
        dashboard: {
          access: true,
          analytics: true
        }
      },
      isActive: true
    });
    
    await newAdmin.save();
    
    console.log('✅ Administrador criado com sucesso!');
    console.log('📋 Detalhes do administrador:');
    console.log(`   ID: ${newAdmin._id}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Criado em: ${newAdmin.createdAt}`);
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('🌐 Acesse o painel admin em: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('📝 Erros de validação:');
      Object.values(error.errors).forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
    
    process.exit(1);
  }
};

// Main function
const main = async () => {
  console.log('🚀 Bondegusto - Criador de Administrador');
  console.log('==========================================');
  
  try {
    await connectDB();
    await createAdmin();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com o banco de dados fechada.');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⏹️  Processo interrompido pelo usuário.');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Processo terminado.');
  await mongoose.connection.close();
  process.exit(0);
});

// Show usage if --help is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🚀 Bondegusto - Criador de Administrador');
  console.log('==========================================');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/createAdmin.js [opções]');
  console.log('');
  console.log('Opções:');
  console.log('  --username <username>    Username do administrador (padrão: admin)');
  console.log('  --email <email>          Email do administrador (padrão: admin@bondegusto.com)');
  console.log('  --password <password>    Senha do administrador (padrão: Admin123!)');
  console.log('  --role <role>            Role do administrador: admin|super_admin (padrão: super_admin)');
  console.log('  --help, -h               Mostra esta ajuda');
  console.log('');
  console.log('Exemplos:');
  console.log('  node scripts/createAdmin.js');
  console.log('  node scripts/createAdmin.js --username gerente --email gerente@bondegusto.com');
  console.log('  node scripts/createAdmin.js --username admin --password MinhaSenh@123 --role super_admin');
  console.log('');
  process.exit(0);
}

// Run the script
main();