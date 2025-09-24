const mongoose = require('mongoose');
const Menu = require('../models/Menu');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Sample dishes for daily rotation
const dailyRotationDishes = [
  {
    nome: 'Feijoada Completa',
    descricao: 'Feijoada tradicional brasileira com linguiça, bacon, carne seca e acompanhamentos',
    preco: 28.90,
    categoria: 'prato-principal',
    ingredientes: ['feijão preto', 'linguiça', 'bacon', 'carne seca', 'arroz', 'couve', 'farofa'],
    alergenos: ['gluten'],
    calorias: 650,
    tempoPreparacao: 45,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['tradicional', 'brasileiro', 'especial']
  },
  {
    nome: 'Salmão Grelhado com Quinoa',
    descricao: 'Salmão fresco grelhado servido com quinoa, legumes refogados e molho de ervas',
    preco: 35.90,
    categoria: 'prato-principal',
    ingredientes: ['salmão', 'quinoa', 'brócolis', 'cenoura', 'abobrinha', 'ervas finas'],
    alergenos: ['frutos-do-mar'],
    calorias: 420,
    tempoPreparacao: 25,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['saudável', 'proteína', 'especial']
  },
  {
    nome: 'Risotto de Cogumelos',
    descricao: 'Risotto cremoso com mix de cogumelos frescos, parmesão e trufa',
    preco: 32.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz arbóreo', 'cogumelos', 'parmesão', 'vinho branco', 'cebola', 'alho'],
    alergenos: ['lactose'],
    calorias: 480,
    tempoPreparacao: 35,
    disponivel: true,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['vegetariano', 'cremoso', 'especial']
  },
  {
    nome: 'Picanha na Brasa',
    descricao: 'Picanha premium grelhada na brasa com farofa especial e vinagrete',
    preco: 42.90,
    categoria: 'prato-principal',
    ingredientes: ['picanha', 'farofa', 'vinagrete', 'arroz', 'feijão tropeiro'],
    alergenos: [],
    calorias: 720,
    tempoPreparacao: 30,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['churrasco', 'premium', 'especial']
  },
  {
    nome: 'Curry de Grão-de-Bico',
    descricao: 'Curry aromático de grão-de-bico com leite de coco, servido com arroz basmati',
    preco: 24.90,
    categoria: 'prato-principal',
    ingredientes: ['grão-de-bico', 'leite de coco', 'curry', 'arroz basmati', 'espinafre', 'tomate'],
    alergenos: [],
    calorias: 380,
    tempoPreparacao: 25,
    disponivel: true,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['vegano', 'indiano', 'especial']
  },
  {
    nome: 'Moqueca de Peixe',
    descricao: 'Moqueca capixaba com peixe fresco, leite de coco, dendê e pimentões',
    preco: 38.90,
    categoria: 'prato-principal',
    ingredientes: ['peixe branco', 'leite de coco', 'dendê', 'pimentão', 'tomate', 'cebola', 'coentro'],
    alergenos: ['frutos-do-mar'],
    calorias: 520,
    tempoPreparacao: 40,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'regional', 'especial']
  },
  {
    nome: 'Lasanha de Berinjela',
    descricao: 'Lasanha vegetariana com camadas de berinjela, molho de tomate e queijos',
    preco: 29.90,
    categoria: 'prato-principal',
    ingredientes: ['berinjela', 'molho de tomate', 'mussarela', 'parmesão', 'ricota', 'manjericão'],
    alergenos: ['lactose', 'gluten'],
    calorias: 450,
    tempoPreparacao: 50,
    disponivel: true,
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ['vegetariano', 'italiana', 'especial']
  }
];

async function seedDailyRotation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Clear existing rotation dishes
    await Menu.deleteMany({ 
      categoria: { $in: ['prato-principal', 'especial'] },
      tags: 'especial'
    });
    console.log('Cleared existing rotation dishes');

    // Insert new rotation dishes
    const insertedDishes = await Menu.insertMany(dailyRotationDishes);
    console.log(`Inserted ${insertedDishes.length} rotation dishes`);

    // Display the dishes
    console.log('\n=== Daily Rotation Dishes ===');
    insertedDishes.forEach((dish, index) => {
      console.log(`${index + 1}. ${dish.nome} - R$ ${dish.preco.toFixed(2)}`);
      console.log(`   ${dish.descricao}`);
      console.log(`   Tags: ${dish.tags.join(', ')}\n`);
    });

    console.log('Daily rotation seeding completed successfully!');
    console.log('\nThe system will now rotate through these dishes daily.');
    console.log('Each day will feature a different dish as the "Prato Especial do Dia".');
    
  } catch (error) {
    console.error('Error seeding daily rotation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDailyRotation();
}

module.exports = seedDailyRotation;