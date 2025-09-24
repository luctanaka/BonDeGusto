const mongoose = require('mongoose');
const MenuItem = require('../models/Menu');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bondegusto');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// September 2025 menu data with complete meal details
const septemberMenuItems = [
  // September 1st - Monday
  {
    nome: "Bacalhau à Brás",
    descricao: "Tradicional prato português com bacalhau desfiado, batata palha, ovos mexidos e azeitonas pretas",
    preco: 28.50,
    categoria: "prato-principal",
    ingredientes: ["bacalhau", "batata", "ovos", "cebola", "alho", "azeite", "azeitonas pretas", "salsa"],
    alergenos: ["ovos"],
    calorias: 420,
    tempoPreparacao: 45,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-01'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["tradicional", "português", "bacalhau"]
  },
  {
    nome: "Salada de Entrada",
    descricao: "Mix de folhas verdes, tomate cereja, pepino e molho vinagrete",
    preco: 12.00,
    categoria: "entrada",
    ingredientes: ["alface", "rúcula", "tomate cereja", "pepino", "azeite", "vinagre", "sal"],
    calorias: 85,
    tempoPreparacao: 10,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-01'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["fresco", "leve", "salada"]
  },
  {
    nome: "Pudim de Leite",
    descricao: "Sobremesa cremosa com calda de caramelo",
    preco: 8.50,
    categoria: "sobremesa",
    ingredientes: ["leite", "ovos", "açúcar", "baunilha"],
    alergenos: ["lactose", "ovos"],
    calorias: 220,
    tempoPreparacao: 60,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-01'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["doce", "cremoso", "tradicional"]
  },

  // September 2nd - Tuesday
  {
    nome: "Risotto de Camarão",
    descricao: "Arroz arbóreo cremoso com camarões frescos, alho e ervas finas",
    preco: 32.00,
    categoria: "prato-principal",
    ingredientes: ["arroz arbóreo", "camarão", "caldo de peixe", "vinho branco", "cebola", "alho", "queijo parmesão", "manteiga"],
    alergenos: ["frutos-do-mar", "lactose"],
    calorias: 380,
    tempoPreparacao: 35,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-02'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["cremoso", "frutos-do-mar", "italiano"]
  },
  {
    nome: "Bruschetta de Tomate",
    descricao: "Pão italiano tostado com tomate fresco, manjericão e azeite",
    preco: 14.00,
    categoria: "entrada",
    ingredientes: ["pão italiano", "tomate", "manjericão", "alho", "azeite", "sal"],
    alergenos: ["gluten"],
    calorias: 150,
    tempoPreparacao: 15,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-02'),
    vegetariano: true,
    vegano: true,
    semGluten: false,
    tags: ["italiano", "fresco", "tostado"]
  },
  {
    nome: "Tiramisu",
    descricao: "Clássica sobremesa italiana com café, mascarpone e cacau",
    preco: 12.00,
    categoria: "sobremesa",
    ingredientes: ["mascarpone", "café", "biscoito champagne", "ovos", "açúcar", "cacau"],
    alergenos: ["lactose", "ovos", "gluten"],
    calorias: 280,
    tempoPreparacao: 30,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-02'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["italiano", "café", "cremoso"]
  },

  // September 3rd - Wednesday
  {
    nome: "Salmão Grelhado",
    descricao: "Filé de salmão grelhado com ervas e acompanhado de legumes salteados",
    preco: 35.00,
    categoria: "prato-principal",
    ingredientes: ["salmão", "brócolis", "cenoura", "abobrinha", "alho", "limão", "ervas finas", "azeite"],
    calorias: 320,
    tempoPreparacao: 25,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-03'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["peixe", "saudável", "grelhado"]
  },
  {
    nome: "Sopa de Abóbora",
    descricao: "Cremosa sopa de abóbora com gengibre e coco",
    preco: 16.00,
    categoria: "entrada",
    ingredientes: ["abóbora", "gengibre", "leite de coco", "cebola", "alho", "caldo de legumes"],
    calorias: 120,
    tempoPreparacao: 30,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-03'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["cremoso", "aquecimento", "sopa"]
  },
  {
    nome: "Mousse de Chocolate",
    descricao: "Sobremesa aerada de chocolate belga com chantilly",
    preco: 10.00,
    categoria: "sobremesa",
    ingredientes: ["chocolate", "ovos", "açúcar", "creme de leite", "baunilha"],
    alergenos: ["lactose", "ovos"],
    calorias: 250,
    tempoPreparacao: 40,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-03'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["chocolate", "aerado", "doce"]
  },

  // September 4th - Thursday
  {
    nome: "Frango à Parmegiana",
    descricao: "Peito de frango empanado com molho de tomate e queijo derretido",
    preco: 26.00,
    categoria: "prato-principal",
    ingredientes: ["peito de frango", "farinha de rosca", "ovos", "molho de tomate", "queijo mussarela", "manjericão"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 450,
    tempoPreparacao: 40,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-04'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["empanado", "queijo", "tradicional"]
  },
  {
    nome: "Carpaccio de Carne",
    descricao: "Fatias finas de carne bovina crua com rúcula e parmesão",
    preco: 22.00,
    categoria: "entrada",
    ingredientes: ["filé mignon", "rúcula", "queijo parmesão", "azeite", "limão", "alcaparras"],
    alergenos: ["lactose"],
    calorias: 180,
    tempoPreparacao: 15,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-04'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["cru", "refinado", "carne"]
  },
  {
    nome: "Gelato de Pistache",
    descricao: "Sorvete artesanal italiano de pistache",
    preco: 9.00,
    categoria: "sobremesa",
    ingredientes: ["leite", "creme", "pistache", "açúcar", "gemas"],
    alergenos: ["lactose", "nozes", "ovos"],
    calorias: 200,
    tempoPreparacao: 120,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-04'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["gelado", "pistache", "artesanal"]
  },

  // September 5th - Friday
  {
    nome: "Paella Valenciana",
    descricao: "Arroz espanhol com frutos do mar, frango e açafrão",
    preco: 38.00,
    categoria: "prato-principal",
    ingredientes: ["arroz", "camarão", "lula", "mexilhões", "frango", "açafrão", "pimentão", "ervilha"],
    alergenos: ["frutos-do-mar"],
    calorias: 420,
    tempoPreparacao: 50,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-05'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["espanhol", "frutos-do-mar", "açafrão"]
  },
  {
    nome: "Tábua de Queijos",
    descricao: "Seleção de queijos artesanais com geleia e nozes",
    preco: 25.00,
    categoria: "entrada",
    ingredientes: ["queijo brie", "queijo gorgonzola", "queijo cabra", "geleia de figo", "nozes", "mel"],
    alergenos: ["lactose", "nozes"],
    calorias: 320,
    tempoPreparacao: 10,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-05'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["queijo", "artesanal", "degustação"]
  },
  {
    nome: "Crème Brûlée",
    descricao: "Creme francês com açúcar caramelizado",
    preco: 11.00,
    categoria: "sobremesa",
    ingredientes: ["creme de leite", "gemas", "açúcar", "baunilha"],
    alergenos: ["lactose", "ovos"],
    calorias: 290,
    tempoPreparacao: 45,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-05'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["francês", "caramelizado", "cremoso"]
  },

  // Continue with more days...
  // September 6th - Saturday
  {
    nome: "Costela Assada",
    descricao: "Costela bovina assada lentamente com temperos especiais",
    preco: 42.00,
    categoria: "prato-principal",
    ingredientes: ["costela bovina", "alho", "cebola", "vinho tinto", "ervas", "batata"],
    calorias: 520,
    tempoPreparacao: 180,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-06'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["assado", "carne", "especial"]
  },
  {
    nome: "Ostras Gratinadas",
    descricao: "Ostras frescas gratinadas com queijo e ervas",
    preco: 28.00,
    categoria: "entrada",
    ingredientes: ["ostras", "queijo gruyère", "manteiga", "alho", "salsa", "limão"],
    alergenos: ["frutos-do-mar", "lactose"],
    calorias: 160,
    tempoPreparacao: 20,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-06'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["ostras", "gratinado", "refinado"]
  },
  {
    nome: "Petit Gateau",
    descricao: "Bolinho de chocolate quente com sorvete de baunilha",
    preco: 13.00,
    categoria: "sobremesa",
    ingredientes: ["chocolate", "manteiga", "ovos", "farinha", "açúcar", "sorvete baunilha"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 380,
    tempoPreparacao: 25,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-06'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["chocolate", "quente", "sorvete"]
  },

  // September 7th - Sunday
  {
    nome: "Feijoada Completa",
    descricao: "Tradicional feijoada brasileira com acompanhamentos",
    preco: 35.00,
    categoria: "prato-principal",
    ingredientes: ["feijão preto", "linguiça", "bacon", "costela", "paio", "arroz", "couve", "farofa"],
    alergenos: ["gluten"],
    calorias: 580,
    tempoPreparacao: 120,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-07'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["brasileiro", "tradicional", "completo"]
  },
  {
    nome: "Pastéis de Bacalhau",
    descricao: "Bolinhos portugueses de bacalhau fritos",
    preco: 18.00,
    categoria: "entrada",
    ingredientes: ["bacalhau", "batata", "ovos", "salsa", "cebola", "farinha"],
    alergenos: ["ovos", "gluten"],
    calorias: 220,
    tempoPreparacao: 30,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-07'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["português", "frito", "bacalhau"]
  },
  {
    nome: "Açaí na Tigela",
    descricao: "Açaí cremoso com granola, banana e mel",
    preco: 15.00,
    categoria: "sobremesa",
    ingredientes: ["açaí", "granola", "banana", "mel", "coco ralado"],
    calorias: 280,
    tempoPreparacao: 10,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-07'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "saudável", "fruta"]
  },

  // September 8th - Monday
  {
    nome: "Lasanha de Berinjela",
    descricao: "Lasanha vegetariana com camadas de berinjela, molho de tomate e queijos",
    preco: 24.00,
    categoria: "prato-principal",
    ingredientes: ["berinjela", "molho de tomate", "queijo ricota", "queijo mussarela", "manjericão", "alho"],
    alergenos: ["lactose"],
    calorias: 350,
    tempoPreparacao: 60,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-08'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["vegetariano", "berinjela", "queijo"]
  },
  {
    nome: "Ceviche de Peixe",
    descricao: "Peixe branco marinado em limão com cebola roxa e pimenta",
    preco: 26.00,
    categoria: "entrada",
    ingredientes: ["peixe branco", "limão", "cebola roxa", "pimenta", "coentro", "batata doce"],
    calorias: 180,
    tempoPreparacao: 20,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-08'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["peruano", "cru", "cítrico"]
  },
  {
    nome: "Sorvete de Coco",
    descricao: "Sorvete artesanal de coco com raspas de chocolate",
    preco: 8.00,
    categoria: "sobremesa",
    ingredientes: ["leite de coco", "açúcar", "creme", "chocolate"],
    alergenos: ["lactose"],
    calorias: 190,
    tempoPreparacao: 90,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-08'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["gelado", "coco", "tropical"]
  },

  // September 9th - Tuesday
  {
    nome: "Polvo à Lagareiro",
    descricao: "Polvo grelhado com batatas ao murro e azeite",
    preco: 45.00,
    categoria: "prato-principal",
    ingredientes: ["polvo", "batata", "alho", "azeite", "coentro", "limão"],
    alergenos: ["frutos-do-mar"],
    calorias: 280,
    tempoPreparacao: 90,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-09'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["polvo", "português", "grelhado"]
  },
  {
    nome: "Gazpacho",
    descricao: "Sopa fria espanhola de tomate com pepino e pimentão",
    preco: 14.00,
    categoria: "entrada",
    ingredientes: ["tomate", "pepino", "pimentão", "cebola", "alho", "azeite", "vinagre"],
    calorias: 95,
    tempoPreparacao: 15,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-09'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["espanhol", "frio", "refrescante"]
  },
  {
    nome: "Flan de Caramelo",
    descricao: "Pudim espanhol com calda de caramelo",
    preco: 9.50,
    categoria: "sobremesa",
    ingredientes: ["leite", "ovos", "açúcar", "baunilha"],
    alergenos: ["lactose", "ovos"],
    calorias: 240,
    tempoPreparacao: 50,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-09'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["espanhol", "caramelo", "cremoso"]
  },

  // September 10th - Wednesday
  {
    nome: "Cordeiro Assado",
    descricao: "Pernil de cordeiro assado com ervas mediterrâneas",
    preco: 48.00,
    categoria: "prato-principal",
    ingredientes: ["cordeiro", "alecrim", "tomilho", "alho", "azeite", "batata"],
    calorias: 420,
    tempoPreparacao: 120,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-10'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["cordeiro", "assado", "mediterrâneo"]
  },
  {
    nome: "Antipasto Italiano",
    descricao: "Seleção de frios, queijos e conservas italianas",
    preco: 32.00,
    categoria: "entrada",
    ingredientes: ["presunto parma", "salame", "queijo provolone", "azeitonas", "tomate seco", "rúcula"],
    alergenos: ["lactose"],
    calorias: 380,
    tempoPreparacao: 15,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-10'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["italiano", "frios", "degustação"]
  },
  {
    nome: "Cannoli Siciliano",
    descricao: "Massa crocante recheada com ricota doce e pistache",
    preco: 12.50,
    categoria: "sobremesa",
    ingredientes: ["massa de cannoli", "ricota", "açúcar", "pistache", "chocolate"],
    alergenos: ["gluten", "lactose", "nozes"],
    calorias: 320,
    tempoPreparacao: 30,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-10'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["siciliano", "crocante", "ricota"]
  },

  // September 11th - Thursday
  {
    nome: "Moqueca de Peixe",
    descricao: "Peixe cozido no leite de coco com dendê e pimentões",
    preco: 34.00,
    categoria: "prato-principal",
    ingredientes: ["peixe", "leite de coco", "dendê", "pimentão", "tomate", "cebola", "coentro"],
    calorias: 320,
    tempoPreparacao: 35,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-11'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "baiano", "coco"]
  },
  {
    nome: "Bolinhos de Aipim",
    descricao: "Bolinhos fritos de mandioca com queijo",
    preco: 16.00,
    categoria: "entrada",
    ingredientes: ["mandioca", "queijo", "ovos", "farinha", "salsa"],
    alergenos: ["lactose", "ovos", "gluten"],
    calorias: 220,
    tempoPreparacao: 25,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-11'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["brasileiro", "frito", "mandioca"]
  },
  {
    nome: "Quindim",
    descricao: "Doce brasileiro de coco e gemas",
    preco: 7.50,
    categoria: "sobremesa",
    ingredientes: ["coco ralado", "gemas", "açúcar", "manteiga"],
    alergenos: ["ovos", "lactose"],
    calorias: 180,
    tempoPreparacao: 45,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-11'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "coco", "tradicional"]
  },

  // September 12th - Friday
  {
    nome: "Linguado Meunière",
    descricao: "Linguado grelhado com manteiga, limão e alcaparras",
    preco: 42.00,
    categoria: "prato-principal",
    ingredientes: ["linguado", "manteiga", "limão", "alcaparras", "salsa", "farinha"],
    alergenos: ["lactose", "gluten"],
    calorias: 290,
    tempoPreparacao: 20,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-12'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["francês", "peixe", "manteiga"]
  },
  {
    nome: "Escargot",
    descricao: "Caracóis franceses com manteiga de alho e ervas",
    preco: 28.00,
    categoria: "entrada",
    ingredientes: ["caracóis", "manteiga", "alho", "salsa", "vinho branco"],
    alergenos: ["lactose"],
    calorias: 150,
    tempoPreparacao: 25,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-12'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["francês", "caracol", "refinado"]
  },
  {
    nome: "Profiteroles",
    descricao: "Massa choux recheada com creme e cobertura de chocolate",
    preco: 14.00,
    categoria: "sobremesa",
    ingredientes: ["massa choux", "creme pasteleiro", "chocolate", "manteiga", "ovos"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 350,
    tempoPreparacao: 60,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-12'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["francês", "choux", "chocolate"]
  },

  // September 13th - Saturday
  {
    nome: "Picanha na Brasa",
    descricao: "Picanha grelhada na brasa com farofa e vinagrete",
    preco: 52.00,
    categoria: "prato-principal",
    ingredientes: ["picanha", "sal grosso", "farofa", "tomate", "cebola", "pimentão"],
    calorias: 480,
    tempoPreparacao: 30,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-13'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["churrasco", "brasa", "brasileiro"]
  },
  {
    nome: "Dadinho de Tapioca",
    descricao: "Cubos de tapioca fritos com geleia de pimenta",
    preco: 18.00,
    categoria: "entrada",
    ingredientes: ["tapioca", "queijo coalho", "geleia de pimenta", "óleo"],
    alergenos: ["lactose"],
    calorias: 200,
    tempoPreparacao: 20,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-13'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "frito", "tapioca"]
  },
  {
    nome: "Brigadeiro Gourmet",
    descricao: "Brigadeiro artesanal com chocolate belga",
    preco: 6.00,
    categoria: "sobremesa",
    ingredientes: ["chocolate belga", "leite condensado", "manteiga", "granulado"],
    alergenos: ["lactose"],
    calorias: 120,
    tempoPreparacao: 15,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-13'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "chocolate", "doce"]
  },

  // September 14th - Sunday
  {
    nome: "Bobó de Camarão",
    descricao: "Camarões refogados em purê de mandioca com leite de coco",
    preco: 36.00,
    categoria: "prato-principal",
    ingredientes: ["camarão", "mandioca", "leite de coco", "dendê", "cebola", "alho", "coentro"],
    alergenos: ["frutos-do-mar"],
    calorias: 380,
    tempoPreparacao: 40,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-14'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "baiano", "camarão"]
  },
  {
    nome: "Acarajé",
    descricao: "Bolinho de feijão fradinho frito com vatapá e caruru",
    preco: 20.00,
    categoria: "entrada",
    ingredientes: ["feijão fradinho", "cebola", "dendê", "vatapá", "caruru", "camarão seco"],
    alergenos: ["frutos-do-mar"],
    calorias: 280,
    tempoPreparacao: 45,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-14'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["baiano", "frito", "tradicional"]
  },
  {
    nome: "Cocada Queimada",
    descricao: "Doce de coco caramelizado",
    preco: 5.50,
    categoria: "sobremesa",
    ingredientes: ["coco ralado", "açúcar", "água"],
    calorias: 150,
    tempoPreparacao: 30,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-14'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["brasileiro", "coco", "caramelizado"]
  },

  // September 15th - Monday
  {
    nome: "Ragu de Javali",
    descricao: "Molho de javali cozido lentamente com vinho tinto",
    preco: 55.00,
    categoria: "prato-principal",
    ingredientes: ["javali", "vinho tinto", "tomate", "cenoura", "aipo", "cebola", "ervas"],
    calorias: 420,
    tempoPreparacao: 150,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-15'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["caça", "ragu", "especial"]
  },
  {
    nome: "Foie Gras",
    descricao: "Fígado de pato com geleia de figo e torrada",
    preco: 65.00,
    categoria: "entrada",
    ingredientes: ["foie gras", "geleia de figo", "pão brioche", "flor de sal"],
    alergenos: ["gluten"],
    calorias: 320,
    tempoPreparacao: 15,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-15'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["francês", "luxo", "pato"]
  },
  {
    nome: "Macarons",
    descricao: "Biscoitos franceses coloridos com recheio de ganache",
    preco: 16.00,
    categoria: "sobremesa",
    ingredientes: ["farinha de amêndoa", "açúcar", "claras", "ganache", "corante"],
    alergenos: ["nozes", "ovos", "lactose"],
    calorias: 180,
    tempoPreparacao: 90,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-15'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["francês", "colorido", "amêndoa"]
  },

  // September 16th - Tuesday
  {
    nome: "Duck Confit",
    descricao: "Pato confitado lentamente em sua própria gordura",
    preco: 48.00,
    categoria: "prato-principal",
    ingredientes: ["pato", "gordura de pato", "alho", "tomilho", "louro", "batata"],
    calorias: 450,
    tempoPreparacao: 180,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-16'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["francês", "confitado", "pato"]
  },
  {
    nome: "Rillettes de Pato",
    descricao: "Patê rústico de pato com torradas",
    preco: 24.00,
    categoria: "entrada",
    ingredientes: ["pato", "gordura de pato", "vinho branco", "ervas", "pão"],
    alergenos: ["gluten"],
    calorias: 280,
    tempoPreparacao: 120,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-16'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["francês", "patê", "rústico"]
  },
  {
    nome: "Tarte Tatin",
    descricao: "Torta francesa de maçã caramelizada invertida",
    preco: 13.50,
    categoria: "sobremesa",
    ingredientes: ["maçã", "açúcar", "manteiga", "massa folhada", "canela"],
    alergenos: ["gluten", "lactose"],
    calorias: 320,
    tempoPreparacao: 50,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-16'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["francês", "maçã", "caramelizada"]
  },

  // September 17th - Wednesday
  {
    nome: "Osso Buco",
    descricao: "Jarrete bovino cozido lentamente com legumes",
    preco: 46.00,
    categoria: "prato-principal",
    ingredientes: ["jarrete", "cenoura", "aipo", "cebola", "tomate", "vinho branco", "caldo"],
    calorias: 420,
    tempoPreparacao: 120,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-17'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["italiano", "cozido", "osso"]
  },
  {
    nome: "Vitello Tonnato",
    descricao: "Vitela fria com molho de atum e alcaparras",
    preco: 32.00,
    categoria: "entrada",
    ingredientes: ["vitela", "atum", "maionese", "alcaparras", "limão", "ovos"],
    alergenos: ["ovos"],
    calorias: 250,
    tempoPreparacao: 90,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-17'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["italiano", "frio", "atum"]
  },
  {
    nome: "Panna Cotta",
    descricao: "Sobremesa italiana cremosa com calda de frutas vermelhas",
    preco: 11.50,
    categoria: "sobremesa",
    ingredientes: ["creme de leite", "açúcar", "gelatina", "baunilha", "frutas vermelhas"],
    alergenos: ["lactose"],
    calorias: 220,
    tempoPreparacao: 180,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-17'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["italiano", "cremoso", "frutas"]
  },

  // September 18th - Thursday
  {
    nome: "Paella de Frutos do Mar",
    descricao: "Arroz espanhol com mix de frutos do mar e açafrão",
    preco: 42.00,
    categoria: "prato-principal",
    ingredientes: ["arroz", "lula", "camarão", "mexilhões", "açafrão", "alho", "pimentão"],
    alergenos: ["frutos-do-mar"],
    calorias: 390,
    tempoPreparacao: 45,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-18'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["espanhol", "frutos-do-mar", "açafrão"]
  },
  {
    nome: "Jamón Ibérico",
    descricao: "Presunto ibérico curado com pão com tomate",
    preco: 38.00,
    categoria: "entrada",
    ingredientes: ["jamón ibérico", "pão", "tomate", "azeite", "alho"],
    alergenos: ["gluten"],
    calorias: 280,
    tempoPreparacao: 10,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-18'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["espanhol", "curado", "presunto"]
  },
  {
    nome: "Churros com Doce de Leite",
    descricao: "Churros crocantes recheados com doce de leite",
    preco: 10.00,
    categoria: "sobremesa",
    ingredientes: ["farinha", "água", "manteiga", "ovos", "doce de leite", "açúcar", "canela"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 280,
    tempoPreparacao: 30,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-18'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["espanhol", "frito", "doce"]
  },

  // September 19th - Friday
  {
    nome: "Bouillabaisse",
    descricao: "Sopa francesa de peixes com rouille e croutons",
    preco: 52.00,
    categoria: "prato-principal",
    ingredientes: ["peixes variados", "tomate", "erva-doce", "açafrão", "alho", "azeite", "rouille"],
    calorias: 320,
    tempoPreparacao: 60,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-19'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["francês", "sopa", "peixe"]
  },
  {
    nome: "Plateau de Fruits de Mer",
    descricao: "Bandeja de frutos do mar frescos com molhos",
    preco: 75.00,
    categoria: "entrada",
    ingredientes: ["ostras", "camarão", "caranguejo", "mexilhões", "limão", "molho mignonette"],
    alergenos: ["frutos-do-mar"],
    calorias: 220,
    tempoPreparacao: 20,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-19'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["francês", "fresco", "luxo"]
  },
  {
    nome: "Mille-feuille",
    descricao: "Folhado francês com creme pasteleiro e glacê",
    preco: 15.00,
    categoria: "sobremesa",
    ingredientes: ["massa folhada", "creme pasteleiro", "açúcar", "baunilha", "glacê"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 380,
    tempoPreparacao: 90,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-19'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["francês", "folhado", "creme"]
  },

  // September 20th - Saturday
  {
    nome: "Wagyu Grelhado",
    descricao: "Bife de wagyu grelhado com sal marinho e wasabi",
    preco: 120.00,
    categoria: "prato-principal",
    ingredientes: ["wagyu", "sal marinho", "wasabi", "shoyu", "gengibre"],
    calorias: 380,
    tempoPreparacao: 15,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-20'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["japonês", "premium", "wagyu"]
  },
  {
    nome: "Sashimi Variado",
    descricao: "Seleção de peixes crus frescos",
    preco: 45.00,
    categoria: "entrada",
    ingredientes: ["salmão", "atum", "peixe branco", "wasabi", "gengibre", "shoyu"],
    calorias: 180,
    tempoPreparacao: 15,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-20'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["japonês", "cru", "fresco"]
  },
  {
    nome: "Mochi de Chá Verde",
    descricao: "Doce japonês de arroz com recheio de chá verde",
    preco: 8.50,
    categoria: "sobremesa",
    ingredientes: ["farinha de arroz", "açúcar", "chá verde", "feijão doce"],
    calorias: 120,
    tempoPreparacao: 45,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-20'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["japonês", "arroz", "chá"]
  },

  // September 21st - Sunday
  {
    nome: "Leitão à Pururuca",
    descricao: "Leitão assado com pele crocante e farofa",
    preco: 38.00,
    categoria: "prato-principal",
    ingredientes: ["leitão", "alho", "sal grosso", "pimenta", "farofa", "laranja"],
    calorias: 520,
    tempoPreparacao: 180,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-21'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "assado", "crocante"]
  },
  {
    nome: "Mandioca Frita",
    descricao: "Mandioca crocante com molho de alho",
    preco: 12.00,
    categoria: "entrada",
    ingredientes: ["mandioca", "alho", "azeite", "sal", "salsa"],
    calorias: 180,
    tempoPreparacao: 20,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-21'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["brasileiro", "frito", "raiz"]
  },
  {
    nome: "Romeu e Julieta",
    descricao: "Queijo com goiabada e castanhas",
    preco: 9.00,
    categoria: "sobremesa",
    ingredientes: ["queijo minas", "goiabada", "castanhas"],
    alergenos: ["lactose", "nozes"],
    calorias: 220,
    tempoPreparacao: 5,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-21'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["brasileiro", "doce", "queijo"]
  },

  // September 22nd - Monday
  {
    nome: "Curry de Cordeiro",
    descricao: "Cordeiro cozido em curry aromático com arroz basmati",
    preco: 44.00,
    categoria: "prato-principal",
    ingredientes: ["cordeiro", "curry", "leite de coco", "gengibre", "alho", "arroz basmati", "coentro"],
    calorias: 420,
    tempoPreparacao: 60,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-22'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["indiano", "curry", "aromático"]
  },
  {
    nome: "Samosas",
    descricao: "Pastéis indianos fritos com recheio de legumes",
    preco: 16.00,
    categoria: "entrada",
    ingredientes: ["massa", "batata", "ervilha", "cebola", "especiarias", "óleo"],
    alergenos: ["gluten"],
    calorias: 200,
    tempoPreparacao: 30,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-22'),
    vegetariano: true,
    vegano: true,
    semGluten: false,
    tags: ["indiano", "frito", "especiarias"]
  },
  {
    nome: "Kulfi",
    descricao: "Sorvete indiano de pistache e cardamomo",
    preco: 9.50,
    categoria: "sobremesa",
    ingredientes: ["leite", "pistache", "cardamomo", "açúcar", "creme"],
    alergenos: ["lactose", "nozes"],
    calorias: 180,
    tempoPreparacao: 180,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-22'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["indiano", "gelado", "especiarias"]
  },

  // September 23rd - Tuesday
  {
    nome: "Tagine de Frango",
    descricao: "Frango marroquino cozido com damascos e amêndoas",
    preco: 36.00,
    categoria: "prato-principal",
    ingredientes: ["frango", "damascos", "amêndoas", "canela", "gengibre", "cebola", "couscous"],
    alergenos: ["nozes"],
    calorias: 380,
    tempoPreparacao: 75,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-23'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["marroquino", "doce-salgado", "especiarias"]
  },
  {
    nome: "Homus",
    descricao: "Pasta de grão-de-bico com tahine e azeite",
    preco: 14.00,
    categoria: "entrada",
    ingredientes: ["grão-de-bico", "tahine", "limão", "alho", "azeite", "páprica"],
    calorias: 150,
    tempoPreparacao: 20,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-23'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["árabe", "pasta", "saudável"]
  },
  {
    nome: "Baklava",
    descricao: "Doce árabe de massa filo com nozes e mel",
    preco: 12.00,
    categoria: "sobremesa",
    ingredientes: ["massa filo", "nozes", "mel", "manteiga", "canela"],
    alergenos: ["gluten", "nozes", "lactose"],
    calorias: 280,
    tempoPreparacao: 60,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-23'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["árabe", "mel", "crocante"]
  },

  // September 24th - Wednesday
  {
    nome: "Pad Thai",
    descricao: "Macarrão tailandês refogado com camarão e amendoim",
    preco: 28.00,
    categoria: "prato-principal",
    ingredientes: ["macarrão de arroz", "camarão", "amendoim", "molho de peixe", "tamarindo", "broto de feijão"],
    alergenos: ["frutos-do-mar", "nozes"],
    calorias: 350,
    tempoPreparacao: 25,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-24'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["tailandês", "refogado", "amendoim"]
  },
  {
    nome: "Tom Yum",
    descricao: "Sopa tailandesa picante com camarão e cogumelos",
    preco: 22.00,
    categoria: "entrada",
    ingredientes: ["camarão", "cogumelos", "capim-limão", "galanga", "pimenta", "limão"],
    alergenos: ["frutos-do-mar"],
    calorias: 120,
    tempoPreparacao: 20,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-24'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["tailandês", "picante", "sopa"]
  },
  {
    nome: "Mango Sticky Rice",
    descricao: "Arroz doce tailandês com manga e leite de coco",
    preco: 11.00,
    categoria: "sobremesa",
    ingredientes: ["arroz glutinoso", "manga", "leite de coco", "açúcar", "sal"],
    calorias: 220,
    tempoPreparacao: 45,
    diaDaSemana: "quarta",
    dataPreparacao: new Date('2025-09-24'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["tailandês", "manga", "coco"]
  },

  // September 25th - Thursday
  {
    nome: "Bibimbap",
    descricao: "Arroz coreano com legumes, carne e ovo frito",
    preco: 26.00,
    categoria: "prato-principal",
    ingredientes: ["arroz", "carne bovina", "cenoura", "espinafre", "broto de feijão", "ovo", "gochujang"],
    alergenos: ["ovos", "soja"],
    calorias: 420,
    tempoPreparacao: 35,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-25'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["coreano", "colorido", "nutritivo"]
  },
  {
    nome: "Kimchi",
    descricao: "Repolho fermentado coreano picante",
    preco: 8.00,
    categoria: "entrada",
    ingredientes: ["repolho", "pimenta coreana", "alho", "gengibre", "sal"],
    calorias: 40,
    tempoPreparacao: 180,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-25'),
    vegetariano: true,
    vegano: true,
    semGluten: true,
    tags: ["coreano", "fermentado", "probiótico"]
  },
  {
    nome: "Hotteok",
    descricao: "Panqueca coreana doce recheada com açúcar mascavo",
    preco: 7.50,
    categoria: "sobremesa",
    ingredientes: ["farinha", "açúcar mascavo", "canela", "amendoim", "fermento"],
    alergenos: ["gluten", "nozes"],
    calorias: 180,
    tempoPreparacao: 30,
    diaDaSemana: "quinta",
    dataPreparacao: new Date('2025-09-25'),
    vegetariano: true,
    vegano: true,
    semGluten: false,
    tags: ["coreano", "panqueca", "doce"]
  },

  // September 26th - Friday
  {
    nome: "Fish and Chips",
    descricao: "Peixe empanado com batatas fritas e molho tártaro",
    preco: 32.00,
    categoria: "prato-principal",
    ingredientes: ["peixe", "farinha", "cerveja", "batata", "molho tártaro", "ervilhas"],
    alergenos: ["gluten"],
    calorias: 480,
    tempoPreparacao: 25,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-26'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["inglês", "empanado", "tradicional"]
  },
  {
    nome: "Scotch Egg",
    descricao: "Ovo cozido envolvido em linguiça e empanado",
    preco: 18.00,
    categoria: "entrada",
    ingredientes: ["ovos", "linguiça", "farinha de rosca", "mostarda"],
    alergenos: ["ovos", "gluten"],
    calorias: 280,
    tempoPreparacao: 30,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-26'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["inglês", "empanado", "ovo"]
  },
  {
    nome: "Sticky Toffee Pudding",
    descricao: "Pudim inglês com molho de caramelo",
    preco: 12.50,
    categoria: "sobremesa",
    ingredientes: ["tâmaras", "farinha", "açúcar mascavo", "manteiga", "creme"],
    alergenos: ["gluten", "lactose"],
    calorias: 350,
    tempoPreparacao: 45,
    diaDaSemana: "sexta",
    dataPreparacao: new Date('2025-09-26'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["inglês", "caramelo", "úmido"]
  },

  // September 27th - Saturday
  {
    nome: "Churrasco Argentino",
    descricao: "Mix de carnes argentinas com chimichurri",
    preco: 58.00,
    categoria: "prato-principal",
    ingredientes: ["bife de chorizo", "morcilla", "chorizo", "chimichurri", "sal grosso"],
    calorias: 520,
    tempoPreparacao: 40,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-27'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["argentino", "grelhado", "chimichurri"]
  },
  {
    nome: "Empanadas",
    descricao: "Pastéis argentinos assados com recheio de carne",
    preco: 20.00,
    categoria: "entrada",
    ingredientes: ["massa", "carne moída", "cebola", "azeitonas", "ovo", "cominho"],
    alergenos: ["gluten", "ovos"],
    calorias: 250,
    tempoPreparacao: 45,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-27'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["argentino", "assado", "recheado"]
  },
  {
    nome: "Dulce de Leche",
    descricao: "Doce de leite argentino com biscoitos",
    preco: 8.00,
    categoria: "sobremesa",
    ingredientes: ["leite", "açúcar", "bicarbonato", "baunilha", "biscoitos"],
    alergenos: ["lactose", "gluten"],
    calorias: 200,
    tempoPreparacao: 120,
    diaDaSemana: "sabado",
    dataPreparacao: new Date('2025-09-27'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["argentino", "doce", "cremoso"]
  },

  // September 28th - Sunday
  {
    nome: "Coq au Vin",
    descricao: "Frango cozido no vinho tinto com cogumelos",
    preco: 38.00,
    categoria: "prato-principal",
    ingredientes: ["frango", "vinho tinto", "cogumelos", "bacon", "cebola", "cenoura", "ervas"],
    calorias: 420,
    tempoPreparacao: 90,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-28'),
    vegetariano: false,
    vegano: false,
    semGluten: true,
    tags: ["francês", "vinho", "rústico"]
  },
  {
    nome: "Soupe à l'Oignon",
    descricao: "Sopa francesa de cebola com queijo gratinado",
    preco: 18.00,
    categoria: "entrada",
    ingredientes: ["cebola", "caldo de carne", "vinho branco", "queijo gruyère", "pão"],
    alergenos: ["lactose", "gluten"],
    calorias: 220,
    tempoPreparacao: 45,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-28'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["francês", "gratinado", "aquecimento"]
  },
  {
    nome: "Clafoutis de Cereja",
    descricao: "Torta francesa rústica com cerejas",
    preco: 11.00,
    categoria: "sobremesa",
    ingredientes: ["cerejas", "ovos", "leite", "açúcar", "farinha", "baunilha"],
    alergenos: ["ovos", "lactose", "gluten"],
    calorias: 240,
    tempoPreparacao: 50,
    diaDaSemana: "domingo",
    dataPreparacao: new Date('2025-09-28'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["francês", "cereja", "rústico"]
  },

  // September 29th - Monday
  {
    nome: "Moussaka",
    descricao: "Lasanha grega com berinjela, carne e molho bechamel",
    preco: 34.00,
    categoria: "prato-principal",
    ingredientes: ["berinjela", "carne de cordeiro", "molho bechamel", "tomate", "queijo", "canela"],
    alergenos: ["lactose", "gluten"],
    calorias: 420,
    tempoPreparacao: 90,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-29'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["grego", "berinjela", "bechamel"]
  },
  {
    nome: "Tzatziki",
    descricao: "Molho grego de iogurte com pepino e alho",
    preco: 12.00,
    categoria: "entrada",
    ingredientes: ["iogurte grego", "pepino", "alho", "azeite", "endro", "limão"],
    alergenos: ["lactose"],
    calorias: 80,
    tempoPreparacao: 15,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-29'),
    vegetariano: true,
    vegano: false,
    semGluten: true,
    tags: ["grego", "refrescante", "iogurte"]
  },
  {
    nome: "Galaktoboureko",
    descricao: "Doce grego de massa filo com creme e calda",
    preco: 13.00,
    categoria: "sobremesa",
    ingredientes: ["massa filo", "leite", "ovos", "sêmola", "açúcar", "mel", "canela"],
    alergenos: ["gluten", "lactose", "ovos"],
    calorias: 300,
    tempoPreparacao: 60,
    diaDaSemana: "segunda",
    dataPreparacao: new Date('2025-09-29'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["grego", "creme", "mel"]
  },

  // September 30th - Tuesday
  {
    nome: "Wiener Schnitzel",
    descricao: "Escalope de vitela empanado austríaco",
    preco: 42.00,
    categoria: "prato-principal",
    ingredientes: ["vitela", "farinha", "ovos", "farinha de rosca", "manteiga", "limão"],
    alergenos: ["gluten", "ovos", "lactose"],
    calorias: 450,
    tempoPreparacao: 25,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-30'),
    vegetariano: false,
    vegano: false,
    semGluten: false,
    tags: ["austríaco", "empanado", "vitela"]
  },
  {
    nome: "Apfelstrudel",
    descricao: "Torta austríaca de maçã com massa folhada",
    preco: 14.00,
    categoria: "entrada",
    ingredientes: ["massa strudel", "maçã", "açúcar", "canela", "passas", "manteiga"],
    alergenos: ["gluten", "lactose"],
    calorias: 280,
    tempoPreparacao: 60,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-30'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["austríaco", "maçã", "folhado"]
  },
  {
    nome: "Sachertorte",
    descricao: "Bolo austríaco de chocolate com geleia de damasco",
    preco: 16.00,
    categoria: "sobremesa",
    ingredientes: ["chocolate", "ovos", "açúcar", "farinha", "geleia de damasco", "cobertura"],
    alergenos: ["gluten", "ovos", "lactose"],
    calorias: 380,
    tempoPreparacao: 90,
    diaDaSemana: "terca",
    dataPreparacao: new Date('2025-09-30'),
    vegetariano: true,
    vegano: false,
    semGluten: false,
    tags: ["austríaco", "chocolate", "damasco"]
  }
];

// Function to generate complete September menu
const generateSeptemberMenu = async () => {
  try {
    console.log('🍽️  Iniciando geração do cardápio de setembro...');
    
    // Clear existing September items first
    const deleteResult = await MenuItem.deleteMany({
      $or: [
        { $expr: { $eq: [{ $month: '$dataPreparacao' }, 9] } },
        { $expr: { $eq: [{ $month: '$createdAt' }, 9] } },
        { $expr: { $eq: [{ $month: '$updatedAt' }, 9] } }
      ]
    });
    
    console.log(`🗑️  Removidos ${deleteResult.deletedCount} itens existentes de setembro`);
    
    // Insert new September menu items
    const insertedItems = await MenuItem.insertMany(septemberMenuItems);
    console.log(`✅ ${insertedItems.length} novos pratos adicionados ao cardápio de setembro`);
    
    // Generate summary
    const summary = {
      totalItems: insertedItems.length,
      byCategory: {},
      byDay: {},
      averagePrice: 0
    };
    
    let totalPrice = 0;
    
    insertedItems.forEach(item => {
      // Count by category
      summary.byCategory[item.categoria] = (summary.byCategory[item.categoria] || 0) + 1;
      
      // Count by day
      summary.byDay[item.diaDaSemana] = (summary.byDay[item.diaDaSemana] || 0) + 1;
      
      // Sum prices
      totalPrice += item.preco;
    });
    
    summary.averagePrice = (totalPrice / insertedItems.length).toFixed(2);
    
    console.log('\n📊 RESUMO DO CARDÁPIO DE SETEMBRO:');
    console.log(`📈 Total de pratos: ${summary.totalItems}`);
    console.log(`💰 Preço médio: R$ ${summary.averagePrice}`);
    console.log('\n🍽️  Por categoria:');
    Object.entries(summary.byCategory).forEach(([categoria, count]) => {
      console.log(`   ${categoria}: ${count} pratos`);
    });
    console.log('\n📅 Por dia da semana:');
    Object.entries(summary.byDay).forEach(([dia, count]) => {
      console.log(`   ${dia}: ${count} pratos`);
    });
    
    console.log('\n🎉 Cardápio de setembro gerado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar cardápio:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await generateSeptemberMenu();
  } catch (error) {
    console.error('❌ Erro na execução:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateSeptemberMenu, septemberMenuItems };