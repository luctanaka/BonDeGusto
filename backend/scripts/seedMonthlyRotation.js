const mongoose = require('mongoose');
const Menu = require('../models/Menu');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 31 pratos únicos para cada dia do mês
const monthlyRotationDishes = [
  // Dias 1-7
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
  },
  // Dias 8-14
  {
    nome: 'Bobó de Camarão',
    descricao: 'Bobó cremoso de camarão com mandioca, leite de coco e dendê',
    preco: 36.90,
    categoria: 'prato-principal',
    ingredientes: ['camarão', 'mandioca', 'leite de coco', 'dendê', 'pimentão', 'coentro'],
    alergenos: ['frutos-do-mar'],
    calorias: 580,
    tempoPreparacao: 35,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'frutos-do-mar', 'especial']
  },
  {
    nome: 'Cordeiro com Ervas',
    descricao: 'Cordeiro assado com ervas finas, batatas rústicas e molho de vinho tinto',
    preco: 45.90,
    categoria: 'prato-principal',
    ingredientes: ['cordeiro', 'batatas', 'alecrim', 'tomilho', 'vinho tinto', 'alho'],
    alergenos: [],
    calorias: 680,
    tempoPreparacao: 60,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['premium', 'assado', 'especial']
  },
  {
    nome: 'Paella Valenciana',
    descricao: 'Paella tradicional espanhola com frango, coelho, feijão verde e açafrão',
    preco: 39.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz bomba', 'frango', 'coelho', 'feijão verde', 'açafrão', 'pimentão'],
    alergenos: [],
    calorias: 620,
    tempoPreparacao: 45,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['espanhol', 'tradicional', 'especial']
  },
  {
    nome: 'Ratatouille Provençal',
    descricao: 'Ratatouille francês com berinjela, abobrinha, tomate e ervas de Provence',
    preco: 26.90,
    categoria: 'prato-principal',
    ingredientes: ['berinjela', 'abobrinha', 'tomate', 'pimentão', 'cebola', 'ervas de Provence'],
    alergenos: [],
    calorias: 320,
    tempoPreparacao: 40,
    disponivel: true,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['francês', 'vegano', 'especial']
  },
  {
    nome: 'Bacalhau à Brás',
    descricao: 'Bacalhau desfiado com batata palha, ovos e azeitonas',
    preco: 34.90,
    categoria: 'prato-principal',
    ingredientes: ['bacalhau', 'batata palha', 'ovos', 'azeitonas', 'cebola', 'salsa'],
    alergenos: ['frutos-do-mar', 'ovos'],
    calorias: 540,
    tempoPreparacao: 30,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['português', 'tradicional', 'especial']
  },
  {
    nome: 'Pad Thai Vegetariano',
    descricao: 'Macarrão de arroz tailandês com tofu, brotos de feijão e molho tamarindo',
    preco: 27.90,
    categoria: 'prato-principal',
    ingredientes: ['macarrão de arroz', 'tofu', 'brotos de feijão', 'tamarindo', 'amendoim', 'limão'],
    alergenos: ['nozes'],
    calorias: 460,
    tempoPreparacao: 20,
    disponivel: true,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['tailandês', 'vegano', 'especial']
  },
  {
    nome: 'Osso Buco Milanês',
    descricao: 'Osso buco cozido lentamente com risotto alla milanese',
    preco: 48.90,
    categoria: 'prato-principal',
    ingredientes: ['osso buco', 'arroz arbóreo', 'açafrão', 'vinho branco', 'cebola', 'aipo'],
    alergenos: ['lactose'],
    calorias: 750,
    tempoPreparacao: 120,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['italiano', 'premium', 'especial']
  },
  // Dias 15-21
  {
    nome: 'Ceviche Peruano',
    descricao: 'Peixe branco marinado no limão com cebola roxa, pimenta e coentro',
    preco: 31.90,
    categoria: 'prato-principal',
    ingredientes: ['peixe branco', 'limão', 'cebola roxa', 'pimenta', 'coentro', 'batata doce'],
    alergenos: ['frutos-do-mar'],
    calorias: 280,
    tempoPreparacao: 15,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['peruano', 'fresco', 'especial']
  },
  {
    nome: 'Coq au Vin',
    descricao: 'Frango cozido no vinho tinto com cogumelos, bacon e cebolas pérola',
    preco: 37.90,
    categoria: 'prato-principal',
    ingredientes: ['frango', 'vinho tinto', 'cogumelos', 'bacon', 'cebolas pérola', 'tomilho'],
    alergenos: [],
    calorias: 590,
    tempoPreparacao: 90,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['francês', 'clássico', 'especial']
  },
  {
    nome: 'Chili Sin Carne',
    descricao: 'Chili vegano com feijão preto, quinoa e pimentões',
    preco: 23.90,
    categoria: 'prato-principal',
    ingredientes: ['feijão preto', 'quinoa', 'pimentão', 'tomate', 'cebola', 'cominho'],
    alergenos: [],
    calorias: 380,
    tempoPreparacao: 30,
    disponivel: true,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['mexicano', 'vegano', 'especial']
  },
  {
    nome: 'Sushi Combinado',
    descricao: 'Combinado de sushi e sashimi com salmão, atum e peixe branco',
    preco: 44.90,
    categoria: 'prato-principal',
    ingredientes: ['salmão', 'atum', 'peixe branco', 'arroz sushi', 'nori', 'wasabi'],
    alergenos: ['frutos-do-mar'],
    calorias: 420,
    tempoPreparacao: 25,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['japonês', 'fresco', 'especial']
  },
  {
    nome: 'Moussaka Grega',
    descricao: 'Moussaka tradicional com berinjela, carne moída e molho bechamel',
    preco: 33.90,
    categoria: 'prato-principal',
    ingredientes: ['berinjela', 'carne moída', 'molho bechamel', 'tomate', 'cebola', 'queijo'],
    alergenos: ['lactose', 'gluten'],
    calorias: 620,
    tempoPreparacao: 75,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['grego', 'tradicional', 'especial']
  },
  {
    nome: 'Tagine de Cordeiro',
    descricao: 'Tagine marroquino com cordeiro, damascos e especiarias',
    preco: 41.90,
    categoria: 'prato-principal',
    ingredientes: ['cordeiro', 'damascos', 'cebola', 'gengibre', 'canela', 'couscous'],
    alergenos: ['gluten'],
    calorias: 580,
    tempoPreparacao: 90,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['marroquino', 'exótico', 'especial']
  },
  {
    nome: 'Goulash Húngaro',
    descricao: 'Goulash tradicional húngaro com carne bovina e páprica',
    preco: 35.90,
    categoria: 'prato-principal',
    ingredientes: ['carne bovina', 'páprica', 'cebola', 'tomate', 'pimentão', 'batata'],
    alergenos: [],
    calorias: 540,
    tempoPreparacao: 120,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['húngaro', 'tradicional', 'especial']
  },
  // Dias 22-28
  {
    nome: 'Biryani de Frango',
    descricao: 'Biryani indiano aromático com frango, arroz basmati e especiarias',
    preco: 32.90,
    categoria: 'prato-principal',
    ingredientes: ['frango', 'arroz basmati', 'açafrão', 'cardamomo', 'canela', 'cebola'],
    alergenos: ['lactose'],
    calorias: 580,
    tempoPreparacao: 60,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['indiano', 'aromático', 'especial']
  },
  {
    nome: 'Cassoulet Francês',
    descricao: 'Cassoulet tradicional com feijão branco, linguiça e pato confitado',
    preco: 43.90,
    categoria: 'prato-principal',
    ingredientes: ['feijão branco', 'linguiça', 'pato confitado', 'tomate', 'alho', 'tomilho'],
    alergenos: [],
    calorias: 680,
    tempoPreparacao: 180,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['francês', 'tradicional', 'especial']
  },
  {
    nome: 'Falafel com Tahine',
    descricao: 'Falafel crocante servido com molho tahine, tabule e pita',
    preco: 25.90,
    categoria: 'prato-principal',
    ingredientes: ['grão-de-bico', 'tahine', 'salsa', 'tomate', 'pepino', 'pita'],
    alergenos: ['gluten'],
    calorias: 420,
    tempoPreparacao: 25,
    disponivel: true,
    vegetariano: true,
    vegano: true,
    semGluten: false,
    tags: ['árabe', 'vegano', 'especial']
  },
  {
    nome: 'Carbonara Autêntica',
    descricao: 'Spaghetti carbonara com guanciale, ovos, pecorino e pimenta preta',
    preco: 28.90,
    categoria: 'prato-principal',
    ingredientes: ['spaghetti', 'guanciale', 'ovos', 'pecorino', 'pimenta preta'],
    alergenos: ['gluten', 'ovos', 'lactose'],
    calorias: 520,
    tempoPreparacao: 15,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['italiano', 'clássico', 'especial']
  },
  {
    nome: 'Bulgogi Coreano',
    descricao: 'Bulgogi marinado servido com arroz, kimchi e legumes grelhados',
    preco: 34.90,
    categoria: 'prato-principal',
    ingredientes: ['carne bovina', 'molho soja', 'pêra', 'alho', 'gergelim', 'kimchi'],
    alergenos: ['soja'],
    calorias: 480,
    tempoPreparacao: 30,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['coreano', 'marinado', 'especial']
  },
  {
    nome: 'Pastrami Sandwich',
    descricao: 'Sanduíche de pastrami com mostarda, picles e pão de centeio',
    preco: 26.90,
    categoria: 'prato-principal',
    ingredientes: ['pastrami', 'pão de centeio', 'mostarda', 'picles', 'cebola'],
    alergenos: ['gluten'],
    calorias: 580,
    tempoPreparacao: 10,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['americano', 'sanduíche', 'especial']
  },
  {
    nome: 'Ramen Tonkotsu',
    descricao: 'Ramen com caldo de osso de porco, chashu, ovo marinado e nori',
    preco: 31.90,
    categoria: 'prato-principal',
    ingredientes: ['macarrão ramen', 'caldo tonkotsu', 'chashu', 'ovo marinado', 'nori', 'cebolinha'],
    alergenos: ['gluten', 'ovos', 'soja'],
    calorias: 620,
    tempoPreparacao: 15,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['japonês', 'reconfortante', 'especial']
  },
  // Dias 29-31
  {
    nome: 'Bouillabaisse Marseillaise',
    descricao: 'Bouillabaisse provençal com peixes do mediterrâneo e rouille',
    preco: 46.90,
    categoria: 'prato-principal',
    ingredientes: ['peixes variados', 'tomate', 'açafrão', 'erva-doce', 'alho', 'rouille'],
    alergenos: ['frutos-do-mar', 'ovos'],
    calorias: 420,
    tempoPreparacao: 45,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['francês', 'mediterrâneo', 'especial']
  },
  {
    nome: 'Shepherd\'s Pie',
    descricao: 'Torta do pastor com carne moída, legumes e purê de batata gratinado',
    preco: 29.90,
    categoria: 'prato-principal',
    ingredientes: ['carne moída', 'batata', 'cenoura', 'ervilha', 'cebola', 'tomilho'],
    alergenos: ['lactose'],
    calorias: 540,
    tempoPreparacao: 60,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['inglês', 'reconfortante', 'especial']
  },
  {
    nome: 'Enchiladas Verdes',
    descricao: 'Enchiladas com molho verde de tomatillo, frango e queijo',
    preco: 27.90,
    categoria: 'prato-principal',
    ingredientes: ['tortilla', 'frango', 'tomatillo', 'queijo', 'creme azedo', 'coentro'],
    alergenos: ['lactose', 'gluten'],
    calorias: 480,
    tempoPreparacao: 35,
    disponivel: true,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['mexicano', 'picante', 'especial']
  }
];

async function seedMonthlyRotation() {
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
    const insertedDishes = await Menu.insertMany(monthlyRotationDishes);
    console.log(`Inserted ${insertedDishes.length} monthly rotation dishes`);

    // Display the dishes
    console.log('\n=== Monthly Rotation Dishes (31 pratos únicos) ===');
    insertedDishes.forEach((dish, index) => {
      console.log(`Dia ${index + 1}: ${dish.nome} - R$ ${dish.preco.toFixed(2)}`);
      console.log(`   ${dish.descricao}`);
      console.log(`   Origem: ${dish.tags.filter(tag => tag !== 'especial').join(', ')}\n`);
    });

    console.log('Monthly rotation seeding completed successfully!');
    console.log('\n🎯 SISTEMA IMPLEMENTADO:');
    console.log('✅ Cada dia do mês (1-31) tem um prato único diferente');
    console.log('✅ 31 pratos de diferentes culinárias do mundo');
    console.log('✅ Rotação automática baseada no dia do mês');
    console.log('✅ Variedade garantida todos os dias!');
    
  } catch (error) {
    console.error('Error seeding monthly rotation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMonthlyRotation();
}

module.exports = seedMonthlyRotation;