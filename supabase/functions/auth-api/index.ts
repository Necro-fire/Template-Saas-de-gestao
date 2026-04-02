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

    // ─── CHECK-SETUP: is first admin needed? ───
    if (action === 'check-setup') {
      const { data: adminProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('tipo', 'admin')
        .limit(1);
      return json({ needs_setup: !adminProfiles || adminProfiles.length === 0 });
    }

    // ─── LOOKUP: CPF → email (for login) ───
    if (action === 'lookup') {
      const cpf = (data.cpf || '').replace(/\D/g, '');
      if (!cpf) return json({ error: 'CPF é obrigatório' }, 400);

      // First check funcionarios_auth
      const { data: func } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('user_id')
        .eq('cpf', cpf)
        .eq('status', 'active')
        .maybeSingle();

      if (func?.user_id) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(func.user_id);
        if (authUser?.user) return json({ email: authUser.user.email });
      }

      // Then check admin by internal email pattern
      const adminEmail = `admin_${cpf}@jots.interno`;
      const { data: profileMatch } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', adminEmail)
        .eq('tipo', 'admin')
        .maybeSingle();

      if (profileMatch) return json({ email: profileMatch.email });

      return json({ error: 'CPF não encontrado' }, 404);
    }

    // ─── SETUP: primeiro admin ───
    if (action === 'setup') {
      // Check if any admin user has a funcionarios_auth entry with CPF
      const { data: adminRoleRows } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, roles!inner(name)')
        .eq('roles.name', 'admin');

      let hasAdminWithCpf = false;
      if (adminRoleRows && adminRoleRows.length > 0) {
        for (const row of adminRoleRows) {
          const { data: fa } = await supabaseAdmin
            .from('funcionarios_auth')
            .select('id')
            .eq('user_id', row.user_id)
            .neq('cpf', '')
            .limit(1);
          if (fa && fa.length > 0) { hasAdminWithCpf = true; break; }
        }
      }

      if (hasAdminWithCpf) return json({ error: 'Sistema já configurado' }, 400);

      if (!data.cpf || !data.password || !data.nome) {
        return json({ error: 'CPF, senha e nome são obrigatórios' }, 400);
      }
      if (data.password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);

      const cpf = data.cpf.replace(/\D/g, '');
      if (cpf.length !== 11) return json({ error: 'CPF deve ter 11 dígitos' }, 400);

      const email = `admin_${cpf}@jots.interno`;

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: { nome: data.nome, tipo: 'admin' },
      });

      if (authError) return json({ error: authError.message }, 400);

      await supabaseAdmin.from('profiles').insert({
        id: authUser.user.id,
        nome: data.nome,
        email,
        tipo: 'admin',
      });

      // Create funcionarios_auth entry for admin
      await supabaseAdmin.from('funcionarios_auth').insert({
        user_id: authUser.user.id,
        nome: data.nome,
        cpf,
        codigo_acesso: cpf,
        cargo: 'Administrador',
        filial_id: '1',
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

      // Generate and store recovery code
      const recoveryCode = Array.from({ length: 8 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      await supabaseAdmin.from('system_settings').insert({
        key: 'recovery_code',
        value: recoveryCode,
      });

      return json({ success: true, recovery_code: recoveryCode });
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

      if (!data.nome || !data.cpf || !data.password) {
        return json({ error: 'Nome, CPF e senha são obrigatórios' }, 400);
      }

      const cpf = data.cpf.replace(/\D/g, '');
      if (cpf.length !== 11) return json({ error: 'CPF deve ter 11 dígitos' }, 400);

      // Check if CPF already exists
      const { data: existing } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('id')
        .eq('cpf', cpf)
        .maybeSingle();

      if (existing) return json({ error: 'CPF já cadastrado no sistema' }, 400);

      const email = `func_${cpf}@jots.interno`;

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
        cpf,
        codigo_acesso: cpf,
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

      return json({ success: true });
    }

    // ─── UPDATE EMPLOYEE PASSWORD (admin only) ───
    if (action === 'update-password') {
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

      if (!data.funcionario_id || !data.new_password) {
        return json({ error: 'ID do funcionário e nova senha são obrigatórios' }, 400);
      }
      if (data.new_password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);

      const { data: func } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('user_id')
        .eq('id', data.funcionario_id)
        .single();

      if (!func?.user_id) return json({ error: 'Funcionário não encontrado' }, 404);

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(func.user_id, {
        password: data.new_password,
      });

      if (updateError) return json({ error: updateError.message }, 400);

      return json({ success: true });
    }

    // ─── RESET PASSWORD (via recovery code) ───
    if (action === 'reset-password') {
      const cpf = (data.cpf || '').replace(/\D/g, '');
      if (!cpf || cpf.length !== 11) return json({ error: 'CPF inválido' }, 400);
      if (!data.recovery_code) return json({ error: 'Código de recuperação é obrigatório' }, 400);
      if (!data.new_password || data.new_password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);

      // Verify recovery code
      const { data: setting } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'recovery_code')
        .single();

      if (!setting || setting.value !== data.recovery_code) {
        return json({ error: 'Código de recuperação inválido' }, 403);
      }

      // Find employee by CPF
      const { data: func } = await supabaseAdmin
        .from('funcionarios_auth')
        .select('user_id')
        .eq('cpf', cpf)
        .eq('status', 'active')
        .single();

      if (!func?.user_id) return json({ error: 'CPF não encontrado' }, 404);

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(func.user_id, {
        password: data.new_password,
      });

      if (updateError) return json({ error: updateError.message }, 400);

      return json({ success: true });
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

    // ─── GET RECOVERY CODE (admin only) ───
    if (action === 'get-recovery-code') {
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

      const { data: setting } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'recovery_code')
        .single();

      return json({ recovery_code: setting?.value || '' });
    }

    return json({ error: 'Ação inválida' }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
