import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
} from 'react-kakao-maps-sdk'
import styled from '@emotion/styled'
import Image from 'next/image'
import { StyledImage, subColor_light } from 'components/styledComponent'
import { CATEGORY_MAP, YEAR_MONTH_MAP } from 'constants/const'
import {
  IconArrowDown,
  IconCategory,
  IconHeart,
  IconHome,
  IconLogout,
  IconSearch,
  IconUser,
  IconX,
} from '@tabler/icons'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Menu, Modal } from '@mantine/core'
import { Overlay_Container } from './rooms'
import Link from 'next/link'
import CustomSegmentedControl from 'components/CustomSegmentedControl'

export const menuStyle = (state: string, item: number | string) => {
  if (typeof item === 'number') {
    return {
      backgroundColor: `${Number(state) === item ? 'black' : 'white'}`,
      color: `${Number(state) === item ? subColor_light : 'black'}`,
    }
  }
  if (typeof item === 'string') {
    return {
      backgroundColor: `${state === item ? 'black' : 'white'}`,
      color: `${state === item ? subColor_light : 'black'}`,
    }
  }
}
interface RoomAllData {
  id: number
  category_id: number
  user_id: string
  status_id: number
  type_id: number
  updatedAt: Date
  title: string
  description: string
  views: number
  wished: number
  images: string
  contact: string

  sType_id: number
  deposit: number
  fee: number

  supply_area: number
  area: number
  total_floor: number
  floor: number
  move_in: Date
  heat_id: number

  name: string
  doro: string
  jibun: string
  detail: string
  lat: number
  lng: number

