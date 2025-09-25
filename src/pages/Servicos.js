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

    </div>
  );
};

export default Servicos;