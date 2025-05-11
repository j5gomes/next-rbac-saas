import Image from 'next/image'
import Link from 'next/link'

import githubIcon from '@/assets/icons/github.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function SignInPage() {
  return (
    <form action="" className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input name="email" type="email" id="email" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input name="password" type="password" id="password" />

        <Link
          href="/auth/forget-password"
          className="text-foreground text-xs font-medium hover:underline"
        >
          Forgot your password
        </Link>
      </div>

      <Button type="submit" className="w-full">
        Sign in with e-email
      </Button>

      <Button asChild variant="link" className="w-full" size="sm">
        <Link href="/auth/sign-up">Don't have an account? Sign Up</Link>
      </Button>

      <Separator />

      <Button type="submit" variant="outline" className="flex w-full gap-2">
        <Image src={githubIcon} alt="" className="size-4 dark:invert" />
        Sign in with GitHub
      </Button>
    </form>
  )
}