  maintenance_fee: number
  maintenance_ids?: string
  elevator: boolean
  parking: boolean
  parking_fee: number
  structure_ids?: string
  option_ids?: string
}
export default function MainMap() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => {
    setIsOpen(true)
  }
  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const [category, setCategory] = useState<string>('0')
  const [ym, setYm] = useState<string>('0')
  const [keyword, setKeyword] = useState<string>(
    router.query.keyword ? String(router.query.keyword) : ''
  )
  const [search, setSearch] = useState<string>(
    router.query.keyword ? String(router.query.keyword) : ''
  )
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }
  const handleEnterKeypress = (e: React.KeyboardEvent) => {
    if (e.key == 'Enter') {
      router.replace(
        `/mainMap?keyword=${keyword}`,
        `/mainMap?keyword=${keyword}`,
        {
          shallow: true,
        }
      )
      setSearch(keyword)
    }
  }

  const [map, setMap] = useState<kakao.maps.Map | undefined>()

  const [overlay, setOverlay] = useState<{
    id: number | undefined
    isOpened: boolean
  }>({
    id: undefined,
    isOpened: false,
  })
  const [center, setCenter] = useState<{
    lat: number
    lng: number
  }>({ lat: 35.824171, lng: 127.14805 })

  const ROOMS_ON_MAP_QUERY_KEY = `api/room/get-Rooms-OnMap?keyword=&category_id=${category}&sType_id=${ym}&orderBy=$`
  const { data: markers } = useQuery<
    { markers: RoomAllData[] },
    unknown,
    RoomAllData[]
  >([ROOMS_ON_MAP_QUERY_KEY], () =>
    fetch(ROOMS_ON_MAP_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )

  const WISHLISTS_QUERY_KEY = 'api/wishlist/get-Wishlists-Id'
  const { data: wishlists } = useQuery<
    { wishlists: number[] },
    unknown,
    number[]
  >([WISHLISTS_QUERY_KEY], () =>
    fetch(WISHLISTS_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )

  useEffect(() => {
    if (!search || !map) return

    const ps = new kakao.maps.services.Places()

    ps.keywordSearch(search, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        setOverlay({ id: undefined, isOpened: false })
        setCenter({ lat: Number(data[0].y), lng: Number(data[0].x) }) //가장 연관된 keyword 주소를 센터로
        map.setLevel(5)
      }
    })
  }, [search, map])

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
          queryKey: [WISHLISTS_QUERY_KEY],
        })
        const previous = queryClient.getQueryData([WISHLISTS_QUERY_KEY])

        queryClient.setQueryData<number[]>([WISHLISTS_QUERY_KEY], (old) =>
          old
            ? wishlists?.includes(room_id)
              ? old.filter((o) => o !== room_id)
              : old.concat(room_id)
            : undefined
        )
        return previous
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([WISHLISTS_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([WISHLISTS_QUERY_KEY])
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
    return 'gray'
  }

  const openOverlay = (room_id: number) => {
    setOverlay({ id: room_id, isOpened: true })
  }
  return (
    <Container>
      <MenuContainer>
        <MenuIcon onClick={() => router.push('/')}>
          <IconHome size={20} color="white" stroke={1.5} />
        </MenuIcon>
        <SearchContainer>
          <IconSearch size={18} />
          <SearchWrapper
            value={keyword}
            onChange={handleChange}
            placeholder="주소나 건물명을 입력하세요"
            onKeyUp={handleEnterKeypress}
          />
        </SearchContainer>
        <Menu width={160}>
          <Menu.Target>
            <MenuBtn>
              매물 종류
              <IconArrowDown className="icon" size={15} />
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
              <IconArrowDown className="icon" size={15} />
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
        <MenuIcon className="filter" onClick={handleOpenModal}>
          <IconCategory size={20} stroke={1.5} color="white" />
        </MenuIcon>
        <MenuIcon
          onClick={() =>
            status === 'authenticated'
              ? router.push('/wishlist')
              : router.push('/login')
          }
        >
          <IconHeart size={20} stroke={1.5} color="white" />
        </MenuIcon>
        <MenuIcon>
          {status === 'authenticated' ? (
            <Menu width={120}>
              <Menu.Target>
                <Image
                  src={session.user?.image!}
                  alt="profile"
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%' }}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={() => router.push('/upload?isManagePage=true')}
                >
                  내 방 관리
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => signOut()}>
                  <Center2_Div>
                    <IconLogout size={15} className="mr-1" />
                    로그아웃
                  </Center2_Div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <IconUser
              size={20}
              stroke={1.5}
              color="white"
              onClick={() => router.push('/login')}
            />
          )}
        </MenuIcon>
      </MenuContainer>
      <Map
        onCreate={setMap}
        level={6}
        center={{ lat: center.lat, lng: center.lng }}
        style={{
          width: '100vw',
          height: '100vh',
        }}
        disableDoubleClick
        isPanto={true}
        onDragStart={() => setOverlay({ id: undefined, isOpened: false })}
        onZoomStart={() => setOverlay({ id: undefined, isOpened: false })}
        onIdle={() => setSearch('')}
        onTileLoaded={() => setSearch('')}
      >
        <MarkerClusterer
          averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
          minLevel={4} // 클러스터 할 최소 지도 레벨
        >
          {markers?.map((room) => (
            <MapMarker
              key={`${room.lat}-${room.lng}`}
              position={{
                lat: room.lat,
                lng: room.lng,
              }}
              onClick={() => openOverlay(room.id)}
              clickable={true}
            />
          ))}
        </MarkerClusterer>
        {markers?.map((room) => (
          <div key={`Overlay-${room.id}`}>
            {overlay.id === room.id && overlay.isOpened && (
              <CustomOverlayMap
                zIndex={1}
                position={{
                  lat: room.lat,
                  lng: room.lng,
                }}
                xAnchor={0.5}
                yAnchor={1.16}
              >
                <Overlay_Container>
                  <StyledImage
                    style={{
                      width: '200px',
                      height: '150px',
                    }}
                  >
                    <Link href={`rooms/${room.id}`}>
                      <Image
                        sizes="200px"
                        className="styled"
                        src={room.images.split(',')[0]}
                        fill
                        alt={`${room.name}`}
                      />
                    </Link>
                  </StyledImage>
                  <div
                    className="btn x"
                    onClick={() => setOverlay({ id: room.id, isOpened: false })}
                  >
                    <IconX size={14} stroke={2} />
                  </div>
                  <div className="wrapper">
                    <div className="name">
                      <div
                        style={{
                          width: '190px',
                        }}
                      >
                        {room.name}
                      </div>
                      <div className="btn" style={{ marginLeft: 'auto' }}>
                        <IconHeart
                          size={22}
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
                    <div className="main">
                      {CATEGORY_MAP[room.category_id - 1]}{' '}
                      {YEAR_MONTH_MAP[room.sType_id - 1]} {room.deposit}
                      {room.sType_id !== 1 && '/' + room.fee}
                    </div>
                    <div>{room.doro}</div>
                  </div>
                </Overlay_Container>
              </CustomOverlayMap>
            )}
          </div>
        ))}
      </Map>
      <Modal
        opened={isOpen}
        onClose={handleCloseModal}
        withCloseButton={false}
        size={380}
      >
        <div className="flex flex-col">
          <CustomSegmentedControl
            size={18}
            value={String(ym)}
            onChange={setYm}
            data={[
              {
                label: '전체',
                value: '0',
              },
              ...YEAR_MONTH_MAP.map((label, idx) => ({
                label: label,
                value: String(idx + 1),
              })),
            ]}
          />
          <div className="border-b border-gray m-2 pl-2 pr-2" />
          <CustomSegmentedControl
            size={18}
            value={String(category)}
            onChange={setCategory}
            data={[
              {
                label: '전체',
                value: '0',
              },
              { label: '원룸', value: '1' },
              { label: '투룸', value: '2' },
            ]}
          />
          <CustomSegmentedControl
            size={18}
            value={String(category)}
            onChange={setCategory}
            data={[
              { label: '쓰리룸', value: '3' },
              { label: '오피스텔 ∙ 도시형', value: '4' },
              { label: '그 외', value: '5' },
            ]}
          />
        </div>
      </Modal>
    </Container>
  )
}

