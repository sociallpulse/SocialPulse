// در fetchData()، جایگزین teamData ساده:
const { data: rolesData } = await supabase
  .from('user_roles')
  .select('user_id, role, created_at')
  .order('created_at', { ascending: false });

if (rolesData?.length) {
  const ids = rolesData.map(r => r.user_id);
  const { data: profData } = await supabase
    .from('user_profiles')
    .select('id, full_name, personnel_code')
    .in('id', ids);

  const profMap = new Map((profData ?? []).map(p => [p.id, p]));
  setTeamMembers(rolesData.map(r => ({
    user_id:        r.user_id,
    role:           r.role as 'admin' | 'observer',
    created_at:     r.created_at,
    full_name:      profMap.get(r.user_id)?.full_name ?? null,
    personnel_code: profMap.get(r.user_id)?.personnel_code ?? null,
  })));
}
