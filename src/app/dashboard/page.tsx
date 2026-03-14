import { redirect } from 'next/navigation'

// Dashboard home — redirect to Players until overview page is built
export default function DashboardPage() {
  redirect('/dashboard/players')
}
