import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '../ui/form';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpRight, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface props {
	form: UseFormReturn<any>;
	name: string;
	label?: string;
	minValue: number;
	maxValue: number;
	salaryInvalid: boolean;
	validateSalary: (salary: number) => void;
}

export const PayInput = ({ form, salaryInvalid, name, label, minValue, maxValue, validateSalary }: props) => {
	const EmployeeBandSalaryRange = () => {
		if (!minValue || !maxValue) return;

		return (
			<>
				{minValue && maxValue ? (
					<div className="flex gap-1">
						<div>
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(minValue)}
						</div>
						-
						<div>
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(maxValue)}
						</div>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button type="button">
										<Info size={12} />
									</button>
								</TooltipTrigger>

								<TooltipContent side="left">
									<p className="flex text-xs text-muted-foreground">
										Range from{' '}
										<Link href={`../settings?type=org`} className="ml-1 flex items-center rounded-sm bg-accent px-1 text-foreground">
											employee band <ArrowUpRight size={10} />
										</Link>
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				) : (
					''
				)}
			</>
		);
	};

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className={cn('flex items-center', label ? 'justify-between' : 'justify-end')}>
						{label}
						{form.getValues('level') && <EmployeeBandSalaryRange />}
					</FormLabel>
					<FormControl>
						<Input
							{...field}
							onChange={event => {
								field.onChange(event);
								validateSalary(Number(event.target.value));
							}}
							type="number"
							autoComplete="off"
							placeholder="Employee gross annual salary"
							required
						/>
					</FormControl>
					<FormMessage />
					{field.value && (
						<FormDescription>
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(Number(field.value))}
						</FormDescription>
					)}
					{salaryInvalid && <FormDescription className="text-destructive">Amount must be within the selected employee level&apos;s range</FormDescription>}
				</FormItem>
			)}
		/>
	);
};
