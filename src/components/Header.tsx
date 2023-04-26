import { IconLogout, IconMenu2, IconUser } from '@tabler/icons'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Drawer, Menu } from '@mantine/core'
import HomeLogo from './home/HomeLogo'
import styled from '@emotion/styled'
import { useDisclosure } from '@mantine/hooks'
import Link from 'next/link'

const MenuMap = [
  { content: '사업소개', href: '/introduce' },
  { content: '지도', href: '/mainMap' },
  { content: '방내놓기', href: '/upload' },
  { content: '관심목록', href: '/wishlist' },
]

export default function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Container>
        <HomeLogo size={25} />
        <div />
        <MenuWrapper>
          {MenuMap.map((menu, idx) => (
            <MenuBtn1
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
              {' '}
              {menu.content}{' '}
            </MenuBtn1>
          ))}
        </MenuWrapper>
        <MenuBtn2>
          <IconMenu2 onClick={open} stroke={1} size={30} />
        </MenuBtn2>
        <LoginWrapper>
          {status === 'authenticated' ? (
            <Menu width={140}>
              <Menu.Target>
                <MenuBtn1>
                  <Image
                    src={session.user?.image!}
                    alt="profile"
                    width={28}
                    height={28}
                  />
                </MenuBtn1>
              </Menu.Target>
              <Menu.Dropdown color="dark">
                <Menu.Item
                  onClick={() => router.push('/upload?isManagePage=true')}
                >
                  내 방 관리
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => signOut()}>
                  <div className="flex items-center">
                    <IconLogout size={18} className="mr-1" />
                    로그아웃
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <MenuBtn1 onClick={() => router.push('/login')}>
              <IconUser size={28} className="icon" />
              <span className="login">로그인</span>
            </MenuBtn1>
          )}
        </LoginWrapper>
      </Container>
      <Drawer opened={opened} onClose={close} position="top" size={190}>
        <DrawerContainer>
          <div className="border-r border-black">
            {MenuMap.map((menu, idx) => (
              <Link
                key={menu.content}
                href={
                  idx > 1
                    ? status === 'authenticated'
                      ? menu.href
                      : '/login'
                    : menu.href
                }
              >
                <DrawerMenu key={menu.content} onClick={close}>
                  {menu.content}
                </DrawerMenu>
              </Link>
            ))}
          </div>
          <StyledMenuContainer>
            {status === 'authenticated' ? (
              <div>
                <Link href={'/upload?isManagePage=true'}>
                  <StyledMenuItem onClick={close}>내 방 관리</StyledMenuItem>
                </Link>
                <StyledMenuItem onClick={() => signOut()}>
                  <IconLogout size={18} className="mr-1" />
                  로그아웃
                </StyledMenuItem>
              </div>
            ) : (
              <Link href={'/login'}>
                <StyledMenuItem onClick={close}>
                  <IconUser size={28} className="icon" stroke={1.3} />
                  <span className="login">로그인</span>
                </StyledMenuItem>
              </Link>
            )}
          </StyledMenuContainer>
        </DrawerContainer>
      </Drawer>
    </>
  )
}

const Container = styled.div`
  display: grid;
  align-items: center;
  padding: 20px 0 20px 20px;
  border-bottom: 0.5px solid black;
  margin: 0 20px 0 20px;
  grid-template-columns: 1fr 5fr 1fr;
  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr 4fr 1fr;
    font-size: 0.75rem;
  }
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr 4fr 1fr;
    font-size: 0.8rem;
  }
  @media (min-width: 992px) {
    grid-template-columns: 1fr 3fr 4fr 1fr;
    font-size: 0.9rem;
  }
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 4fr 4fr 1fr;
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
const MenuBtn1 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
  .icon {
    @media (min-width: 576px) {
      display: none;
    }
  }
  .login {
    @media (max-width: 575px) {
      display: none;
    }
  }
`

const MenuBtn2 = styled.div`
  display: none;
  &:hover {
    cursor: pointer;
  }
  @media (max-width: 575px) {
    display: flex;
    justify-content: right;
  }
`
const LoginWrapper = styled.div`
  @media (max-width: 575px) {
    display: none;
  }
`
const DrawerContainer = styled.div`
  display: grid;
  font-size: 0.85rem;
  grid-template-columns: 2fr 1fr;
`
const DrawerMenu = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.1rem;
  &:hover {
    cursor: pointer;
    text-shadow: 1px 1px 1px gray;
  }
`

const StyledMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const StyledMenuItem = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
`