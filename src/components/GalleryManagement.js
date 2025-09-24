import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'ambiente',
    url: '',
    ativo: true,
    ordem: 0
  });
  const [filter, setFilter] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);

  const categories = [
    { value: 'ambiente', label: 'Ambiente' },
    { value: 'pratos', label: 'Pratos' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'equipe', label: 'Equipe' },
    { value: 'outros', label: 'Outros' }
  ];

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const imagesData = await adminService.getGalleryImages();
      setImages(imagesData);
    } catch (error) {
      console.error('Error loading images:', error);
      showToast('Erro ao carregar imagens', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingImage) {
        await adminService.updateGalleryImage(editingImage._id, formData);
        showToast('Imagem atualizada com sucesso!', 'success');
      } else {
        await adminService.createGalleryImage(formData);
        showToast('Imagem adicionada com sucesso!', 'success');
      }
      
      resetForm();
      loadImages();
    } catch (error) {
      console.error('Error saving image:', error);
      showToast(error.message || 'Erro ao salvar imagem', 'error');
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      titulo: image.titulo,
      descricao: image.descricao || '',
      categoria: image.categoria,
      url: image.url,
      ativo: image.ativo,
      ordem: image.ordem || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }
    
    try {
      await adminService.deleteGalleryImage(id);
      showToast('Imagem excluída com sucesso!', 'success');
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast(error.message || 'Erro ao excluir imagem', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedImages.length} imagem(ns)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedImages.map(id => adminService.deleteGalleryImage(id)));
      showToast(`${selectedImages.length} imagem(ns) excluída(s) com sucesso!`, 'success');
      setSelectedImages([]);
      loadImages();
    } catch (error) {
      console.error('Error bulk deleting images:', error);
      showToast('Erro ao excluir imagens', 'error');
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    const filteredImageIds = filteredImages.map(img => img._id);
    setSelectedImages(prev => 
      prev.length === filteredImageIds.length ? [] : filteredImageIds
    );
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: 'ambiente',
      url: '',
      ativo: true,
      ordem: 0
    });
    setEditingImage(null);
    setShowForm(false);
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-x-circle';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="ph ${icon} text-lg mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const filteredImages = images.filter(image => {
    return filter === 'all' || image.categoria === filter;
  });

  const groupedImages = filteredImages.reduce((acc, image) => {
    if (!acc[image.categoria]) {
      acc[image.categoria] = [];
    }
    acc[image.categoria].push(image);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciamento da Galeria</h2>
            <p className="text-gray-600 mt-1">Gerencie as imagens da sua galeria</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <i className="ph ph-plus mr-2"></i>
            Adicionar Imagem
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{images.length}</div>
            <div className="text-sm text-blue-800">Total de Imagens</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {images.filter(img => img.ativo).length}
            </div>
            <div className="text-sm text-green-800">Ativas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {images.filter(img => img.categoria === 'pratos').length}
            </div>
            <div className="text-sm text-yellow-800">Pratos</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {images.filter(img => img.categoria === 'ambiente').length}
            </div>
            <div className="text-sm text-purple-800">Ambiente</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({images.length})
            </button>
            {categories.map(category => {
              const count = images.filter(img => img.categoria === category.value).length;
              return (
                <button
                  key={category.value}
                  onClick={() => setFilter(category.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === category.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({count})
                </button>
              );
            })}
          </div>
          
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedImages.length} selecionada(s)
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              >
                <i className="ph ph-trash mr-1"></i>
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingImage ? 'Editar Imagem' : 'Adicionar Imagem'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ph ph-x text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                  />
                  {formData.url && (
                    <div className="mt-2">
                      <img
                        src={formData.url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Descrição opcional da imagem"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordem
                    </label>
                    <input
                      type="number"
                      name="ordem"
                      value={formData.ordem}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Imagem ativa (visível na galeria)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    {editingImage ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="space-y-6">
        {filter === 'all' ? (
          categories.map(category => {
            const categoryImages = groupedImages[category.value] || [];
            if (categoryImages.length === 0) return null;

            return (
              <div key={category.value} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.label} ({categoryImages.length})
                  </h3>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    {selectedImages.length === filteredImages.length ? 'Desmarcar' : 'Selecionar'} Todas
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoryImages.map(image => (
                    <div key={image._id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <button
                              onClick={() => handleEdit(image)}
                              className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                              title="Editar"
                            >
                              <i className="ph ph-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(image._id)}
                              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                              title="Excluir"
                            >
                              <i className="ph ph-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.includes(image._id)}
                            onChange={() => handleImageSelect(image._id)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        {/* Status Badge */}
                        {!image.ativo && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              Inativa
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {image.titulo}
                        </h4>
                        {image.descricao && (
                          <p className="text-xs text-gray-600 truncate">
                            {image.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {categories.find(c => c.value === filter)?.label} ({filteredImages.length})
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                {selectedImages.length === filteredImages.length ? 'Desmarcar' : 'Selecionar'} Todas
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map(image => (
                <div key={image._id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => handleEdit(image)}
                          className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                          title="Editar"
                        >
                          <i className="ph ph-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(image._id)}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                          title="Excluir"
                        >
                          <i className="ph ph-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image._id)}
                        onChange={() => handleImageSelect(image._id)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    {!image.ativo && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          Inativa
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {image.titulo}
                    </h4>
                    {image.descricao && (
                      <p className="text-xs text-gray-600 truncate">
                        {image.descricao}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="ph ph-image text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Nenhuma imagem na galeria' : `Nenhuma imagem em ${categories.find(c => c.value === filter)?.label}`}
          </h3>
          <p className="text-gray-600 mb-4">
            Comece adicionando imagens à sua galeria.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Adicionar Primeira Imagem
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;