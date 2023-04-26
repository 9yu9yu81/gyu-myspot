import { Loader, Menu, SegmentedControl } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Center2_Div,
  Center_Div,
  StyledImage,
  mainColor,
  subColor_light,
} from 'components/styledComponent'
import { CATEGORY_MAP, YEAR_MONTH_MAP } from 'constants/const'
import { useState } from 'react'
import Image from 'next/image'
import { IconArrowDown, IconHeart } from '@tabler/icons'
import { useSession } from 'next-auth/react'
import styled from '@emotion/styled'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { menuStyle } from './mainMap'
const CustomPagination = dynamic(() => import('components/CustomPagination'))

interface WishedRoom {
  id: number
  category_id: number
  sType_id: number
  deposit: number
  fee: number
  doro: string
  title: string
  images: string
}

const scStyles = () => ({
  root: {
    backgroundColor: 'white',
  },
  label: {
    marginRight: '10px',
    marginLeft: '10px',
    backgroundColor: `${subColor_light}`,
  },
  labelActive: {
    marginRight: '10px',
    marginLeft: '10px',
    color: `${subColor_light} !important`,
    backgroundColor: `${mainColor}`,
  },
  active: {
    marginRight: '10px',
    marginLeft: '10px',
  },
  control: { borderWidth: '0px !important' },
})

