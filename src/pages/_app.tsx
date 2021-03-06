import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import { Hub, Logger } from 'aws-amplify'
import awsExports from '../aws-exports'
import type { AppProps /*, AppContext */ } from 'next/app'
import React, { useState, useEffect } from 'react'
import Nav from '../components/nav'
import Header from '../components/header'
import Head from 'next/head'
import '../styles/globals.css'

Amplify.configure(awsExports)

interface UserInfo {
  email: string
  email_verified?: boolean
  phone_number?: string
  phone_number_verified?: string
  sub?: string
}

const App = ({ Component, pageProps }: AppProps) => {
  const [isOpenThem, setIsOpenThem] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({ email: '' })
  const [authState, setAuthState] = useState<string>('')
  const logger = new Logger('hub-logger')

  const listener = (data) => {
    switch (data.payload.event) {
      case 'signIn':
        setAuthState('signIn')
        logger.info('user signed in')
        break
      case 'signUp':
        setAuthState('signUp')
        logger.info('user signed up')
        break
      case 'signOut':
        setAuthState('signOut')
        logger.info('user signed out')
        break
      case 'signIn_failure':
        setAuthState('signIn_failure')
        logger.error('user sign in failed')
        break
      case 'tokenRefresh':
        setAuthState('tokenRefresh')
        logger.info('token refresh succeeded')
        break
      case 'tokenRefresh_failure':
        setAuthState('tokenRefresh_failure')
        logger.error('token refresh failed')
        break
      case 'configured':
        setAuthState('configured')
        logger.info('the Auth module is configured')
    }
  }

  Hub.listen('auth', listener)

  useEffect(() => {
    getCurrentUserInfo()
    console.log(authState)
  }, [authState])

  const getCurrentUserInfo = async () => {
    try {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser()
      const { attributes } = currentAuthenticatedUser
      setUserInfo(attributes)
    } catch (error) {
      console.error(error)
      setUserInfo({ email: '' })
    }
  }

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <Header
          userName={userInfo.email}
          isOpenTham={isOpenThem}
          onClickTham={() => setIsOpenThem(!isOpenThem)}
        />
      </header>
      <div className="mt-20">
        {isOpenThem && <Nav onTransition={() => setIsOpenThem(false)} />}
        {
          <div className="m-4">
            <Component {...pageProps} />
          </div>
        }
      </div>
    </div>
  )
}

export default App
