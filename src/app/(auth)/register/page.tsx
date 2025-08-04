import RegisterForm from './register-form';
import { registerUser } from './actions';

interface RegisterPageProps {
  searchParams: {
    plan?: string;
    scheduling?: string;
    price?: string;
  };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const planDetails = searchParams.plan && searchParams.scheduling && searchParams.price ? {
    classCount: parseInt(searchParams.plan),
    schedulingOption: searchParams.scheduling as 'recurring' | 'on-demand',
    totalPrice: parseFloat(searchParams.price)
  } : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Conta
          </h2>
          {planDetails && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Seu plano selecionado:
              </h3>
              <p className="text-sm text-blue-700">
                {planDetails.classCount} aula{planDetails.classCount > 1 ? 's' : ''} • 
                {planDetails.schedulingOption === 'recurring' ? ' Aula Fixa Semanal' : ' Aulas Sob Demanda'} • 
                R$ {planDetails.totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Após criar sua conta, você será direcionado para o pagamento.
              </p>
            </div>
          )}
        </div>
        <RegisterForm registerAction={registerUser} planDetails={planDetails} />
      </div>
    </div>
  );
}
