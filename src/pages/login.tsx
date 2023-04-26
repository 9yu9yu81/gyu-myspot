import styled from '@emotion/styled'
import { Loader } from '@mantine/core'
import SignIn from 'components/Signin'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function Login() {
  const { status } = useSession()
  useEffect(() => {
    if (
      status === 'authenticated' &&
      document.referrer &&
      document.referrer.indexOf('/') !== -1
    ) {
      history.go(-2) // 뒤로가기
    } else if (status === 'authenticated') {
      location.href = '/' // 메인페이지로
    }
  }, [status])
  return (
    <>
      {status === 'unauthenticated' ? (
        <SignIn />
      ) : (
        <Centering style={{ margin: '5rem 0 5rem 0' }}>
          <Loader color="dark" />
        </Centering>
      )}
    </>
  )
}

export const Centering = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
