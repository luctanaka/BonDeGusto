import React from 'react';

const Servicos = () => {
  const services = [
    {
      icon: 'ph-utensils',
      title: 'Restaurante',
      description: 'Ambiente aconchegante com pratos tradicionais e contemporâneos preparados com ingredientes frescos.',
      features: ['Cardápio variado', 'Ambiente climatizado', 'Wi-Fi gratuito', 'Estacionamento']
    },
    {
      icon: 'ph-truck',
      title: 'Delivery',
      description: 'Entregamos nossos pratos especiais no conforto da sua casa com rapidez e qualidade.',
      features: ['Entrega rápida', 'Embalagem térmica', 'Rastreamento online', 'Taxa grátis acima de R$ 50']
    },
    {
      icon: 'ph-calendar-check',
      title: 'Eventos',
      description: 'Organizamos eventos especiais, aniversários, confraternizações e celebrações corporativas.',
      features: ['Cardápio personalizado', 'Decoração inclusa', 'Serviço de garçons', 'Som ambiente']
    },
    {
      icon: 'ph-graduation-cap',
      title: 'Buffet',
      description: 'Serviço completo de buffet para casamentos, formaturas e grandes celebrações.',
      features: ['Variedade de pratos', 'Serviço completo', 'Decoração temática', 'Equipe especializada']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Nossos Serviços
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Oferecemos uma gama completa de serviços gastronômicos para atender todas as suas necessidades
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                  <i className={`ph ${service.icon} text-3xl text-primary`}></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                  Características:
                </h4>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-600 dark:text-slate-300">
                      <i className="ph ph-check-circle text-primary mr-3"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Solicitar Orçamento
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para uma experiência única?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Entre em contato conosco e descubra como podemos tornar seu evento inesquecível
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
            <i className="ph ph-phone mr-2"></i>
            Ligar Agora
          </button>
          <button className="bg-transparent border-2 border-white hover:bg-white hover:text-primary font-semibold py-3 px-8 rounded-lg transition-colors">
            <i className="ph ph-envelope mr-2"></i>
            Enviar Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Servicos;