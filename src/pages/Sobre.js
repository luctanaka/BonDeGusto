import React from 'react';

const Sobre = () => {
  const values = [
    {
      icon: 'ph-heart',
      title: 'Paixão',
      description: 'Fazemos tudo com amor e dedicação, desde a seleção dos ingredientes até o atendimento ao cliente.'
    },
    {
      icon: 'ph-medal',
      title: 'Qualidade',
      description: 'Comprometemo-nos com a excelência em cada prato, utilizando apenas os melhores ingredientes.'
    },
    {
      icon: 'ph-handshake',
      title: 'Tradição',
      description: 'Preservamos receitas familiares e técnicas culinárias tradicionais passadas de geração em geração.'
    },
    {
      icon: 'ph-leaf',
      title: 'Sustentabilidade',
      description: 'Valorizamos fornecedores locais e práticas sustentáveis em nossa operação diária.'
    }
  ];

  const timeline = [
    {
      year: '2003',
      title: 'Fundação',
      description: 'O Bondegusto nasce como um pequeno restaurante familiar no coração de São Paulo.'
    },
    {
      year: '2008',
      title: 'Expansão',
      description: 'Primeira reforma e ampliação do espaço, dobrando nossa capacidade de atendimento.'
    },
    {
      year: '2012',
      title: 'Reconhecimento',
      description: 'Recebemos nosso primeiro prêmio de "Melhor Restaurante Regional" da cidade.'
    },
    {
      year: '2016',
      title: 'Modernização',
      description: 'Implementação de tecnologias modernas e renovação completa do ambiente.'
    },
    {
      year: '2020',
      title: 'Delivery',
      description: 'Lançamento do serviço de delivery, adaptando-nos aos novos tempos.'
    },
    {
      year: '2024',
      title: 'Presente',
      description: 'Continuamos inovando e mantendo nossa tradição de excelência gastronômica.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Sobre o Bondegusto
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Conheça nossa história, valores e a equipe que faz a diferença em cada experiência gastronômica
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-orange-100 dark:from-primary/20 dark:to-slate-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f97316\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Quem Somos
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              O Bondegusto é mais que um restaurante - é um lugar onde tradições culinárias se encontram 
              com a inovação contemporânea. Desde 2003, nossa missão é proporcionar experiências 
              gastronômicas únicas que despertam os sentidos e criam memórias afetivas.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Acreditamos que uma boa refeição vai além do sabor: é sobre o ambiente, o atendimento 
              e a conexão humana que se cria ao redor da mesa.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Interior do restaurante" 
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ph ph-target text-3xl text-primary"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Missão</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Oferecer experiências gastronômicas excepcionais, combinando tradição culinária com 
            inovação, em um ambiente acolhedor que celebra a cultura da boa mesa.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ph ph-eye text-3xl text-primary"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Visão</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Ser reconhecido como referência em gastronomia regional, expandindo nossa presença 
            e mantendo a excelência que nos caracteriza há mais de duas décadas.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ph ph-scales text-3xl text-primary"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Valores</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Paixão pela culinária, compromisso com a qualidade, respeito às tradições e 
            responsabilidade social e ambiental em todas as nossas ações.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center mb-12">
          Nossos Valores
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <i className={`ph ${value.icon} text-3xl text-primary`}></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center mb-12">
          Nossa História
        </h2>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/20 h-full hidden md:block"></div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Timeline Dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
                </div>
                
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center mb-12">
          Nossa Equipe
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Statistics
      <section className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-8 md:p-12 text-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Bondegusto em Números
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2">21</div>
            <div className="text-lg opacity-90">Anos de Tradição</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2">50k+</div>
            <div className="text-lg opacity-90">Clientes Satisfeitos</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
            <div className="text-lg opacity-90">Pratos no Cardápio</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2">25</div>
            <div className="text-lg opacity-90">Colaboradores</div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Sobre;