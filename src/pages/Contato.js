import React, { useState } from 'react';

const Contato = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: 'ph-map-pin',
      title: 'Endereço',
      content: 'Rua Anezia Mendes, 246\nJaboatão dos Guararapes-PE\nCEP: 54325-480'
    },
    {
      icon: 'ph-phone',
      title: 'Telefone',
      content: '(81) 99434-6925'
    },
    {
      icon: 'ph-envelope',
      title: 'Email',
      content: 'administrativo@bondegusto.onmicrosoft.com'
    },
    {
      icon: 'ph-clock',
      title: 'Horário de Funcionamento',
      content: 'Segunda a Sexta: 11h às 23h'
    }
  ];

  const socialLinks = [
    { icon: 'ph-instagram-logo', name: 'Instagram', url: '#' },
    { icon: 'ph-facebook-logo', name: 'Facebook', url: '#' },
    { icon: 'ph-whatsapp-logo', name: 'WhatsApp', url: '#' },
    { icon: 'ph-twitter-logo', name: 'Twitter', url: '#' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Entre em Contato
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Estamos aqui para atendê-lo. Entre em contato conosco para reservas, dúvidas ou sugestões
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Envie uma Mensagem
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assunto *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione o assunto</option>
                  <option value="reserva">Reserva</option>
                  <option value="evento">Evento</option>
                  <option value="delivery">Delivery</option>
                  <option value="reclamacao">Reclamação</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                placeholder="Digite sua mensagem aqui..."
              ></textarea>
            </div>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <i className="ph ph-check-circle text-lg mr-2"></i>
                  <span>Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
                </div>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <i className="ph ph-warning-circle text-lg mr-2"></i>
                  <span>Erro ao enviar mensagem. Tente novamente.</span>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
              {isSubmitting ? (
                <i className="ph ph-spinner-gap text-lg ml-2 animate-spin"></i>
              ) : (
                <i className="ph ph-paper-plane-tilt text-lg ml-2"></i>
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Informações de Contato
            </h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <i className={`ph ${info.icon} text-xl text-primary`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      {info.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      {info.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Redes Sociais
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                >
                  <i className={`ph ${social.icon} text-2xl text-primary mr-3 group-hover:scale-110 transition-transform`}></i>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Localização
            </h2>
            
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <i className="ph ph-map-pin text-4xl text-slate-400 dark:text-slate-500 mb-2"></i>
                <p className="text-slate-500 dark:text-slate-400">
                  Mapa interativo em breve
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;