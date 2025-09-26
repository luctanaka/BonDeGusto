import React, { useState } from 'react';
import useUnits from '../hooks/useUnits';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    unit: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  
  const { units, loading: unitsLoading } = useUnits();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Por favor, preencha seu email');
      return;
    }
    
    if (!formData.password) {
      setError('Por favor, preencha sua senha');
      return;
    }

    // Unit is optional - the backend will determine if user is admin
    if (!formData.unit) {
      // Allow login without unit - backend will handle admin detection
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(formData.email, formData.password, formData.unit || null);
      
      setFormData({ unit: '', email: '', password: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ unit: '', email: '', password: '' });
    setError('');
    setShowPassword(false);
    onClose();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Login
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <i className="ph ph-x text-xl text-slate-600 dark:text-slate-400"></i>
              </button>
            </div>
            

            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Unit Selection */}
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Unidade
                </label>
                <select 
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  disabled={unitsLoading}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">{unitsLoading ? 'Carregando...' : 'Escolha sua unidade (opcional para admins)'}</option>
                  {units.map(unit => (
                      <option key={unit.key} value={unit.key}>
                        {unit.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              
              {/* Email */}
               <div>
                 <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                   Email ou Nome de Usuário
                 </label>
                 <input 
                   type="text" 
                   id="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   required 
                   placeholder="Digite seu email ou nome de usuário"
                   className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                 />
               </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white pr-12" 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-xl`}></i>
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <i className="ph ph-warning-circle text-lg mr-2"></i>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
                {isLoading && (
                  <i className="ph ph-spinner-gap text-lg ml-2 animate-spin"></i>
                )}
              </button>
              
              {/* Login only - No registration or password reset for security */}
            </form>
          </div>
        </div>

       </div>
     </div>
   );
};

export default LoginModal;