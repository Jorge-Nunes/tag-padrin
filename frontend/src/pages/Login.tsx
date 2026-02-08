import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { MapPin, Lock, Mail, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
            <MapPin className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Tag Padrin
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Gerenciamento inteligente de rastreadores
          </p>
        </div>

        <Card className="shadow-2xl border-gray-100 dark:border-slate-800">
          <CardBody className="p-8 md:p-10">
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Senha
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="strong"
                  size="lg"
                  className="w-full shadow-lg shadow-gray-200 dark:shadow-none"
                  disabled={loading}
                >
                  {loading ? 'Autenticando...' : 'Acessar Sistema'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} NCTY • Gestão de Frotas
        </p>
      </div>
    </div>
  );
}
