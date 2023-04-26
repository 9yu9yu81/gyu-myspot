import Link from 'next/link'
import { IconBrandGithub, IconBrandInstagram, IconMenu2 } from '@tabler/icons'
import { useRouter } from 'next/router'
import styled from '@emotion/styled'
import HomeLogo from './home/HomeLogo'
import { Menu } from '@mantine/core'
const MenuMap = [
  { content: '사업소개', href: '/introduce' },
  { content: '이용약관', href: '/privacyPolicy' },
  { content: '개인정보처리방침', href: '/privacyPolicy' },
  { content: '매물관리규정', href: '/privacyPolicy' },
]

export default function Footer() {
  const router = useRouter()
  return (
    <Container>
      <MenuContainer>
        <div className="flex space-x-3 notMobile">
          <HomeLogo size={20} />
          <div className="flex items-center">
            <div className="pl-3 pr-3">
              <Link href="/introduce">사업소개</Link>
            </div>
            <div className="border-l border-zinc-400 pl-3 pr-3">
              <Link href="/introduce">이용약관</Link>
            </div>
            <div className="border-l border-zinc-400 pl-3 pr-3">
              <Link href="/privacyPolicy">개인정보처리방침</Link>
            </div>
            <div className="border-l border-zinc-400 pl-3 pr-3">
              <Link href="/introduce">매물관리규정</Link>
            </div>
          </div>
        </div>
      </MenuContainer>
      <InfoWrapper className="pt-6 pb-2 mr-2 ml-2 pl-2">
        <div className="flex">
          MySpot
          <div className="mobile">
            <Menu width={140}>
              <Menu.Target>
                <div className="hover:cursor-pointer">
                  <IconMenu2 size={24} stroke={1} />
                </div>
              </Menu.Target>
              <Menu.Dropdown color="dark">
                {MenuMap.map((menu) => (
                  <Menu.Item key={menu.content}>
                    <Link href={menu.href}>
                      <MenuWrapper>{menu.content}</MenuWrapper>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
        <div>developer : 9yu9yu81</div>
        <div>phone : 010-8593-0833</div>
        <div>email : 9yu9yu81@gmail.com</div>
      </InfoWrapper>
      <div className="flex mt-4 mb-8 pl-4">
        <span>찾아주셔서 감사드립니다.</span>
        <IconBrandInstagram
          stroke={1.25}
          className="ml-auto mr-2 hover:cursor-pointer"
          onClick={() => router.push('https://www.instagram.com/9yu9yu81/')}
        />
        <IconBrandGithub
          stroke={1.25}
          className="hover:cursor-pointer mr-2"
          onClick={() => router.push('https://github.com/9yu9yu81/gyu-myspot')}
        />
      </div>
    </Container>
  )
}

const Container = styled.div`
  font-weight: 300;
  font-size: 0.75rem;
`

const MenuContainer = styled.div`
  padding: 1rem;
  border-top: solid 0.5px gray;
  @media (max-width: 575px) {
    display: none;
  }
`

const MenuWrapper = styled.div``

const InfoWrapper = styled.div`
  display: flex;
  flex-flow: column;
  border-top: solid 0.5px gray;

  .mobile {
    display: none;
  }
  @media (max-width: 575px) {
    .mobile {
      display: inline;
      margin: 0 0.4rem 0 auto;
    }
  }
`
