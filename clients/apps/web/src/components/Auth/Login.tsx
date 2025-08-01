'use client'

import { usePostHog, type EventName } from '@/hooks/posthog'
import { schemas } from '@polar-sh/client'
import LabeledSeparator from '@polar-sh/ui/components/atoms/LabeledSeparator'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import GithubLoginButton from '../Auth/GithubLoginButton'
import LoginCodeForm from '../Auth/LoginCodeForm'
import GoogleLoginButton from './GoogleLoginButton'

const Login = ({
  returnTo,
  returnParams,
  signup,
}: {
  returnTo?: string
  returnParams?: Record<string, string>
  signup?: schemas['UserSignupAttribution']
}) => {
  const posthog = usePostHog()

  let loginProps = {}
  const pathname = usePathname()
  const searchParams = useSearchParams()

  let eventName: EventName = 'global:user:login:view'

  if (!returnTo) {
    returnTo = `/dashboard`
  }

  if (signup) {
    eventName = 'global:user:signup:view'

    signup.path = pathname

    const host = typeof window !== 'undefined' ? window.location.host : ''
    if (host) {
      signup.host = host
    }

    const campaign = searchParams.get('campaign') ?? ''
    if (campaign) {
      signup.campaign = campaign
    }

    const utm = {
      source: searchParams.get('utm_source') ?? '',
      medium: searchParams.get('utm_medium') ?? '',
      campaign: searchParams.get('utm_campaign') ?? '',
    }
    if (utm.source) {
      signup.utm_source = utm.source
    }
    if (utm.medium) {
      signup.utm_medium = utm.medium
    }
    if (utm.campaign) {
      signup.utm_campaign = utm.campaign
    }

    loginProps = { signup }
  }

  if (returnTo && returnParams) {
    const returnToParams = new URLSearchParams(returnParams)
    if (returnToParams.size) {
      returnTo = `${returnTo || ''}?${returnToParams}`
    }

    loginProps = { returnTo, ...loginProps }
  }

  useEffect(() => {
    posthog.capture(eventName, loginProps)
  }, [])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex w-full flex-col gap-y-4">
        <GithubLoginButton
          text="Continue with GitHub"
          size="large"
          fullWidth
          {...loginProps}
        />
        <GoogleLoginButton {...loginProps} />
        <LabeledSeparator label="Or" />
        <LoginCodeForm {...loginProps} />
      </div>
      <div className="dark:text-polar-500 mt-6 text-center text-xs text-gray-400">
        By using Polar you agree to our{' '}
        <a
          className="dark:text-polar-300 text-gray-600"
          href="https://polar.sh/legal/terms"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          className="dark:text-polar-300 text-gray-600"
          href="https://polar.sh/legal/privacy"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  )
}

export default Login
