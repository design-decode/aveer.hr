import { Button } from '@/components/ui/button';
import { Details } from '@/components/ui/details';
import { LoadingSpinner } from '@/components/ui/loader';
import { Tables, TablesInsert } from '@/type/database.types';
import { Dispatch, SetStateAction } from 'react';

interface props {
	data: any;
	level?: TablesInsert<'employee_levels'>;
	back: Dispatch<SetStateAction<boolean>>;
	submit: () => void;
	nationality?: Tables<'countries'>;
	isSubmiting: boolean;
	update: boolean;
	formType: 'contract' | 'role';
	isManager?: boolean;
	team?: string;
}

export const ContractDetails = ({ data, level, back, submit, nationality, isSubmiting, update, formType, isManager, team }: props) => {
	return (
		<section className="mx-auto grid max-w-4xl gap-20">
			<Details formType={formType} data={{ ...data, level, nationality }} isManager={isManager} team={team} back={back} />

			<div className="flex justify-end gap-4 border-t border-t-border pt-8">
				<Button
					onClick={() => {
						window.scrollTo({ top: 0, behavior: 'smooth' });
						back(false);
					}}
					variant={'outline'}>
					Back
				</Button>

				<Button onClick={submit} disabled={isSubmiting} type="submit" size={'sm'} className="gap-3 px-6 text-sm font-light">
					{isSubmiting && <LoadingSpinner />}
					{formType == 'contract' && <>{isSubmiting ? (update ? 'Updating person' : 'Adding person') : update ? 'Update person' : 'Add person'}</>}
					{formType == 'role' && <>{isSubmiting ? (update ? 'Updating role' : 'Creating role') : update ? 'Update role' : 'Create role'}</>}
				</Button>
			</div>
		</section>
	);
};
