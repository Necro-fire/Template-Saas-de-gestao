import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, UserCog, Lock, Mail, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jotsLogo from '@/assets/jots-logo.png';

export default function Login() {
  const [tab, setTab] = useState<'admin' | 'funcionario'>('admin');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [setupNome, setSetupNome] = useState('');
  const [checkingSetup, setCheckingSetup] = useState(true);
  const navigate = useNavigate();

  // Auto-detect if system needs first-time setup
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        setIsSetup(count === 0 || count === null);
      } catch {
        // If error, assume setup not needed
        setIsSetup(false);
      }
      setCheckingSetup(false);
    };
    checkSetup();
  }, []);

  const handleAdminLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error('E-mail ou senha inválidos');
    } else {
      navigate('/');
    }
  };

  const handleEmployeeLogin = async () => {
    setLoading(true);
    try {
      const { data, error: lookupError } = await supabase.functions.invoke('auth-api', {
        body: { action: 'lookup', codigo_acesso: codigo },
      });

      if (lookupError || data?.error) {
        toast.error(data?.error || 'Código de acesso não encontrado');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password,
      });

      if (error) {
        toast.error('Senha inválida');
      } else {
        navigate('/');
      }
    } catch {
      toast.error('Erro ao conectar');
    }
    setLoading(false);
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-api', {
        body: { action: 'setup', email, password, nome: setupNome },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Erro ao configurar');
        setLoading(false);
        return;
      }
      toast.success('Administrador criado com sucesso!');
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError) navigate('/');
    } catch {
      toast.error('Erro ao configurar');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSetup) return handleSetup();
    if (tab === 'admin') return handleAdminLogin();
    return handleEmployeeLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[hsl(221,83%,18%)] via-[hsl(221,83%,28%)] to-[hsl(221,70%,42%)]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img src={jotsLogo} alt="Jots" className="h-14 w-14 rounded-xl shadow-lg" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Jots Distribuidora</h1>
            <p className="text-white/50 text-sm">
              {isSetup ? 'Configure o primeiro administrador' : 'Acesse sua conta para continuar'}
            </p>
          </div>

          {/* Tabs */}
          {!isSetup && (
            <div className="flex bg-white/10 rounded-xl p-1 gap-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === 'admin'
                    ? 'bg-white text-[hsl(221,83%,28%)] shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="h-4 w-4" />
                Administrador
              </button>
              <button
                type="button"
                onClick={() => setTab('funcionario')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === 'funcionario'
                    ? 'bg-white text-[hsl(221,83%,28%)] shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCog className="h-4 w-4" />
                Funcionário
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSetup && (
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Nome completo</Label>
                <div className="relative">
                  <UserCog className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    value={setupNome}
                    onChange={(e) => setSetupNome(e.target.value)}
                    placeholder="Seu nome"
                    className="pl-10 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-white/30 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            )}

            {(tab === 'admin' || isSetup) && (
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    className="pl-10 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-white/30 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            )}

            {tab === 'funcionario' && !isSetup && (
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Código de Acesso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="EX: FUNC001"
                    className="pl-10 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-white/30 focus-visible:ring-offset-0 uppercase"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/25 rounded-xl focus-visible:ring-white/30 focus-visible:ring-offset-0"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-white text-[hsl(221,83%,28%)] hover:bg-white/90 font-semibold text-base shadow-xl shadow-black/20 transition-all duration-200"
            >
              {loading ? 'Entrando...' : isSetup ? 'Configurar Sistema' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center">
            {!isSetup ? (
              <button
                type="button"
                onClick={() => setIsSetup(true)}
                className="text-white/30 hover:text-white/50 text-xs transition-colors"
              >
                Primeiro acesso? Configurar administrador
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSetup(false)}
                className="text-white/30 hover:text-white/50 text-xs transition-colors"
              >
                ← Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right — Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[hsl(221,83%,50%)] via-[hsl(221,70%,42%)] to-[hsl(221,83%,32%)] items-center justify-center relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-16 right-16 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-24 left-12 w-56 h-56 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/3 left-1/4 w-36 h-36 rounded-3xl bg-white/[0.04] rotate-45" />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-2xl bg-white/[0.06] -rotate-12" />

        <div className="relative z-10 text-center space-y-8 px-12">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
            <Shield className="h-14 w-14 text-white/90" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white tracking-tight">Sistema de Gestão</h2>
            <p className="text-white/50 text-lg max-w-sm mx-auto leading-relaxed">
              Controle completo de vendas, estoque, funcionários e muito mais.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
