import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityForm } from './profile-security-form';
import { ProfileForm } from './profile-form';
import { createClient } from '@/utils/supabase/server';
import { OrgForm } from '@/app/(auth)/create-org/form';
import { TablesUpdate } from '@/type/database.types';
import { EmployeeBand } from '@/components/band/employee-band';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeBenefits } from '@/components/employee-benefits/employee-benefits';
import { LegalEntities } from '@/components/legal-entities/legal-entities';
import { FormSection, FormSectionDescription, InputsContainer } from '@/components/forms/form-section';
import { ApprovalPolicies } from '@/components/approval-policies';
import { Teams } from '@/components/team/teams';
import { Boardings } from '@/components/boarding-settings';

export default async function SettingsPage({ params, searchParams }: { params: { [key: string]: string }; searchParams: { [key: string]: string } }) {
	const supabase = createClient();

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (!user || userError) return <div>Unable to fetch user data</div>;

	const [profileResponse, organisationResponse] = await Promise.all([await supabase.from('profiles').select().eq('id', user?.id).single(), await supabase.from('organisations').select().eq('subdomain', params.org).single()]);

	const updatePassword = async (password: string) => {
		'use server';
		const supabase = createClient();

		const { error, data } = await supabase.auth.updateUser({ password });

		if (error) return error?.message;
		if (data.user) return 'Password updated successfully';
	};

	const updateOrg = async (payload: TablesUpdate<'organisations'>) => {
		'use server';
		const supabase = createClient();

		const { error } = await supabase.from('organisations').update(payload).eq('subdomain', params.org);

		if (error) return error?.message;
		return 'Organisation updated successfully';
	};

	return (
		<div className="mx-auto max-w-4xl">
			<Tabs defaultValue={searchParams.type || 'personal'} className="">
				<div className="mb-6 flex items-center gap-4">
					<h1 className="text-xl font-semibold">Settings</h1>

					<TabsList className="mb-px h-8 py-px">
						<TabsTrigger value="personal" className="h-6">
							Personal
						</TabsTrigger>
						<TabsTrigger value="org" className="h-6">
							Organisation
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="org">
					{organisationResponse.data && (
						<FormSection>
							<FormSectionDescription>
								<h2 className="mb-1 font-normal">Company Details</h2>
								<p className="mt-3 text-xs font-thin text-muted-foreground sm:max-w-72">These are the legal details you provided while registering your company at the time of setup.</p>
							</FormSectionDescription>

							<InputsContainer>
								<OrgForm formAction={updateOrg} data={organisationResponse.data} />
							</InputsContainer>
						</FormSection>
					)}

					{organisationResponse.error && (
						<div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">
							Unable to fetch user data <p>{organisationResponse.error.message}</p>
						</div>
					)}

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<LegalEntities org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<EmployeeBand org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<Teams org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<EmployeeBenefits org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<ApprovalPolicies org={params.org} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-56 w-full" />}>
						<Boardings org={params.org} />
					</Suspense>
				</TabsContent>

				<TabsContent value="personal">
					<SecurityForm updatePassword={updatePassword} />

					{profileResponse.data && <ProfileForm data={profileResponse.data} />}
					{profileResponse.error && <div className="grid w-full border-t border-t-border py-10 text-center text-xs text-muted-foreground">Unable to fetch user data</div>}
				</TabsContent>
			</Tabs>
		</div>
	);
}
