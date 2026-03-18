import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    const { action, ...data } = body;

    // ─── LOOKUP: código de acesso → email ───
    if (action === 'lookup') {
      const { data: func, error } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('user_id')
        .eq('codigo_acesso', data.codigo_acesso)
        .eq('status', 'active')
        .single();

      if (error || !func) return json({ error: 'Código de acesso não encontrado' }, 404);

      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(func.user_id);
      if (!authUser?.user) return json({ error: 'Usuário não encontrado' }, 404);

      return json({ email: authUser.user.email });
    }

    // ─── SETUP: primeiro admin ───
    if (action === 'setup') {
      const { count } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) return json({ error: 'Sistema já configurado' }, 400);

      if (!data.email || !data.password || !data.nome) {
        return json({ error: 'Email, senha e nome são obrigatórios' }, 400);
      }
      if (data.password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { nome: data.nome, tipo: 'admin' },
      });

      if (authError) return json({ error: authError.message }, 400);

      await supabaseAdmin.from('profiles').insert({
        id: authUser.user.id,
        nome: data.nome,
        email: data.email,
        tipo: 'admin',
      });

      const { data: adminRole } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminRole) {
        await supabaseAdmin.from('user_roles').insert({
          user_id: authUser.user.id,
          role_id: adminRole.id,
        });
      }

      return json({ success: true });
    }

    // ─── CREATE EMPLOYEE ───
    if (action === 'create-employee') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Não autorizado' }, 401);

      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) return json({ error: 'Token inválido' }, 401);

      const callerId = claimsData.claims.sub as string;
      const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: callerId, _role: 'admin' });
      if (!isAdmin) return json({ error: 'Acesso negado' }, 403);

      if (!data.nome || !data.codigo_acesso || !data.password) {
        return json({ error: 'Nome, código de acesso e senha são obrigatórios' }, 400);
      }

      const email = `func_${data.codigo_acesso.toLowerCase().replace(/[^a-z0-9]/g, '')}@jots.interno`;

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: { nome: data.nome, tipo: 'funcionario' },
      });

      if (authError) return json({ error: authError.message }, 400);

      await supabaseAdmin.from('profiles').insert({
        id: authUser.user.id,
        nome: data.nome,
        email,
        tipo: 'funcionario',
      });

      await supabaseAdmin.from('funcionarios_auth').insert({
        user_id: authUser.user.id,
        nome: data.nome,
        codigo_acesso: data.codigo_acesso,
        telefone: data.telefone || '',
        cargo: data.cargo || '',
        filial_id: data.filial_id || '1',
      });

      if (data.role_id) {
        await supabaseAdmin.from('user_roles').insert({
          user_id: authUser.user.id,
          role_id: data.role_id,
        });
      }

      return json({ success: true, codigo_acesso: data.codigo_acesso });
    }

    // ─── DELETE EMPLOYEE ───
    if (action === 'delete-employee') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Não autorizado' }, 401);

      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) return json({ error: 'Token inválido' }, 401);

      const callerId = claimsData.claims.sub as string;
      const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: callerId, _role: 'admin' });
      if (!isAdmin) return json({ error: 'Acesso negado' }, 403);

      const { data: func } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('user_id')
        .eq('id', data.funcionario_id)
        .single();

      if (func?.user_id) {
        await supabaseAdmin.auth.admin.deleteUser(func.user_id);
      }

      return json({ success: true });
    }

    return json({ error: 'Ação inválida' }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
