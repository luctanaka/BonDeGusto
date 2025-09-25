import React from 'react';
import { PhoneIcon, ClockIcon, EnvelopeIcon, InstagramLogoIcon, FacebookLogoIcon } from '@phosphor-icons/react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold text-primary">Bondegusto</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Sabores autênticos que despertam memórias e criam momentos especiais. 
              Venha descobrir a verdadeira essência da boa comida.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/bondegusto" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
                aria-label="Instagram"
              >
                <InstagramLogoIcon size={24} />
              </a>
              <a 
                href="https://facebook.com/bondegusto" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
                aria-label="Facebook"
              >
                <FacebookLogoIcon size={24} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contato</h4>
            <div className="space-y-2">
              {/* <div className="flex items-start space-x-3">
                <MapPinIcon size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="text-gray-300">
                  <p>Rua dos Sabores, 123</p>
                  <p>Centro - São Paulo, SP</p>
                  <p>CEP: 01234-567</p>
                </div>
              </div> */}
              
              <div className="flex items-center space-x-3">
                <PhoneIcon size={20} className="text-primary flex-shrink-0" />
                <a 
                  href="https://wa.me/5581994346925" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors duration-200"
                >
                  (81) 99434-6925
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon size={20} className="text-primary flex-shrink-0" />
                <a 
                  href="mailto:administrativo@bondegusto.onmicrosoft.com" 
                  className="text-gray-300 hover:text-primary transition-colors duration-200"
                >
                  administrativo@bondegusto.onmicrosoft.com
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Horário de Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <ClockIcon size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="text-gray-300">
                  <div className="flex justify-between">
                    <span>Segunda - Sexta:</span>
                    <span className="ml-2">11h - 22h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span className="ml-2">11h - 23h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span className="ml-2">11h - 21h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Bondegusto. Todos os direitos reservados.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <button 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => alert('Política de Privacidade em desenvolvimento')}
              >
                Política de Privacidade
              </button>
              <button 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => alert('Termos de Uso em desenvolvimento')}
              >
                Termos de Uso
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;