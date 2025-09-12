'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
