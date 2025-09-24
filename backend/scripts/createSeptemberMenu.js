const mongoose = require('mongoose');
const MenuItem = require('../models/Menu');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto';
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(mongoUri);

// September 2024 Menu Items
const septemberMenuItems = [
  // ENTRADAS
  {
    nome: 'Bruschetta de Tomate e Manjericão',
    descricao: 'Pão italiano tostado com tomates frescos, manjericão, alho e azeite extra virgem',
    preco: 18.90,
    categoria: 'entrada',
    ingredientes: ['pão italiano', 'tomate', 'manjericão', 'alho', 'azeite', 'sal marinho'],
    alergenos: ['gluten'],
    calorias: 180,
    tempoPreparacao: 10,
    vegetariano: true,
    semGluten: false,
    tags: ['italiano', 'fresco', 'vegetariano'],
    disponivel: true,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Carpaccio de Salmão',
    descricao: 'Fatias finas de salmão fresco com alcaparras, rúcula e molho de mostarda e mel',
    preco: 32.90,
    categoria: 'entrada',
    ingredientes: ['salmão fresco', 'alcaparras', 'rúcula', 'mostarda dijon', 'mel', 'azeite'],
    alergenos: ['frutos-do-mar'],
    calorias: 220,
    tempoPreparacao: 15,
    vegetariano: false,
    semGluten: true,
    tags: ['peixe', 'gourmet', 'sem glúten'],
    disponivel: true,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Salada Caesar Especial',
    descricao: 'Alface romana, croutons caseiros, parmesão e molho caesar tradicional',
    preco: 24.90,
    categoria: 'entrada',
    ingredientes: ['alface romana', 'parmesão', 'croutons', 'molho caesar', 'anchovas'],
    alergenos: ['gluten', 'lactose', 'ovos'],
    calorias: 280,
    tempoPreparacao: 8,
    vegetariano: true,
    semGluten: false,
    tags: ['clássico', 'salada'],
    disponivel: true,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Coxinha Gourmet de Camarão',
    descricao: 'Coxinha artesanal recheada com camarão refogado e catupiry',
    preco: 16.90,
    categoria: 'entrada',
    ingredientes: ['massa de mandioca', 'camarão', 'catupiry', 'temperos'],
    alergenos: ['gluten', 'lactose', 'frutos-do-mar'],
    calorias: 320,
    tempoPreparacao: 20,
    vegetariano: false,
    semGluten: false,
    tags: ['brasileiro', 'frito', 'gourmet'],
    disponivel: true,
    diaDaSemana: 'terca'
  },

  // PRATOS PRINCIPAIS
  {
    nome: 'Picanha Grelhada com Chimichurri',
    descricao: 'Picanha argentina grelhada no ponto, acompanha batatas rústicas e molho chimichurri',
    preco: 68.90,
    categoria: 'prato-principal',
    ingredientes: ['picanha', 'batata', 'salsa', 'coentro', 'alho', 'azeite', 'vinagre'],
    alergenos: [],
    calorias: 650,
    tempoPreparacao: 25,
    vegetariano: false,
    semGluten: true,
    tags: ['carne', 'grelhado', 'argentino'],
    disponivel: true,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Salmão ao Molho de Maracujá',
    descricao: 'Filé de salmão grelhado com molho agridoce de maracujá, arroz de coco e legumes',
    preco: 58.90,
    categoria: 'prato-principal',
    ingredientes: ['salmão', 'maracujá', 'arroz', 'leite de coco', 'brócolis', 'cenoura'],
    alergenos: ['frutos-do-mar'],
    calorias: 520,
    tempoPreparacao: 20,
    vegetariano: false,
    semGluten: true,
    tags: ['peixe', 'tropical', 'saudável'],
    disponivel: true,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Risotto de Cogumelos Selvagens',
    descricao: 'Arroz arbóreo cremoso com mix de cogumelos, parmesão e trufa',
    preco: 45.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz arbóreo', 'cogumelos', 'parmesão', 'vinho branco', 'cebola', 'óleo de trufa'],
    alergenos: ['lactose'],
    calorias: 480,
    tempoPreparacao: 30,
    vegetariano: true,
    semGluten: true,
    tags: ['italiano', 'cremoso', 'vegetariano'],
    disponivel: true,
     diaDaSemana: 'quinta'
   },
   {
    nome: 'Feijoada Completa',
    descricao: 'Feijoada tradicional brasileira com linguiça, bacon, costela e acompanhamentos',
    preco: 52.90,
    categoria: 'prato-principal',
    ingredientes: ['feijão preto', 'linguiça', 'bacon', 'costela', 'arroz', 'couve', 'farofa', 'laranja'],
    alergenos: [],
    calorias: 780,
    tempoPreparacao: 45,
    vegetariano: false,
    semGluten: true,
    tags: ['brasileiro', 'tradicional', 'completo'],
    disponivel: true,
    diaDaSemana: 'sabado'
  },
  {
    nome: 'Lasanha Vegetariana',
    descricao: 'Lasanha com berinjela, abobrinha, espinafre, molho de tomate e queijos',
    preco: 38.90,
    categoria: 'prato-principal',
    ingredientes: ['massa de lasanha', 'berinjela', 'abobrinha', 'espinafre', 'molho de tomate', 'mussarela', 'ricota'],
    alergenos: ['gluten', 'lactose'],
    calorias: 420,
    tempoPreparacao: 35,
    vegetariano: true,
    semGluten: false,
    tags: ['italiano', 'vegetariano', 'assado'],
    disponivel: true,
    diaDaSemana: 'quinta'
  },
  {
    nome: 'Moqueca de Camarão',
    descricao: 'Camarões grandes refogados no leite de coco com dendê, pimentões e coentro',
    preco: 62.90,
    categoria: 'prato-principal',
    ingredientes: ['camarão', 'leite de coco', 'dendê', 'pimentão', 'tomate', 'cebola', 'coentro'],
    alergenos: ['frutos-do-mar'],
    calorias: 580,
    tempoPreparacao: 25,
    vegetariano: false,
    semGluten: true,
    tags: ['brasileiro', 'baiano', 'frutos do mar'],
    disponivel: true,
    diaDaSemana: 'domingo'
  },

  // SOBREMESAS
  {
    nome: 'Tiramisu Clássico',
    descricao: 'Sobremesa italiana com mascarpone, café espresso, biscoitos e cacau',
    preco: 22.90,
    categoria: 'sobremesa',
    ingredientes: ['mascarpone', 'café espresso', 'biscoitos champagne', 'cacau', 'açúcar', 'ovos'],
    alergenos: ['lactose', 'gluten', 'ovos'],
    calorias: 380,
    tempoPreparacao: 15,
    vegetariano: true,
    semGluten: false,
    tags: ['italiano', 'café', 'clássico'],
    disponivel: true,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Pudim de Leite Condensado',
    descricao: 'Pudim cremoso tradicional com calda de açúcar caramelizado',
    preco: 18.90,
    categoria: 'sobremesa',
    ingredientes: ['leite condensado', 'leite', 'ovos', 'açúcar'],
    alergenos: ['lactose', 'ovos'],
    calorias: 320,
    tempoPreparacao: 10,
    vegetariano: true,
    semGluten: true,
    tags: ['brasileiro', 'tradicional', 'cremoso'],
    disponivel: true,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Brownie com Sorvete',
    descricao: 'Brownie de chocolate quente com sorvete de baunilha e calda de chocolate',
    preco: 24.90,
    categoria: 'sobremesa',
    ingredientes: ['chocolate', 'manteiga', 'ovos', 'açúcar', 'farinha', 'sorvete de baunilha'],
    alergenos: ['gluten', 'lactose', 'ovos'],
    calorias: 450,
    tempoPreparacao: 12,
    vegetariano: true,
    semGluten: false,
    tags: ['chocolate', 'quente', 'americano'],
    disponivel: true,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Mousse de Maracujá',
    descricao: 'Mousse leve e refrescante de maracujá com calda da fruta',
    preco: 16.90,
    categoria: 'sobremesa',
    ingredientes: ['maracujá', 'leite condensado', 'creme de leite', 'gelatina'],
    alergenos: ['lactose'],
    calorias: 280,
    tempoPreparacao: 8,
    vegetariano: true,
    semGluten: true,
    tags: ['tropical', 'refrescante', 'leve'],
    disponivel: true,
    diaDaSemana: 'quinta'
  },

  // BEBIDAS
  {
    nome: 'Caipirinha de Cachaça',
    descricao: 'Caipirinha tradicional com cachaça artesanal, limão e açúcar',
    preco: 16.90,
    categoria: 'bebida',
    ingredientes: ['cachaça', 'limão', 'açúcar', 'gelo'],
    alergenos: [],
    calorias: 180,
    tempoPreparacao: 5,
    vegetariano: true,
    semGluten: true,
    tags: ['brasileiro', 'alcoólica', 'refrescante'],
    disponivel: true,
    diaDaSemana: 'sexta'
  },
  {
    nome: 'Suco de Laranja Natural',
    descricao: 'Suco de laranja puro, extraído na hora',
    preco: 8.90,
    categoria: 'bebida',
    ingredientes: ['laranja'],
    alergenos: [],
    calorias: 110,
    tempoPreparacao: 3,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['natural', 'vitamina c', 'refrescante'],
    disponivel: true,
    diaDaSemana: 'sabado'
  },
  {
    nome: 'Água de Coco Gelada',
    descricao: 'Água de coco natural servida bem gelada',
    preco: 6.90,
    categoria: 'bebida',
    ingredientes: ['água de coco'],
    alergenos: [],
    calorias: 45,
    tempoPreparacao: 2,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['natural', 'hidratante', 'tropical'],
    disponivel: true,
    diaDaSemana: 'domingo'
  },
  {
    nome: 'Café Espresso',
    descricao: 'Café espresso tradicional italiano',
    preco: 4.90,
    categoria: 'bebida',
    ingredientes: ['café'],
    alergenos: [],
    calorias: 5,
    tempoPreparacao: 2,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['café', 'italiano', 'energético'],
    disponivel: true,
    diaDaSemana: 'segunda'
  },
  {
    nome: 'Refrigerante Lata',
    descricao: 'Refrigerante gelado em lata (Coca-Cola, Guaraná, Fanta)',
    preco: 5.90,
    categoria: 'bebida',
    ingredientes: ['refrigerante'],
    alergenos: [],
    calorias: 140,
    tempoPreparacao: 1,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['gelado', 'gaseificado'],
    disponivel: true,
    diaDaSemana: 'terca'
  },

  // ESPECIAIS DE SETEMBRO
  {
    nome: 'Festival da Primavera - Salada Especial',
    descricao: 'Mix de folhas verdes, morangos, nozes, queijo de cabra e vinagrete de mel',
    preco: 28.90,
    categoria: 'especial',
    ingredientes: ['mix de folhas', 'morango', 'nozes', 'queijo de cabra', 'mel', 'vinagre balsâmico'],
    alergenos: ['lactose', 'nozes'],
    calorias: 320,
    tempoPreparacao: 10,
    vegetariano: true,
    semGluten: true,
    tags: ['primavera', 'sazonal', 'especial'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'quarta'
  },
  {
    nome: 'Prato do Chef - Cordeiro com Ervas',
    descricao: 'Carré de cordeiro com crosta de ervas, purê de batata doce e redução de vinho tinto',
    preco: 89.90,
    categoria: 'especial',
    ingredientes: ['carré de cordeiro', 'ervas finas', 'batata doce', 'vinho tinto', 'manteiga'],
    alergenos: ['lactose'],
    calorias: 720,
    tempoPreparacao: 40,
    vegetariano: false,
    semGluten: true,
    tags: ['chef', 'gourmet', 'especial'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'sexta'
  }
];

async function createSeptemberMenu() {
  try {
    console.log('🍽️  Criando cardápio de setembro...');
    
    // Clear existing menu items (optional - remove if you want to keep existing items)
    // await MenuItem.deleteMany({});
    // console.log('✅ Itens existentes removidos');
    
    // Insert new menu items
    const createdItems = await MenuItem.insertMany(septemberMenuItems);
    console.log(`✅ ${createdItems.length} itens do cardápio criados com sucesso!`);
    
    // Display summary by category
    const summary = createdItems.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Resumo do cardápio:');
    Object.entries(summary).forEach(([categoria, count]) => {
      console.log(`   ${categoria}: ${count} itens`);
    });
    
    console.log('\n🎉 Cardápio de setembro criado com sucesso!');
    console.log('\n📋 Características do cardápio:');
    console.log('   • Pratos sazonais de primavera');
    console.log('   • Opções vegetarianas e veganas');
    console.log('   • Informações nutricionais completas');
    console.log('   • Especiais do chef');
    console.log('   • Bebidas variadas');
    
  } catch (error) {
    console.error('❌ Erro ao criar cardápio:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the script
createSeptemberMenu();