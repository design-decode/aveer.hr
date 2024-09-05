import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Database } from '@/type/database.types';
import { Info } from 'lucide-react';

export const ContractStatus = ({ state, start_date, end_date }: { state: Database['public']['Enums']['contract_state']; start_date: string; end_date?: string | null }) => {
	const now = new Date();

	const getState = (): { state: string; description: string } => {
		if (state == 'signed' && new Date(start_date) <= now) return { state: 'active', description: 'Contract has been signed by required parties and currently in effect' };

		if (state.includes('wait') && new Date(start_date) <= now) return { state: 'ineffective', description: 'Contract start date has passed and parties are yet to sign' };

		if (state == 'scheduled termination' && end_date && new Date(end_date) <= now) return { state: 'terminated', description: 'Contract has been terminated and no longer in effect' };

		if (state == 'awaiting org signature') return { state: 'awaiting org signature', description: 'Contract awaiting signature from company' };

		if (state == 'awaiting signature') return { state: 'awaiting employee', description: 'Contract awaiting signature from employee' };

		if (state == 'awaiting signatures') return { state: 'awaiting signatures', description: 'Contract awaiting signature from company and employee' };

		return { state: state, description: state };
	};

	const stateData = getState();

	return (
		<Badge className="gap-2 whitespace-nowrap py-1 font-light" variant={stateData.state.includes('term') ? 'secondary-destructive' : stateData.state == 'active' || stateData.state == 'signed' ? 'secondary-success' : 'secondary'}>
			{stateData.state}
			{/* <TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div>
							<Info size={12} className="stroke-1" />
						</div>
					</TooltipTrigger>
					<TooltipContent className="max-w-52">
						<p className="text-xs font-thin">{stateData.description}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider> */}
		</Badge>
	);
};
