import { createClient } from '@/utils/supabase/server';
import { SignupForm } from './form';
import { redirect } from 'next/navigation';
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

export default function SignupPage() {
	const signup = async (payload: FormData): Promise<string> => {
		'use server';
		const supabase = createClient();

		const signupData: SignUpWithPasswordCredentials = {
			email: payload.get('email') as string,
			password: payload.get('password') as string,
			options: {
				data: {
					first_name: payload.get('first-name') as string,
					last_name: payload.get('last-name') as string
				}
			}
		};

		const { error } = await supabase.auth.signUp(signupData);
		if (error) return error.message;

		return redirect('/create-org');
	};

	return (
		<div className="mx-auto grid w-[350px] gap-9">
			<div className="mb-4 grid gap-2">
				<h1 className="text-xl font-bold">Welcome</h1>
				<p className="text-balance text-xs font-normal text-muted-foreground">Enter your details below to setup your organisation account</p>
			</div>

			<SignupForm formAction={signup} />
		</div>
	);
}
