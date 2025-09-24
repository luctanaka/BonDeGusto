const mongoose = require('mongoose');
const Menu = require('../models/Menu');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto';
console.log('🔗 Connecting to MongoDB...');
console.log('📍 URI:', mongoUri.substring(0, 20) + '...');
mongoose.connect(mongoUri);

// Weekly Menu Items with Day and Date Information
const weeklyMenuItems = [
  // SEGUNDA-FEIRA
  {
    nome: 'Bacalhau à Brás',
    descricao: 'Bacalhau desfiado com batata palha, ovos e azeitonas',
    preco: 45.90,
    categoria: 'prato-principal',
    ingredientes: ['bacalhau', 'batata', 'ovos', 'cebola', 'azeitonas', 'azeite'],
    alergenos: ['frutos-do-mar', 'ovos'],
    calorias: 420,
    tempoPreparacao: 30,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['português', 'tradicional', 'peixe'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Salada Caesar Completa',
    descricao: 'Alface romana, croutons, parmesão, frango grelhado e molho caesar',
    preco: 32.90,
    categoria: 'entrada',
    ingredientes: ['alface romana', 'frango', 'parmesão', 'croutons', 'molho caesar'],
    alergenos: ['lactose', 'gluten', 'ovos'],
    calorias: 285,
    tempoPreparacao: 15,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['salada', 'frango', 'saudável'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Mousse de Chocolate Belga',
    descricao: 'Mousse cremoso de chocolate belga com raspas de laranja',
    preco: 18.90,
    categoria: 'sobremesa',
    ingredientes: ['chocolate belga', 'ovos', 'açúcar', 'creme de leite', 'laranja'],
    alergenos: ['lactose', 'ovos'],
    calorias: 245,
    tempoPreparacao: 10,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['chocolate', 'doce', 'cremoso'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'segunda'
  },

  // TERÇA-FEIRA
  {
    nome: 'Feijoada Completa',
    descricao: 'Feijoada tradicional com linguiça, bacon, carne seca e acompanhamentos',
    preco: 52.90,
    categoria: 'prato-principal',
    ingredientes: ['feijão preto', 'linguiça', 'bacon', 'carne seca', 'arroz', 'couve', 'farofa'],
    alergenos: [],
    calorias: 680,
    tempoPreparacao: 45,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'tradicional', 'completo'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Pastéis de Queijo e Presunto',
    descricao: 'Pastéis crocantes recheados com queijo derretido e presunto',
    preco: 24.90,
    categoria: 'entrada',
    ingredientes: ['massa de pastel', 'queijo mussarela', 'presunto', 'óleo'],
    alergenos: ['gluten', 'lactose'],
    calorias: 320,
    tempoPreparacao: 20,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['brasileiro', 'frito', 'queijo'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Pudim de Leite Condensado',
    descricao: 'Pudim cremoso de leite condensado com calda de caramelo',
    preco: 16.90,
    categoria: 'sobremesa',
    ingredientes: ['leite condensado', 'ovos', 'leite', 'açúcar'],
    alergenos: ['lactose', 'ovos'],
    calorias: 280,
    tempoPreparacao: 8,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'doce', 'cremoso'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'terca'
  },

  // QUARTA-FEIRA
  {
    nome: 'Salmão Grelhado com Legumes',
    descricao: 'Salmão fresco grelhado com mix de legumes salteados e molho de ervas',
    preco: 58.90,
    categoria: 'prato-principal',
    ingredientes: ['salmão', 'brócolis', 'cenoura', 'abobrinha', 'ervas finas', 'azeite'],
    alergenos: ['frutos-do-mar'],
    calorias: 385,
    tempoPreparacao: 25,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['peixe', 'saudável', 'grelhado'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Bruschetta de Tomate e Manjericão',
    descricao: 'Pães tostados com tomate fresco, manjericão e azeite extra virgem',
    preco: 19.90,
    categoria: 'entrada',
    ingredientes: ['pão italiano', 'tomate', 'manjericão', 'alho', 'azeite extra virgem'],
    alergenos: ['gluten'],
    calorias: 165,
    tempoPreparacao: 12,
    vegetariano: true,
    vegano: true,
    semGluten: false,
    tags: ['italiano', 'vegetariano', 'fresco'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Tiramisu Tradicional',
    descricao: 'Tiramisu italiano com café espresso, mascarpone e cacau',
    preco: 22.90,
    categoria: 'sobremesa',
    ingredientes: ['mascarpone', 'café espresso', 'biscoito champagne', 'cacau', 'açúcar'],
    alergenos: ['lactose', 'gluten', 'ovos'],
    calorias: 315,
    tempoPreparacao: 15,
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ['italiano', 'café', 'cremoso'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quarta'
  },

  // QUINTA-FEIRA
  {
    nome: 'Risotto de Camarão',
    descricao: 'Risotto cremoso com camarões frescos, vinho branco e parmesão',
    preco: 62.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz arbóreo', 'camarão', 'vinho branco', 'parmesão', 'caldo de peixe'],
    alergenos: ['frutos-do-mar', 'lactose'],
    calorias: 465,
    tempoPreparacao: 35,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['italiano', 'frutos do mar', 'cremoso'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'quinta'
  },
  {
    nome: 'Carpaccio de Carne',
    descricao: 'Fatias finas de carne bovina com rúcula, parmesão e molho mostarda',
    preco: 36.90,
    categoria: 'entrada',
    ingredientes: ['filé mignon', 'rúcula', 'parmesão', 'mostarda dijon', 'azeite'],
    alergenos: ['lactose'],
    calorias: 220,
    tempoPreparacao: 15,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['carne', 'fino', 'italiano'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quinta'
  },
  {
    nome: 'Panna Cotta de Frutas Vermelhas',
    descricao: 'Panna cotta cremoso com calda de frutas vermelhas',
    preco: 20.90,
    categoria: 'sobremesa',
    ingredientes: ['creme de leite', 'gelatina', 'açúcar', 'morango', 'framboesa', 'mirtilo'],
    alergenos: ['lactose'],
    calorias: 195,
    tempoPreparacao: 12,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['italiano', 'frutas', 'cremoso'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quinta'
  },

  // SEXTA-FEIRA
  {
    nome: 'Paella Valenciana',
    descricao: 'Paella tradicional com frango, coelho, feijão verde e açafrão',
    preco: 72.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz bomba', 'frango', 'coelho', 'feijão verde', 'açafrão', 'pimentão'],
    alergenos: [],
    calorias: 520,
    tempoPreparacao: 40,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['espanhol', 'tradicional', 'arroz'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'sexta'
  },
  {
    nome: 'Tapas Variadas',
    descricao: 'Seleção de tapas espanholas: jamón, queijos, azeitonas e pães',
    preco: 42.90,
    categoria: 'entrada',
    ingredientes: ['jamón serrano', 'queijo manchego', 'azeitonas', 'pão', 'tomate'],
    alergenos: ['lactose', 'gluten'],
    calorias: 380,
    tempoPreparacao: 10,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['espanhol', 'variado', 'queijo'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'sexta'
  },
  {
    nome: 'Crema Catalana',
    descricao: 'Sobremesa catalana com creme de baunilha e açúcar queimado',
    preco: 19.90,
    categoria: 'sobremesa',
    ingredientes: ['creme de leite', 'gemas', 'açúcar', 'baunilha', 'canela'],
    alergenos: ['lactose', 'ovos'],
    calorias: 265,
    tempoPreparacao: 20,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['espanhol', 'cremoso', 'queimado'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'sexta'
  },

  // SÁBADO
  {
    nome: 'Costela no Bafo',
    descricao: 'Costela bovina cozida lentamente com temperos especiais e mandioca',
    preco: 68.90,
    categoria: 'prato-principal',
    ingredientes: ['costela bovina', 'mandioca', 'cebola', 'alho', 'louro', 'pimenta'],
    alergenos: [],
    calorias: 620,
    tempoPreparacao: 60,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'carne', 'lento'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'sabado'
  },
  {
    nome: 'Mandioca Frita com Bacon',
    descricao: 'Mandioca crocante frita com bacon e molho de alho',
    preco: 28.90,
    categoria: 'entrada',
    ingredientes: ['mandioca', 'bacon', 'alho', 'salsinha', 'óleo'],
    alergenos: [],
    calorias: 340,
    tempoPreparacao: 18,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'frito', 'bacon'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'sabado'
  },
  {
    nome: 'Quindim Tradicional',
    descricao: 'Quindim brasileiro com coco ralado e gemas',
    preco: 14.90,
    categoria: 'sobremesa',
    ingredientes: ['coco ralado', 'gemas', 'açúcar', 'manteiga'],
    alergenos: ['ovos', 'lactose'],
    calorias: 210,
    tempoPreparacao: 8,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'coco', 'doce'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'sabado'
  },

  // DOMINGO
  {
    nome: 'Frango Assado com Ervas',
    descricao: 'Frango inteiro assado com ervas finas, batatas e legumes',
    preco: 48.90,
    categoria: 'prato-principal',
    ingredientes: ['frango', 'batata', 'cenoura', 'cebola', 'alecrim', 'tomilho'],
    alergenos: [],
    calorias: 450,
    tempoPreparacao: 50,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['assado', 'família', 'ervas'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'domingo'
  },
  {
    nome: 'Pão de Alho Artesanal',
    descricao: 'Pão artesanal com manteiga de alho e ervas',
    preco: 16.90,
    categoria: 'entrada',
    ingredientes: ['pão artesanal', 'manteiga', 'alho', 'salsinha', 'orégano'],
    alergenos: ['gluten', 'lactose'],
    calorias: 185,
    tempoPreparacao: 12,
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ['pão', 'alho', 'artesanal'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'domingo'
  },
  {
    nome: 'Sorvete de Creme com Calda',
    descricao: 'Sorvete artesanal de creme com calda de chocolate ou frutas',
    preco: 12.90,
    categoria: 'sobremesa',
    ingredientes: ['leite', 'creme de leite', 'açúcar', 'baunilha', 'chocolate'],
    alergenos: ['lactose'],
    calorias: 155,
    tempoPreparacao: 5,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['sorvete', 'gelado', 'calda'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'domingo'
  }
];

async function addWeeklyMenuWithDates() {
  try {
    console.log('🍽️ Starting to add weekly menu items with day information...');
    
    // Clear existing menu items (optional - remove this if you want to keep existing items)
    // await Menu.deleteMany({});
    // console.log('🗑️ Cleared existing menu items');
    
    // Add new menu items
    const results = await Menu.insertMany(weeklyMenuItems);
    console.log(`✅ Successfully added ${results.length} menu items to the database`);
    
    // Group by day for verification
    const itemsByDay = {};
    results.forEach(item => {
      if (!itemsByDay[item.diaDaSemana]) {
        itemsByDay[item.diaDaSemana] = [];
      }
      itemsByDay[item.diaDaSemana].push(item.nome);
    });
    
    console.log('\n📅 Menu items by day:');
    Object.entries(itemsByDay).forEach(([day, items]) => {
      console.log(`${day.toUpperCase()}: ${items.length} items`);
      items.forEach(item => console.log(`  - ${item}`));
    });
    
    console.log('\n🎉 Weekly menu with day information added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding menu items:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

addWeeklyMenuWithDates();