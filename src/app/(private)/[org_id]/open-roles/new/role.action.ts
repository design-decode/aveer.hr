'use server';

import { TablesInsert, TablesUpdate } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const createOpenRole = async (role: TablesInsert<'open_roles'>, orgId: string) => {
	const supabase = createClient();

	const { data, error } = await supabase.from('open_roles').insert(role).select('id').single();

	if (error) return error.message;
	if (!error) return redirect(`/${orgId}/open-roles/${data.id}`);
};

export const updateRole = async (role: TablesUpdate<'open_roles'>, orgId: string) => {
	const supabase = createClient();

	const { error } = await supabase.from('open_roles').update(role).match({ org: orgId });

	if (error) return error.message;
	return 'update';
};