export const Center_Div = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
export const Center2_Div = styled.div`
  display: flex;
  align-items: center;
`

const Container = styled.div`
  position: relative;
  media (max-width: 575px) {
    width: 100%;
    height: 100%;
  }
`

const MenuContainer = styled(Center2_Div)`
  display: flex;
  width: 100%;
  margin: 0.5rem 0 0.5rem 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  padding: 0 0.5rem 0 0.5rem;
`
const MenuBtn = styled(Center_Div)`
  background-color: black;
  color: ${subColor_light};
  padding: 10px 15px 10px 20px;
  font-size: 13px;
  margin: 0 5px 0 5px;
  :hover {
    cursor: pointer;
  }
  @media (max-width: 767px) {
  }
  @media (max-width: 991px) {
    display: none;
  }
  width: 5rem;
`

const MenuIcon = styled(Center_Div)`
  :hover {
    cursor: pointer;
  }
  margin-right: 0.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: black;
  @media (min-width: 992px) {
    &.filter {
      display: none;
    }
  }
`

const SearchContainer = styled(Center2_Div)`
  margin-right: 0.5rem;
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
  padding: 0.5rem;
  background-color: white;
  border: 0.5px solid black;

  width: 150px;
  @media (min-width: 576px) {
    width: 300px;
  }
  @media (min-width: 768px) {
    width: 400px;
  }
  @media (min-width: 992px) {
    width: 500px;
  }
  @media (min-width: 1200px) {
    width: 600px;
  }
`

const SearchWrapper = styled.input`
  margin: 0 10px 0 10px;
  width: 100%;
  font-size: 0.7rem;
  :focus {
    outline: none !important;
  }
  @media (max-width: 576px) {
    &::placeholder {
      visibility: hidden;
    }
  }
`