export default function wishlist() {
  const queryClient = useQueryClient()
  const { status } = useSession()

  const WISHLIST_TAKE = 9
  const [activePage, setActivePage] = useState<number>(1)
  const [ym, setYm] = useState<string>('0')
  const [category, setCategory] = useState<string>('0')

  const WISHLIST_QUERY_KEY = `api/wishlist/get-Wishlists-Take?skip=${
    (activePage - 1) * WISHLIST_TAKE
  }&take=${WISHLIST_TAKE}&category_id=${category}&sType_id=${ym}`
  const WISHLIST_COUNT_QUERY_KEY = `api/wishlist/get-Wishlists-Count`
  const WISHLIST_TOTAL_QUERY_KEY = `api/wishlist/get-Wishlists-Total?category_id=${category}&sType_id=${ym}`

  const { data: wishlists, isLoading } = useQuery<
    { wishlists: WishedRoom[] },
    unknown,
    WishedRoom[]
  >([WISHLIST_QUERY_KEY], () =>
    fetch(WISHLIST_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )
  const { data: count, isLoading: countLoading } = useQuery<
    { count: number },
    unknown,
    number
  >([WISHLIST_COUNT_QUERY_KEY], () =>
    fetch(WISHLIST_COUNT_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )
  const { data: total } = useQuery<{ total: number }, unknown, number>(
    [WISHLIST_TOTAL_QUERY_KEY],
    () =>
      fetch(WISHLIST_TOTAL_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => (data.items === 0 ? 1 : data.items)),
    {
      onSuccess: async () => {
        setActivePage(1)
      },
    }
  )

  const { mutate: updateIsWished } = useMutation<unknown, unknown, number, any>(
    (room_id) =>
      fetch('api/wishlist/update-IsWished', {
        method: 'POST',
        body: JSON.stringify(room_id),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (room_id) => {
        await queryClient.cancelQueries({ queryKey: [WISHLIST_QUERY_KEY] })
        const previous = queryClient.getQueryData([WISHLIST_QUERY_KEY])

        queryClient.setQueryData<WishedRoom[]>([WISHLIST_QUERY_KEY], (olds) =>
          olds?.filter((f) => f.id !== room_id)
        )
        queryClient.setQueryData<number>([WISHLIST_TOTAL_QUERY_KEY], (old) =>
          old ? old - 1 : undefined
        )
        queryClient.setQueryData<number>([WISHLIST_COUNT_QUERY_KEY], (old) =>
          old ? old - 1 : undefined
        )
        return previous
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([WISHLIST_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([WISHLIST_QUERY_KEY])
        queryClient.invalidateQueries([WISHLIST_TOTAL_QUERY_KEY])
        queryClient.invalidateQueries([WISHLIST_COUNT_QUERY_KEY])
      },
    }
  )

  const delWishlist = (room_id: number) => {
    if (confirm('해당 매물을 관심목록에서 삭제하시겠습니까?')) {
      updateIsWished(room_id)
    }
  }

  return status === 'authenticated' ? (
    <Container>
      <CountContainer>
        관심 매물
        {countLoading ? (
          <Center_Div className="loader">
            <Loader color="dark" size={15} />
          </Center_Div>
        ) : (
          <div className="count">{count}</div>
        )}
        개
      </CountContainer>
      <MenuContainer
        style={{ display: 'flex', flexFlow: 'column', margin: '0 0 30px 0' }}
      >
        <SegmentedControl
          className="seg"
          value={category}
          onChange={setCategory}
          styles={scStyles}
          transitionDuration={0}
          data={[
            {
              label: '전체',
              value: '0',
            },
            ...CATEGORY_MAP.map((label, id) => ({
              label: label,
              value: String(id + 1),
            })),
          ]}
        />
        <SegmentedControl
          className="seg"
          value={ym}
          onChange={setYm}
          styles={scStyles}
          transitionDuration={0}
          data={[
            {
              label: '전체',
              value: '0',
            },
            ...YEAR_MONTH_MAP.map((label, id) => ({
              label: label,
              value: String(id + 1),
            })),
          ]}
        />
        <Center_Div className="btn">
          <Menu width={160}>
            <Menu.Target>
              <MenuBtn>
                매물 종류
                <IconArrowDown size={15} />
              </MenuBtn>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                style={menuStyle(category, 0)}
                value={'0'}
                onClick={() => setCategory('0')}
              >
                <Center_Div>전체</Center_Div>
              </Menu.Item>
              {CATEGORY_MAP.map((cat, idx) => (
                <Menu.Item
                  key={`${cat}-${idx}`}
                  value={idx}
                  onClick={() => setCategory(String(idx + 1))}
                  style={menuStyle(category, idx + 1)}
                >
                  <Center_Div>{cat}</Center_Div>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <Menu width={160}>
            <Menu.Target>
              <MenuBtn>
                전세/월세
                <IconArrowDown size={15} />
              </MenuBtn>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                style={menuStyle(ym, 0)}
                value={0}
                onClick={() => setYm('0')}
              >
                <Center_Div>전체</Center_Div>
              </Menu.Item>
              {YEAR_MONTH_MAP.map((item, idx) => (
                <Menu.Item
                  style={menuStyle(ym, idx + 1)}
                  key={`${item}-${idx}`}
                  value={idx}
                  onClick={() => setYm(String(idx + 1))}
                >
                  <Center_Div>{item}</Center_Div>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Center_Div>
      </MenuContainer>
      {isLoading ? (
        <Center_Div style={{ margin: '100px 0 100px 0' }}>
          <Loader color="dark" />
        </Center_Div>
      ) : wishlists ? (
        <div>
          <WishContainer>
            {wishlists.map((wishlist, idx) => (
              <Center_Div>
                <WishWrapper key={idx}>
                  <StyledImage style={{ width: '313px', height: '234px' }}>
                    <Link href={`rooms/${wishlist.id}`}>
                      <Image
                        sizes="313px"
                        className="styled"
                        alt="img"
                        src={wishlist.images.split(',')[0]}
                        fill
                      />
                    </Link>
                  </StyledImage>
                  <div className="main">
                    {CATEGORY_MAP[wishlist.category_id - 1]}{' '}
                    {YEAR_MONTH_MAP[wishlist.sType_id - 1]} {wishlist.deposit}
                    {wishlist.sType_id !== 1 && '/' + wishlist.fee}
                    <div className="heart">
                      <IconHeart
                        color="red"
                        fill="red"
                        onClick={() => delWishlist(wishlist.id)}
                      />
                    </div>
                  </div>
                  <div>{wishlist.doro}</div>
                  <div>{wishlist.title}</div>
                </WishWrapper>
              </Center_Div>
            ))}
          </WishContainer>
          {total && (
            <Center_Div style={{ margin: '30px 0 30px 0' }}>
              <CustomPagination
                page={activePage}
                onChange={setActivePage}
                total={total === 0 ? 1 : Math.ceil(total / WISHLIST_TAKE)}
              />
            </Center_Div>
          )}
        </div>
      ) : (
        <Center_Div>관심 목록이 비어있습니다.</Center_Div>
      )}
    </Container>
  ) : (
    <Center_Div className="m-40">로그인이 필요합니다.</Center_Div>
  )
}
const Container = styled.div``
const CountContainer = styled.div`
  margin: 2rem 0 1rem 1rem;
  font-size: 17px;
  display: flex;
  .loader {
    margin: 0 10px;
  }
  .count {
    font-weight: 700;
    margin: 0 10px;
  }
`
const MenuContainer = styled.div`
  .seg {
    display: none;
  }

  @media (min-width: 768px) {
    .seg {
      display: flex;
    }
    .btn {
      display: none;
    }
  }
` 

const WishContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  font-size: 0.75rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`
const WishWrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 313px;
  height: 330px;
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .main {
    margin: 10px 5px 0 5px;
    display: flex;
    font-size: 20px;
    font-weight: 700;
    align-items: center;
  }
  .sub {
    display: flex;
    flex-flow: column;
  }
  .heart {
    margin-left: auto;
    :hover {
      cursor: pointer;
    }
  }
`

const MenuBtn = styled(Center_Div)`
  background-color: black;
  color: ${subColor_light};
  padding: 10px 15px 10px 20px;
  font-size: 13px;
  margin: 0 1rem;
  :hover {
    cursor: pointer;
  }
  width: 6.5rem;
`
