import { useSession, signIn } from 'next-auth/react'
import { Button } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons'
import styled from '@emotion/styled'

export default function SignIn() {
  const { status } = useSession()

  return (
    <Container>
      {status === 'unauthenticated' && (
        <Centering className="box">
          <div className="login">로그인</div>
          <div className="comment">
            MySpot 서비스 이용을 위해 로그인 해주세요.
          </div>
          <Button
            variant="default"
            leftIcon={<IconBrandGoogle size={18} />}
            onClick={() => signIn('google')}
          >
            구글로 로그인
          </Button>
        </Centering>
      )}
    </Container>
  )
}

export const Centering = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled(Centering)`
  margin: 15vh 0 15vh 0;
  .box {
    width: 400px;
    flex-flow: column;
    height: 400px;
    border: 0.5px solid black;
    @media (max-width: 575px) {
      width: 320px;
      height: 320px;
    }
  }
  .login {
    font-weight: 700;
    font-size: 30px;
    margin: 0 0 4rem 0;
    border-bottom: 0.5px solid black;
    padding: 0 2rem 0.5rem 2rem;
    @media (max-width: 575px) {
      font-size: 1.2rem;
    }
  }
  .comment {
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    @media (max-width: 575px) {
      font-size: 0.7rem;
    }
  }
  @media (max-width: 575px) {
    margin: 10vh 0 10vh 0;
  }
`