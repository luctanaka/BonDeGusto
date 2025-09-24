const mongoose = require('mongoose');
const Menu = require('../models/Menu');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto';
console.log('🔗 Connecting to MongoDB...');
console.log('📍 URI:', mongoUri.substring(0, 20) + '...');
mongoose.connect(mongoUri);

// New Menu Items to Add
const newMenuItems = [
  // ENTRADAS
  {
    nome: 'Coxinha de Frango Caipira',
    descricao: 'Coxinha artesanal com frango caipira desfiado, temperos especiais e massa dourada',
    preco: 12.90,
    categoria: 'entrada',
    ingredientes: ['frango caipira', 'farinha de trigo', 'cebola', 'alho', 'salsinha', 'óleo'],
    alergenos: ['gluten', 'ovos'],
    calorias: 195,
    tempoPreparacao: 20,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['brasileiro', 'tradicional', 'frito'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Bolinho de Bacalhau',
    descricao: 'Bolinhos crocantes de bacalhau com batata, cebola e ervas finas',
    preco: 16.90,
    categoria: 'entrada',
    ingredientes: ['bacalhau', 'batata', 'cebola', 'ovos', 'farinha', 'salsa'],
    alergenos: ['frutos-do-mar', 'gluten', 'ovos'],
    calorias: 165,
    tempoPreparacao: 25,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['português', 'peixe', 'tradicional'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quarta'
  },
  
  // PRATOS PRINCIPAIS
  {
    nome: 'Moqueca de Camarão Capixaba',
    descricao: 'Moqueca tradicional com camarões frescos, leite de coco, dendê e pimentões',
    preco: 68.90,
    categoria: 'prato-principal',
    ingredientes: ['camarão', 'leite de coco', 'dendê', 'pimentão', 'tomate', 'cebola', 'coentro'],
    alergenos: ['frutos-do-mar'],
    calorias: 485,
    tempoPreparacao: 35,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'capixaba', 'frutos do mar', 'tradicional'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'quinta'
  },
  {
    nome: 'Risotto de Cogumelos Selvagens',
    descricao: 'Risotto cremoso com mix de cogumelos selvagens, parmesão e trufa',
    preco: 54.90,
    categoria: 'prato-principal',
    ingredientes: ['arroz arbóreo', 'cogumelos shiitake', 'cogumelos paris', 'parmesão', 'vinho branco', 'caldo de legumes', 'trufa'],
    alergenos: ['lactose'],
    calorias: 420,
    tempoPreparacao: 30,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['italiano', 'vegetariano', 'gourmet', 'cogumelos'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'sexta'
  },
  {
    nome: 'Picanha na Brasa com Farofa',
    descricao: 'Picanha grelhada na brasa com farofa de bacon, vinagrete e mandioca',
    preco: 78.90,
    categoria: 'prato-principal',
    ingredientes: ['picanha', 'farinha de mandioca', 'bacon', 'tomate', 'cebola roxa', 'pimentão', 'mandioca'],
    alergenos: [],
    calorias: 650,
    tempoPreparacao: 40,
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'churrasco', 'carne', 'tradicional'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'sabado'
  },
  
  // SOBREMESAS
  {
    nome: 'Brigadeiro Gourmet Trio',
    descricao: 'Trio de brigadeiros gourmet: tradicional, pistache e maracujá',
    preco: 22.90,
    categoria: 'sobremesa',
    ingredientes: ['chocolate belga', 'leite condensado', 'manteiga', 'pistache', 'maracujá'],
    alergenos: ['lactose', 'nozes'],
    calorias: 320,
    tempoPreparacao: 15,
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ['brasileiro', 'doce', 'chocolate', 'gourmet'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'domingo'
  },
  {
    nome: 'Açaí Bowl Tropical',
    descricao: 'Açaí cremoso com granola caseira, frutas tropicais e mel',
    preco: 28.90,
    categoria: 'sobremesa',
    ingredientes: ['açaí', 'banana', 'manga', 'kiwi', 'granola', 'mel', 'coco ralado'],
    alergenos: ['nozes'],
    calorias: 285,
    tempoPreparacao: 10,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['brasileiro', 'saudável', 'frutas', 'vegano'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'segunda'
  },
  
  // BEBIDAS
  {
    nome: 'Caipirinha de Cachaça Artesanal',
    descricao: 'Caipirinha com cachaça artesanal, limão tahiti e açúcar cristal',
    preco: 18.90,
    categoria: 'bebida',
    ingredientes: ['cachaça artesanal', 'limão tahiti', 'açúcar cristal', 'gelo'],
    alergenos: [],
    calorias: 180,
    tempoPreparacao: 5,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['brasileiro', 'alcoólica', 'tradicional', 'limão'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'terca'
  },
  {
    nome: 'Suco Verde Detox',
    descricao: 'Suco natural com couve, maçã verde, limão, gengibre e hortelã',
    preco: 14.90,
    categoria: 'bebida',
    ingredientes: ['couve', 'maçã verde', 'limão', 'gengibre', 'hortelã', 'água'],
    alergenos: [],
    calorias: 85,
    tempoPreparacao: 8,
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ['saudável', 'detox', 'natural', 'vegano'],
    disponivel: true,
    ofertaEspecial: false,
    diaDaSemana: 'quarta'
  },
  
  // ESPECIAIS
  {
    nome: 'Festival de Inverno - Fondue de Queijo',
    descricao: 'Fondue de queijos suíços com pães artesanais, legumes e embutidos',
    preco: 89.90,
    categoria: 'especial',
    ingredientes: ['queijo gruyère', 'queijo emmental', 'vinho branco', 'pão artesanal', 'brócolis', 'linguiça defumada'],
    alergenos: ['lactose', 'gluten'],
    calorias: 580,
    tempoPreparacao: 25,
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ['suíço', 'queijo', 'especial', 'inverno'],
    disponivel: true,
    ofertaEspecial: true,
    diaDaSemana: 'quinta'
  }
];

async function addNewMenuItems() {
  try {
    console.log('🍽️  Iniciando adição de novos itens ao cardápio...');
    
    // Validate all items before insertion
    console.log('🔍 Validando itens...');
    for (let i = 0; i < newMenuItems.length; i++) {
      const item = newMenuItems[i];
      
      // Check required fields
      if (!item.nome || !item.preco || !item.categoria) {
        throw new Error(`Item ${i + 1}: Campos obrigatórios faltando (nome, preço, categoria)`);
      }
      
      // Validate categoria enum
      const validCategories = ['entrada', 'prato-principal', 'sobremesa', 'bebida', 'especial'];
      if (!validCategories.includes(item.categoria)) {
        throw new Error(`Item ${i + 1}: Categoria inválida - ${item.categoria}`);
      }
      
      // Validate diaDaSemana enum
      const validDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
      if (item.diaDaSemana && !validDays.includes(item.diaDaSemana)) {
        throw new Error(`Item ${i + 1}: Dia da semana inválido - ${item.diaDaSemana}`);
      }
      
      // Validate alergenos enum
      const validAllergens = ['gluten', 'lactose', 'nozes', 'frutos-do-mar', 'ovos', 'soja'];
      if (item.alergenos) {
        for (const allergen of item.alergenos) {
          if (!validAllergens.includes(allergen)) {
            throw new Error(`Item ${i + 1}: Alérgeno inválido - ${allergen}`);
          }
        }
      }
      
      console.log(`   ✅ Item ${i + 1}: ${item.nome} - Validado`);
    }
    
    // Insert items one by one for better reliability
    console.log('\n💾 Inserindo itens no banco de dados...');
    const insertedItems = [];
    
    for (let i = 0; i < newMenuItems.length; i++) {
      try {
        const item = new Menu(newMenuItems[i]);
         const savedItem = await item.save();
        insertedItems.push(savedItem);
        console.log(`   ✅ Item ${i + 1}: ${savedItem.nome} - Inserido com sucesso`);
      } catch (error) {
        console.error(`   ❌ Erro ao inserir item ${i + 1}: ${newMenuItems[i].nome}`, error.message);
      }
    }
    
    console.log(`\n✅ ${insertedItems.length} de ${newMenuItems.length} itens adicionados com sucesso!`);
    
    if (insertedItems.length > 0) {
      // Display summary by category
      const summary = insertedItems.reduce((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Resumo dos novos itens:');
      Object.entries(summary).forEach(([categoria, count]) => {
        console.log(`   ${categoria}: ${count} itens`);
      });
      
      // Display confirmation for each item
      console.log('\n📋 Confirmação de inserção:');
      insertedItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.nome} (${item.categoria}) - ID: ${item._id}`);
      });
    }
    
    console.log('\n🎉 Novos itens adicionados ao cardápio com sucesso!');
    console.log('\n📋 Características dos novos itens:');
    console.log('   • Pratos brasileiros tradicionais');
    console.log('   • Opções vegetarianas e veganas');
    console.log('   • Informações nutricionais completas');
    console.log('   • Validação de dados rigorosa');
    console.log('   • Distribuição equilibrada por categoria');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar novos itens:', error.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the script
addNewMenuItems();