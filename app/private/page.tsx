import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'

export default async function PrivatePage() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div>
            <h1>Private Page</h1>
            <p>Hello {data.user.email}!</p>
            <p>This is a protected page that requires authentication.</p>
            <form>
                <button formAction={logout}>Logout</button>
            </form>
        </div>
    )
}