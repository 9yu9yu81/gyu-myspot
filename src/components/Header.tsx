import { IconLogout, IconUser } from '@tabler/icons'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Menu } from '@mantine/core'
import HomeLogo from './home/HomeLogo'
import { Center2_Div } from './styledComponent'
import styled from '@emotion/styled'

const MenuMap = [
  { content: '사업소개', href: '/introduce' },
  { content: '지도', href: '/mainMap' },
  { content: '방내놓기', href: '/upload' },
  { content: '관심목록', href: '/wishlist' },
]

export default function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()

  return (
    <Container>
      <HomeLogo size={25} />
      <div />
      <MenuWrapper>
        {MenuMap.map((menu, idx) => (
          <HeaderMenu
            key={menu.content}
            onClick={() =>
              router.push(
                idx > 1
                  ? status === 'authenticated'
                    ? menu.href
                    : '/login'
                  : menu.href
              )
            }
          >
            {menu.content}
          </HeaderMenu>
        ))}
      </MenuWrapper>
      <div className="margin" />
      {status === 'authenticated' ? (
        <Menu width={140}>
          <Menu.Target>
            <HeaderMenu>
              <Image
                src={session.user?.image!}
                alt="profile"
                width={25}
                height={25}
              />
            </HeaderMenu>
          </Menu.Target>
          <Menu.Dropdown color="dark">
            <Menu.Item onClick={() => router.push('/upload?isManagePage=true')}>
              내 방 관리
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => signOut()}>
              <Center2_Div>
                <IconLogout size={18} className="mr-1" />
                로그아웃
              </Center2_Div>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <HeaderMenu onClick={() => router.push('/login')}>
          <IconUser size={20} className="mr-1" />
          로그인
        </HeaderMenu>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 4fr 1fr;
  padding: 20px;
  border-bottom: 0.5px solid black;
  margin: 0 20px 0 20px;
  @media (min-width: 576px) {
    font-size: 0.8rem;
  }
  @media (min-width: 768px) {
    font-size: 0.85rem;
  }
  @media (min-width: 992px) {
    font-size: 0.9rem;
  }
  @media (min-width: 1200px) {
    font-size: 1rem;
  }

  .margin {
    display: none;
    @media (max-width: 575px) {
      display: inline;
    }
  }
`
const MenuWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  @media (max-width: 575px) {
    display: none;
  }
`
const HeaderMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
`

