import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'entrada',
    imagem: '',
    ativo: true,
    ordem: 0
  });

  const categories = [
    { value: 'entrada', label: 'Entradas' },
    { value: 'prato-principal', label: 'Pratos Principais' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'especial', label: 'Especiais' }
  ];

  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await adminService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      showToast('Erro ao carregar itens do menu', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

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
      if (editingItem) {
        await adminService.updateMenuItem(editingItem._id, formData);
        showToast('Item atualizado com sucesso!', 'success');
      } else {
        await adminService.createMenuItem(formData);
        showToast('Item criado com sucesso!', 'success');
      }
      
      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast(error.message || 'Erro ao salvar item', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      categoria: item.categoria,
      imagem: item.imagem || '',
      ativo: item.ativo,
      ordem: item.ordem || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }
    
    try {
      await adminService.deleteMenuItem(id);
      showToast('Item excluído com sucesso!', 'success');
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast(error.message || 'Erro ao excluir item', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoria: 'entrada',
      imagem: '',
      ativo: true,
      ordem: 0
    });
    setEditingItem(null);
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

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciamento do Cardápio</h2>
            <p className="text-gray-600 mt-1">Gerencie os itens do seu cardápio</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <i className="ph ph-plus mr-2"></i>
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Editar Item' : 'Adicionar Item'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ph ph-x text-2xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Prato
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      name="preco"
                      value={formData.preco}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
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
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    name="imagem"
                    value={formData.imagem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Item ativo (visível no cardápio)
                  </label>
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
                    {editingItem ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="space-y-6">
        {categories.map(category => {
          const items = groupedItems[category.value] || [];
          if (items.length === 0) return null;

          return (
            <div key={category.value} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {category.label} ({items.length})
              </h3>
              
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {item.imagem && (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.nome}</h4>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-amber-600">
                            R$ {parseFloat(item.preco).toFixed(2)}
                          </span>
                          {!item.ativo && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <i className="ph ph-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <i className="ph ph-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {menuItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="ph ph-fork-knife text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item no cardápio</h3>
          <p className="text-gray-600 mb-4">Comece adicionando o primeiro item ao seu cardápio.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Adicionar Primeiro Item
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;