import { Info } from 'lucide-react';
import { Database, Tables, TablesInsert } from '@/type/database.types';
import { createClient } from '@/utils/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveRequestDialog, LeaveRequests } from './leave';
import { differenceInBusinessDays } from 'date-fns';
import { FileDropZone } from '@/components/file-management/file-upload-zone';
import { Separator } from '@/components/ui/separator';
import { cn, currencyFormat } from '@/lib/utils';
import { FileItems, FileLinks } from '@/components/file-management/file-items';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROLE } from '@/type/contract.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddFile } from '../file-management/add-file-link';

interface props {
	data: Tables<'contracts'> & { profile: Tables<'profiles'>; org: Tables<'organisations'>; entity: Tables<'legal_entities'> & { incorporation_country: { currency_code: string } } };
	reviewType: ROLE;
}

export const ContractOverview = async ({ data, reviewType }: props) => {
	const supabase = createClient();

	const chartData: { label: Database['public']['Enums']['leave_type_enum']; total: number; days: number }[] = [
		{ label: 'paid', total: data.paid_leave as number, days: data.paid_leave_used as number },
		{ label: 'sick', total: data.sick_leave as number, days: data.sick_leave_used as number },
		{ label: 'paternity', total: data.paternity_leave as number, days: data.paternity_leave_used as number },
		{ label: 'maternity', total: data.maternity_leave as number, days: data.maternity_leave_used as number }
	];

	const { data: timeOffRequests, error } = await supabase
		.from('time_off')
		.select()
		.match({ org: data.org.subdomain, profile: (data.profile as any).id, status: 'pending' });
	if (error) return 'Error';

	const pendingLeaveDays = (type: Database['public']['Enums']['leave_type_enum']) => {
		const requests = timeOffRequests.filter(request => request.leave_type == type);
		let days = 0;
		requests.forEach(request => (days = days + (differenceInBusinessDays(request.to, request.from) + 1)));
		return days;
	};

	const files = await supabase.from('links').select().match({ org: data.org.subdomain });
	const getLinks = (path: string) => files.data?.filter(file => file.path == path);

	const LeaveStat = ({ days, total, label }: { days: number; total: number; label: Database['public']['Enums']['leave_type_enum'] }) => {
		const percentage = (days / total) * 100;
		const formatedPercentage = Number.isInteger(percentage) ? percentage : Number(percentage.toFixed(1));

		const pendingPercentage = (pendingLeaveDays(label) / total) * 100;
		const formatedPendingPercentage = Number.isInteger(pendingPercentage) ? pendingPercentage : Number(pendingPercentage.toFixed(1));
		const pending = { days: pendingLeaveDays(label), percentage: formatedPendingPercentage };

		return (
			<div className="space-y-2">
				<div className="relative h-1 w-full rounded-md bg-accent">
					<div className="absolute bottom-0 left-0 top-0 z-10 rounded-md bg-foreground transition-all" style={{ width: formatedPercentage + '%' }}>
						{formatedPercentage > 0 && <div className="absolute -right-px bottom-0 h-8 border-r pr-2 text-xs text-muted-foreground">{formatedPercentage}%</div>}
					</div>

					<div className="absolute bottom-0 left-0 top-0 rounded-md bg-orange-300 transition-all" style={{ width: pending.percentage + percentage + '%' }}>
						{pending.percentage > 0 && (
							<div className={cn('absolute -right-px bottom-0 border-r pr-2 text-xs text-muted-foreground', percentage > 0 ? 'h-16' : 'h-12')}>
								<div>pending</div>
								{pending.percentage}%
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between">
					<h3 className="mt-2 text-xs font-normal">
						<span className="capitalize">{label}</span> leave
					</h3>
					<div className="space-y-1 text-xs text-muted-foreground">
						<p>
							{days} days of {total} days
						</p>
					</div>
				</div>
			</div>
		);
	};

	const addLink = async (payload: TablesInsert<'links'>) => {
		'use server';

		const supabase = createClient();

		const { error } = await supabase.from('links').upsert({ ...payload, org: data.org.subdomain });
		if (error) return error.code == '23505' ? `Link with name '${payload.name}' already exists` : error.message;

		return true;
	};

	return (
		<section className="mt-6 flex w-full flex-wrap gap-14 space-y-8">
			{/* leave */}
			<div className="w-full">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Leave Days</h2>

					<div className="flex items-center gap-2">
						{data.status == 'signed' && (
							<>
								<LeaveRequestDialog contract={data} />
								<LeaveRequests reviewType={reviewType} org={data.org.subdomain} contract={data} />
							</>
						)}
					</div>
				</div>

				<div className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2">
					{chartData.map(stat => (
						<LeaveStat key={stat.label} {...stat} />
					))}
				</div>

				{chartData.length == 0 && (
					<div className="flex gap-4">
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
						<Skeleton className="h-36 w-20" />
					</div>
				)}
			</div>

			<Separator />

			{/* salary */}
			<div className="w-full">
				<div className="mb-12 flex items-center justify-between">
					<h2 className="flex items-center justify-between text-xl font-bold">Salary</h2>

					<div className="flex items-center gap-2">
						{/* <Button variant={'secondary'} className="h-9 gap-3">
							History
							<PanelRightOpen size={14} />
						</Button> */}
					</div>
				</div>

				<h3 className="text-4xl font-bold">{data?.salary ? currencyFormat({ currency: data.entity.incorporation_country?.currency_code, value: data?.salary }) : '00'}</h3>

				<div className="mt-3">
					<p className="text-xs text-muted-foreground">This is you gross annual pay as stated in your contract</p>
				</div>
			</div>

			<Separator />

			{/* documents */}
			<div className="w-full">
				<div className="mb-4">
					<h2 className="flex items-center justify-between text-xl font-bold">Files</h2>
				</div>

				<section className="relative mt-8">
					<div className="mb-6 flex items-center gap-2">
						<h2 className="text-sm font-light text-muted-foreground">Organisation files</h2>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild className="text-muted-foreground">
									<button>
										<Info size={12} />
									</button>
								</TooltipTrigger>

								<TooltipContent>
									<p className="max-w-36 text-left text-muted-foreground">Files added here will be visible to every employee</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>

					<Tabs defaultValue="files" className="w-full">
						<TabsList className="flex w-fit">
							<TabsTrigger value="files">Files</TabsTrigger>
							<TabsTrigger value="links">Links</TabsTrigger>
						</TabsList>

						<TabsContent value="files">
							<FileItems readonly path={`${data.org.id}/org-${data.org.id}`} />
						</TabsContent>

						<TabsContent value="links">
							<FileLinks links={getLinks(`${data.org.id}/org-${data.org.id}`)} />
						</TabsContent>
					</Tabs>
				</section>

				<section className="relative mt-16">
					<div className="mb-6 flex items-center gap-2">
						<h2 className="text-sm font-light text-muted-foreground">Your files</h2>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild className="text-muted-foreground">
									<button>
										<Info size={12} />
									</button>
								</TooltipTrigger>

								<TooltipContent>
									<p className="max-w-36 text-left text-muted-foreground">Files added here is visible to company admin</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>

					<Tabs defaultValue="files" className="w-full">
						<TabsList className="flex w-fit">
							<TabsTrigger value="files">Files</TabsTrigger>
							<TabsTrigger value="links">Links</TabsTrigger>
						</TabsList>

						<TabsContent value="files">
							<FileDropZone path={`${data.org.id}/${data.profile?.id}`}>
								<FileItems path={`${data.org.id}/${data.profile?.id}`} />
							</FileDropZone>
						</TabsContent>

						<TabsContent value="links">
							<FileLinks org={data.org.subdomain} links={getLinks(`${data.org.id}/${data.profile?.id}`)} />
						</TabsContent>
					</Tabs>

					<AddFile path={`${data.org.id}/${data.profile?.id}`} addLink={addLink} />
				</section>
			</div>
		</section>
	);
};
