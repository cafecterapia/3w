import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | Portal do Aluno',
    default: 'Portal do Aluno - Planos e Aulas',
  },
  description: 'Escolha seu plano ideal e comece sua jornada de bem-estar conosco.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Portal do Aluno
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link 
                href="/plans" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Planos
              </Link>
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900"
              >
                Entrar
              </Link>
              <Link 
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Criar Conta
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Portal do Aluno
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">
                Sua plataforma completa para gerenciar aulas, pagamentos e muito mais. 
                Flexibilidade e qualidade em cada sessão.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Planos
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/plans?classes=1" className="text-gray-600 hover:text-gray-900">
                    Aula Avulsa
                  </Link>
                </li>
                <li>
                  <Link href="/plans?classes=4" className="text-gray-600 hover:text-gray-900">
                    Pacote Mensal
                  </Link>
                </li>
                <li>
                  <Link href="/plans?classes=8" className="text-gray-600 hover:text-gray-900">
                    Plano Intensivo
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Suporte
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/support" className="text-gray-600 hover:text-gray-900">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Portal do Aluno. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
