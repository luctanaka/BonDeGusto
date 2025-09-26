import React from 'react';

const Entrada = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative bg-gradient-to-br from-primary/10 to-orange-100 dark:from-primary/20 dark:to-slate-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f97316\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="relative p-8 md:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6">
              Bem-vindo ao <span className="text-primary">Bondegusto</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8">
              Onde cada refeição é uma experiência única de sabor e tradição
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg">
                <i className="ph ph-bowl-food mr-2"></i>
                Ver Cardápio
              </button>
              <button className="bg-white/80 hover:bg-white text-slate-800 font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg backdrop-blur-sm">
                <i className="ph ph-phone mr-2"></i>
                Fazer Reserva
              </button>
            </div> */}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Nossa História
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
               Com 12 anos de experiência no mercado de refeições coletivas, dedicamo-nos a
              oferecer serviços de alta qualidade, sempre priorizando a satisfação e o bem-estar
              de nossos clientes. A partir de 2024, sob nova administração, buscamos como nosso
              compromisso além da alimentação: Buscamos proporcionar uma experiência  
              resgatando o sabor caseiro em cada refeição.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
               Além disso, zelamos rigorosamente
              pela segurança alimentar, garantindo não apenas refeições saborosas, mas também
              seguras e nutritivas. Cada detalhe é pensado com carinho, pois acreditamos que a
              comida tem o poder de conectar, confortar e transformar momentos em lembranças
              especiais.

            </p>
            {/* <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">20+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Anos de Tradição</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">50k+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Clientes Satisfeitos</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Pratos Especiais</div>
              </div>
            </div> */}
          </div>
          <div className="relative h-64 md:h-auto">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Interior do restaurante" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <i className="ph ph-chef-hat text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Time Experiente</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Nossa time possui experiência em culinária tradicional e contemporânea.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <i className="ph ph-leaf text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Ingredientes Frescos</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Selecionamos cuidadosamente os melhores ingredientes locais para garantir qualidade e sabor.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <i className="ph ph-heart text-3xl text-primary"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Feito com Amor</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Cada prato é preparado com carinho e atenção aos detalhes, como uma refeição em família.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Entrada;