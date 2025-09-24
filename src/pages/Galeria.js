import React, { useState } from 'react';

const Galeria = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { id: 'todos', name: 'Todos', icon: 'ph-grid-four' },
    { id: 'pratos', name: 'Pratos', icon: 'ph-bowl-food' },
    { id: 'ambiente', name: 'Ambiente', icon: 'ph-house' },
    { id: 'eventos', name: 'Eventos', icon: 'ph-calendar-check' },
    { id: 'equipe', name: 'Equipe', icon: 'ph-users' }
  ];

  const images = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Prato principal gourmet',
      category: 'pratos',
      title: 'Salmão Grelhado'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Interior do restaurante',
      category: 'ambiente',
      title: 'Salão Principal'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Prato de massa italiana',
      category: 'pratos',
      title: 'Pasta Italiana'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Mesa decorada para evento',
      category: 'eventos',
      title: 'Evento Corporativo'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Sobremesa especial',
      category: 'pratos',
      title: 'Tiramisu da Casa'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Área externa do restaurante',
      category: 'ambiente',
      title: 'Terraço'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Chef preparando prato',
      category: 'equipe',
      title: 'Chef Executivo'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Casamento no restaurante',
      category: 'eventos',
      title: 'Casamento'
    },
    {
      id: 9,
      src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Entrada do restaurante',
      category: 'ambiente',
      title: 'Entrada Principal'
    }
  ];

  const filteredImages = selectedCategory === 'todos' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Galeria de Fotos
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Conheça nosso ambiente, pratos especiais e momentos únicos
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <i className={`ph ${category.icon} mr-2`}></i>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map(image => (
          <div 
            key={image.id}
            className="group cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            onClick={() => openModal(image)}
          >
            <div className="relative overflow-hidden">
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <i className="ph ph-magnifying-glass-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {image.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <i className="ph ph-x text-xl"></i>
            </button>
            
            {/* Navigation Buttons */}
            <button 
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <i className="ph ph-caret-left text-xl"></i>
            </button>
            
            <button 
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <i className="ph ph-caret-right text-xl"></i>
            </button>
            
            {/* Image */}
            <img 
              src={selectedImage.src} 
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-1">{selectedImage.title}</h3>
              <p className="text-sm opacity-80">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <i className="ph ph-images text-6xl text-slate-400 dark:text-slate-600 mb-4"></i>
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Nenhuma imagem encontrada
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            Tente selecionar uma categoria diferente
          </p>
        </div>
      )}
    </div>
  );
};

export default Galeria;