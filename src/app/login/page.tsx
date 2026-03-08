import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In — REIOGN',
  description: 'Sign in to your REIOGN account',
}

export default function LoginPage() {
  return <LoginClient />
}
