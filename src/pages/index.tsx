import { Loader } from '@mantine/core'
import { IconHeart, IconSearch } from '@tabler/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  StyledImage,
  subColor_Dark,
  subColor_medium,
} from 'components/styledComponent'
import { CATEGORY_MAP, YEAR_MONTH_MAP } from 'constants/const'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styled from '@emotion/styled'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface HomeRoom {
  id: number
  category_id: number
  title: string
  images: string
  sType_id: number
  deposit: number
  fee: number
  doro: string
}

export default function Home() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { status } = useSession()

  const [keyword, setKeyword] = useState<string>('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }
  const handleEnterKeypress = (e: React.KeyboardEvent) => {
    //enter 검색
    if (e.key == 'Enter') {
      router.push(`/rooms?keyword=${keyword}`, '/rooms')
    }
  }
  const HOME_ROOMS_QUERY_KEY = 'api/room/get-RecommendRooms'
  const HOME_WISHLISTS_QUERY_KEY = 'api/wishlist/get-Wishlists-Id'

  const { data: rooms, isLoading } = useQuery<
    { rooms: HomeRoom[] },
    unknown,
    HomeRoom[]
  >([HOME_ROOMS_QUERY_KEY], () =>
    fetch(HOME_ROOMS_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )

  const { data: wishlists } = useQuery<
    { wishlists: number[] },
    unknown,
    number[]
  >([HOME_WISHLISTS_QUERY_KEY], () =>
    fetch(HOME_WISHLISTS_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )

  const { mutate: updateIsWished } = useMutation<unknown, unknown, number, any>(
    (room_id) =>
      fetch('/api/wishlist/update-IsWished', {
        method: 'POST',
        body: JSON.stringify(room_id),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (room_id) => {
        await queryClient.cancelQueries({
          queryKey: [HOME_WISHLISTS_QUERY_KEY],
        })
        const previous = queryClient.getQueryData([HOME_WISHLISTS_QUERY_KEY])

        queryClient.setQueryData<number[]>([HOME_WISHLISTS_QUERY_KEY], (old) =>
          old
            ? wishlists?.includes(room_id)
              ? old.filter((o) => o !== room_id)
              : old.concat(room_id)
            : undefined
        )
        return previous
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([HOME_WISHLISTS_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([HOME_WISHLISTS_QUERY_KEY])
      },
    }
  )

  function heartCheck(
    room_id: number,
    { type }: { type: string }
  ): string | undefined {
    if (status === 'authenticated') {
      if (wishlists?.includes(room_id)) {
        return 'red'
      }
    }
    if (type === 'fill') {
      return 'white'
    }
    return 'grey'
  }

  return (
    <Container>
      <div className="sector">
        <div className="search">어떤 스팟을 찾으세요?</div>
        <Home_Search_Div style={{ margin: '30px 0 0 0' }}>
          <IconSearch size={21} />
          <Home_Input
            style={{ fontSize: '18px', width: '100%' }}
            value={keyword}
            onChange={handleChange}
            placeholder="주소나 건물명을 입력하세요"
            onKeyUp={handleEnterKeypress}
          />
        </Home_Search_Div>
      </div>
      <div style={{ padding: '20px 0 50px 0' }}>
        <Home_Recommend_Div>
          <div className="title">
            추천스팟
            <div className="sub">조회수가 높은 매물들입니다.</div>
          </div>
          {isLoading ? (
            <Center_Div style={{ height: '305px' }}>
              <Loader color="dark" />
            </Center_Div>
          ) : (
            <GridContainer>
              {rooms &&
                rooms.map((room, idx) => (
                  <div className="flex flex-col justify-center items-center">
                    <div key={idx} className={`wrapper div${idx}`}>
                      <StyledImage
                        style={{
                          width: '312px',
                          height: '234px',
                        }}
                      >
                        <Link href={`rooms/${room.id}`}>
                          <Image
                            sizes="300px, 225px"
                            fill
                            className="styled"
                            src={room.images.split(',')[0]}
                            alt={'thumbnail'}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNksgUAAEcAQcKdpC0AAAAASUVORK5CYII="
                          />
                        </Link>
                      </StyledImage>
                      <div className="description">
                        <div className="main">
                          {CATEGORY_MAP[room.category_id - 1]}{' '}
                          {YEAR_MONTH_MAP[room.sType_id - 1]} {room.deposit}
                          {room.sType_id !== 1 && '/' + room.fee}
                          <div className="heart">
                            <IconHeart
                              size={26}
                              stroke={1.5}
                              color={heartCheck(room.id, { type: 'color' })}
                              fill={heartCheck(room.id, { type: 'fill' })}
                              onClick={() =>
                                status === 'authenticated'
                                  ? updateIsWished(room.id)
                                  : router.push('/login')
                              }
                            />
                          </div>
                        </div>
                        <div>{room.doro}</div>
                        <div>{room.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </GridContainer>
          )}
        </Home_Recommend_Div>
      </div>
    </Container>
  )
}
export const alignCenter = styled.div`
  display: flex;
  align-items: center;
`
export const Center_Div = styled(alignCenter)`
  justify-content: center;
`

const Container = styled.div`
  .sector {
    border-bottom: solid 0.5px black;
    padding: 160px 25px 180px 25px;
    margin: 0 15px 0 15px;
  }
  .search {
    font-size: 1.5rem;
    font-weight: 600;
    @media (min-width: 576px) {
      font-size: 1.75rem;
      font-weight: 700;
    }
    @media (min-width: 768px) {
      font-size: 2rem;
      font-weight: 700;
    }
    @media (min-width: 992px) {
    }
    @media (min-width: 1200px) {
    }
  }
  .title {
    font-size: 20px;
    font-weight: 300;
    margin: 20px 15px 40px 15px;
    position: relative;
  }
`
export const Home_Input = styled.input`
  margin: 0 10px 0 10px;
  :focus {
    outline: none !important;
  }
`

export const Home_Search_Div = styled(alignCenter)`
  :hover {
    border: 0.5px solid black;
  }
  :active {
    border: 1px solid black;
  }
  :focus {
    outline: none !important;
    border: 1px solid black;
  }
  border: 0.5px solid ${subColor_medium};
  padding: 10px;
`

const Home_Recommend_Div = styled.div`
  font-size: 16px;
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    display: none;
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 14px;
    color: ${subColor_Dark};
    z-index: 1;
  }
  :hover {
    .sub {
      display: block;
    }
  }
`
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 30px;
  grid-column-gap: 30px;
  * {
    font-size: 0.75rem;
  }
  .wrapper {
    width: 310px;
  }
  .main {
    display: flex;
    font-size: 1rem;
    font-weight: 700;
    align-items: center;
  }
  .heart {
    margin-left: auto;
    :hover {
      cursor: pointer;
    }
  }
  .description {
    margin: 10px 0 10px 0;
  }

  grid-template-columns: repeat(1, 1fr);
  @media (min-width: 576px) {
  }
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
    .div3 {
      display: none;
    }
  }
  @media (min-width: 1200px) {
  }
`
