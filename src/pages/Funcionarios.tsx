import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFilial, filiais } from '@/contexts/FilialContext';
import { FilialSelector } from '@/components/FilialSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, UserCog, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Funcionario {
  id: string;
  nome: string;
  codigo_acesso: string;
  telefone: string;
  cargo: string;
  filial_id: string;
  status: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function Funcionarios() {
  const [search, setSearch] = useState('');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedFilial } = useFilial();
  const { isAdmin, session } = useAuth();

  // Form state
  const [nome, setNome] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [filialId, setFilialId] = useState('1');
  const [roleId, setRoleId] = useState('');

  const loadData = async () => {
    const [funcRes, rolesRes] = await Promise.all([
      supabase.from('funcionarios_auth').select('*').order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('name'),
    ]);
    if (funcRes.data) setFuncionarios(funcRes.data as Funcionario[]);
    if (rolesRes.data) setRoles(rolesRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = funcionarios.filter(f => {
    if (selectedFilial !== 'all' && f.filial_id !== selectedFilial) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return f.nome.toLowerCase().includes(s) || f.codigo_acesso.toLowerCase().includes(s) || f.cargo.toLowerCase().includes(s);
  });

  const generateCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setCodigoAcesso(`FUNC${num}`);
  };

  const handleCreate = async () => {
    if (!nome.trim() || !codigoAcesso.trim() || !senha.trim()) {
      return toast.error('Nome, código de acesso e senha são obrigatórios');
    }
    if (senha.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres');

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-api', {
        body: {
          action: 'create-employee',
          nome,
          codigo_acesso: codigoAcesso,
          password: senha,
          telefone,
          cargo,
          filial_id: filialId,
          role_id: roleId || undefined,
        },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Erro ao criar funcionário');
      } else {
        toast.success(`Funcionário criado! Código: ${codigoAcesso}`);
        setDialogOpen(false);
        resetForm();
        loadData();
      }
    } catch {
      toast.error('Erro ao criar funcionário');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setNome(''); setCodigoAcesso(''); setSenha(''); setTelefone('');
    setCargo(''); setFilialId('1'); setRoleId('');
  };

  const getFilialName = (id: string) => filiais.find(f => f.id === id)?.name || id;

  return (
    <div>
      <FilialSelector />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold tracking-tighter">Funcionários</h1>
            <p className="text-ui text-muted-foreground">{filtered.length} funcionários</p>
          </div>
          {isAdmin && (
            <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); generateCode(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              Novo Funcionário
            </Button>
          )}
        </div>

        {funcionarios.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, código ou cargo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-1">
            {filtered.map(func => (
              <div key={func.id} className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                    <UserCog className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-ui font-medium">{func.nome}</p>
                    <p className="text-caption text-muted-foreground">
                      {func.cargo || 'Sem cargo'} · Código: {func.codigo_acesso}
                      {func.telefone && ` · ${func.telefone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFilial === 'all' && (
                    <Badge variant="outline" className="text-caption">{getFilialName(func.filial_id)}</Badge>
                  )}
                  <Badge variant={func.status === 'active' ? 'secondary' : 'outline'} className="text-caption">
                    {func.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCog className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-ui font-medium">Nenhum funcionário cadastrado</p>
            <p className="text-caption mt-1">Cadastre seu primeiro funcionário para começar</p>
          </div>
        )}
      </div>

      {/* Create Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do funcionário" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código de Acesso *</Label>
                <div className="flex gap-2">
                  <Input value={codigoAcesso} onChange={e => setCodigoAcesso(e.target.value.toUpperCase())} placeholder="FUNC001" className="uppercase" />
                  <Button type="button" variant="outline" size="sm" onClick={generateCode} className="shrink-0 text-xs">
                    Gerar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Senha *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    className="pr-9"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Cargo/Função</Label>
                <Input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Vendedor" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Filial</Label>
                <Select value={filialId} onValueChange={setFilialId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filiais.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cargo (permissões)</Label>
                <Select value={roleId || '__none__'} onValueChange={v => setRoleId(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {roles.filter(r => r.name !== 'admin').map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Funcionário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
