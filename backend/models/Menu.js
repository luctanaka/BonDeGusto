const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do item é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode exceder 500 caracteres']
  },
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: {
      values: ['entrada', 'prato-principal', 'sobremesa', 'bebida', 'especial'],
      message: 'Categoria deve ser: entrada, prato-principal, sobremesa, bebida ou especial'
    }
  },
  ingredientes: [{
    type: String,
    trim: true
  }],
  alergenos: [{
    type: String,
    enum: ['gluten', 'lactose', 'nozes', 'frutos-do-mar', 'ovos', 'soja'],
    trim: true
  }],
  calorias: {
    type: Number,
    min: [0, 'Calorias não podem ser negativas']
  },
  tempoPreparacao: {
    type: Number, // em minutos
    min: [1, 'Tempo de preparação deve ser pelo menos 1 minuto'],
    max: [180, 'Tempo de preparação não pode exceder 180 minutos']
  },
  disponivel: {
    type: Boolean,
    default: true
  },
  imagem: {
    type: String,
    trim: true
  },
  diaDaSemana: {
    type: String,
    enum: {
      values: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'],
      message: 'Dia da semana deve ser: segunda, terca, quarta, quinta, sexta, sabado ou domingo'
    }
  },
  dataPreparacao: {
    type: Date,
    required: false,
    index: true
  },
  ofertaEspecial: {
    type: Boolean,
    default: false
  },
  vegetariano: {
    type: Boolean,
    default: false
  },
  vegano: {
    type: Boolean,
    default: false
  },
  semGluten: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
menuItemSchema.index({ categoria: 1 });
menuItemSchema.index({ diaDaSemana: 1 });
menuItemSchema.index({ disponivel: 1 });
menuItemSchema.index({ vegetariano: 1 });
menuItemSchema.index({ vegano: 1 });
menuItemSchema.index({ semGluten: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ nome: 'text', descricao: 'text' }); // Text search

// Virtual for dietary restrictions summary
menuItemSchema.virtual('dietaryInfo').get(function() {
  return {
    vegetariano: this.vegetariano,
    vegano: this.vegano,
    semGluten: this.semGluten,
    alergenos: this.alergenos
  };
});

// Static method to get menu by day
menuItemSchema.statics.getMenuByDay = async function(dayOfWeek) {
  return await this.find({
    diaDaSemana: dayOfWeek,
    disponivel: true
  }).sort({ dataPreparacao: -1, categoria: 1, nome: 1 });
};

// Static method to get weekly menu
menuItemSchema.statics.getWeeklyMenu = async function() {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const weeklyMenu = {};
  
  for (const day of days) {
    weeklyMenu[day] = await this.getMenuByDay(day);
  }
  return weeklyMenu;
};

// Static method to search menu items
menuItemSchema.statics.searchItems = async function(query, filters = {}) {
  const searchQuery = {
    disponivel: true,
    ...filters
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
    return await this.find(searchQuery).sort({ score: { $meta: 'textScore' } });
  }
  
  return await this.find(searchQuery).sort({ dataPreparacao: -1, categoria: 1, nome: 1 });
};

// Pre-save middleware
menuItemSchema.pre('save', function(next) {
  // If item is vegan, it's automatically vegetarian
  if (this.vegano) {
    this.vegetariano = true;
  }
  
  // Ensure tags are lowercase
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);