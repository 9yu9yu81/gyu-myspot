import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Chip, FileButton, Loader, Menu, Modal } from '@mantine/core'
import { IconArrowDown, IconExclamationCircle, IconMapPin, IconX } from '@tabler/icons'
import {
  Center_Div,
  Center2_Div,
  HoverDiv,
  StyledImage,
  subColor_Dark,
  subColor_light,
  subColor_lighter,
  subColor_medium,
  CenterCol,
} from 'components/styledComponent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  CATEGORY_MAP,
  STATUS_MAP,
  YEAR_MONTH_MAP,
  TYPE_MAP,
  HEAT_MAP,
  MAINTENENCE_MAP,
  STRUCTURE_MAP,
  OPTION_MAP,
  getOnlyNumber,
} from 'constants/const'
import { useRouter } from 'next/router'
import format from 'date-fns/format'
import styled from '@emotion/styled'
import { Calendar } from '@mantine/dates'
import { add, differenceInDays, sub } from 'date-fns'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { menuStyle } from './mainMap'
const Map = dynamic(import('components/MapN'))
const UploadCaveats = dynamic(import('components/upload/UploadCaveats'))
const CustomSegmentedControl = dynamic(
  import('components/CustomSegmentedControl')
)
const CustomCheckBox = dynamic(import('components/CustomCheckBox'))
const CustomPagination = dynamic(import('components/CustomPagination'))
const HomeLogo = dynamic(import('components/home/HomeLogo'))

const DESCRIPTION_PLACEHOLDER = `[상세설명 작성 주의사항]
- 매물 정보와 관련없는 홍보성 정보는 입력할 수 없습니다.
- 매물등록 규정에 위반되는 금칙어는 입력할 수 없습니다.

위 주의사항 위반시 임의로 매물 삭제 혹은 서비스 이용이 제한될 수 있습니다.`

const DETAILADDR_PLACEHOLDER = `상세 주소
예) e편한세상 101동 1101호`

interface RoomUploadData {
  room: {
    category_id: number
    type_id: number
    title: string
    description: string
    images: string
    contact: string
  }
  saleInfo: { type_id: number; deposit: number; fee: number }
  basicInfo: {
    supply_area: number
    area: number
    total_floor: number
    floor: number
    move_in: Date
    heat_id: number
  }
  addressInfo: {
    name: string
    doro: string
    jibun: string
    detail: string
    lat: number
    lng: number
  }
  moreInfo: {
    maintenance_fee: number
    maintenance_ids?: string
    elevator: boolean
    parking: boolean
    parking_fee: number
    structure_ids?: string
    option_ids?: string
  }
}
interface ManagedRoom {
  id: number
  category_id: number
  status_id: number
  type_id: number
  updatedAt: Date
  title: string
  views: number
  wished: number
  images: string
  contact: string
  sType_id: number //전월세
  deposit: number
  fee: number
  doro: string
  detail: string
  area: number
}

interface RoomStatus {
  id: number
  status_id: number
}

export default function Upload() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const [activePage, setActivePage] = useState(1) //page
  const MANAGED_ROOMS_TAKE: number = 5
  const MANAGED_ROOMS_COUNT_QUERY_KEY = 'api/room/get-ManagedRooms-Total'
  const MANAGED_ROOMS_QUERY_KEY = `api/room/get-ManagedRooms-Take?skip=${
    (activePage - 1) * MANAGED_ROOMS_TAKE
  }&take=${MANAGED_ROOMS_TAKE}`
  const USER_CONTACT_QUERY_KEY = 'api/user/get-Contact'

  const [isUploadPage, setIsUploadPage] = useState(true) //방 내놓기 or 내 방 관리
  useEffect(() => {
    //내 방 관리로 바로 이동
    router.query.isManagePage === 'true' && setIsUploadPage(false)
  }, [router.query.isManagePage])

  const chipStyles = {
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    label: {
      display: 'flex',
      height: '35px',
      borderRadius: 0,
      border: `0.5px solid ${subColor_medium} !important`,
    },
  }

  //state
  const [category, setCategory] = useState<string>('1') //매물종류
  const [roomType, setRoomType] = useState<string>('1') //건물유형
  const [ym, setYm] = useState<string>('1') //전월세종류
  const [heat, setHeat] = useState<string>('1') //난방종류
  const depositRef = useRef<HTMLInputElement | null>(null) //보증금
  const [fee, setFee] = useState<string>('0') //월세
  const areaRef = useRef<HTMLInputElement | null>(null) //전용면적
  const supAreaRef = useRef<HTMLInputElement | null>(null) //공급면적
  const floorRef = useRef<HTMLInputElement | null>(null) //층
  const totalFloorRef = useRef<HTMLInputElement | null>(null) //건물층수
  const titleRef = useRef<HTMLInputElement | null>(null) //제목
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null) //상세설명
  const [images, setImages] = useState<string[]>([]) //사진
  const [moveIn, setMoveIn] = useState<Date | null>(new Date()) //입주가능일
  const [modal, setModal] = useState<boolean>(false) //캘린더 모달
  const [mChecked, setMChecked] = useState<boolean>(false) //관리비 없음 체크
  const [mFee, setMFee] = useState<string>('0') //관리비
  const [mOption, setMOption] = useState<string[]>([]) //관리비 항목
  const [elevator, setElevator] = useState<string>('0') //엘베 유무
  const [parking, setParking] = useState<string>('0') //주차가능한지
  const [pFee, setPFee] = useState<string>('0') //주차비
  const [option, setOption] = useState<string[]>([]) //옵션항목
  const [structure, setStructure] = useState<string[]>([]) //방구조
  const [contact, setContact] = useState<string>('')
  const [cChecked, setCChecked] = useState<boolean>(false)
  //daum-postcode
  const [name, setName] = useState<string>('') //건물명
  const [doro, setDoro] = useState<string>('') //도로주소
  const [jibun, setJibun] = useState<string>('') //지번주소
  const [lat, setLat] = useState<number>(0)
  const [lng, setLng] = useState<number>(0)
  const addrRef = useRef<HTMLInputElement | null>(null)
  const detailAddrRef = useRef<HTMLTextAreaElement | null>(null)
  //주소 검색을 눌렀는지 확인하는 state
  const [addrSearchComplete, setAddrSearchComplete] = useState<boolean>(false)
  //daum-postcode 띄우는 함수
  const loadLayout = () => {
    window.daum.postcode.load(() => {
      const postcode = new window.daum.Postcode({
        oncomplete: function (data: any) {
          if (data.userSelectedType === 'R') {
            // 사용자가 도로명 주소를 선택했을 경우
            if (addrRef.current) {
              addrRef.current.value = data.roadAddress
            }
          } else {
            // 사용자가 지번 주소를 선택했을 경우(J)
            if (addrRef.current) {
              addrRef.current.value = data.jibunAddress
            }
          }
          setName(data.buildingName)
          setDoro(data.roadAddress)
          setJibun(data.jibunAddress)
          setAddrSearchComplete(true) //주소 검색이 되었는지 확인
        },
      })
      postcode.open({
        q: addrRef.current?.value,
      })
    })
  }
  //위치 정보 주소 쓰는 input에서 enter 를 누르면 바로 '주소검색' 버튼이 눌리게 기능 구현
  const postcodeButtonRef = useRef<HTMLButtonElement | null>(null)
  const handleEnterKeypress = (e: React.KeyboardEvent) => {
    if (e.key == 'Enter') {
      if (postcodeButtonRef.current) {
        postcodeButtonRef.current.click()
      }
    }
  }
  //주소 좌표
  const onLoadKakaoMap = () => {
    kakao.maps.load(() => {
      //주소 변환 객체
      const geocoder = new kakao.maps.services.Geocoder()
      const addrConverter = (address: string) => {
        // 주소로 좌표를 검색
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setLng(Number(result[0].x))
            setLat(Number(result[0].y))
          }
        })
      }
      addrRef.current?.value && addrConverter(addrRef.current.value)
    })
  }
  useEffect(() => {
    onLoadKakaoMap()
  }, [addrRef.current?.value])

  //Image Uploader
  const [files, setFiles] = useState<File[]>([])
  useEffect(() => {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()

        fd.append('image', files[i], files[i].name)
        fetch(
          'https://api.imgbb.com/1/upload?expiration=600&key=340eff97531848cc7ed74f9ea0a716de',
          { method: 'POST', body: fd }
        )
          .then((res) => res.json())
          .then((data) => {
            console.log(data)
            setImages((prev) =>
              Array.from(new Set(prev.concat(data.data.image.url)))
            )
          })
          .catch((error) => console.log(error))
      }
    }
  }, [files])
  // 업로드된 image delete
  const handleImgDel = (delImage: string) => {
    setImages(images.filter((image) => image != delImage))
  }

  const { mutate: addRoom } = useMutation<
    unknown,
    unknown,
    RoomUploadData,
    any
  >(
    (room) =>
      fetch('/api/room/add-Room', {
        method: 'POST',
        body: JSON.stringify(room),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onSuccess: async () => {
        setCategory('1')
        setYm('1')
        setRoomType('1')
        setHeat('1')
        setMoveIn(new Date())
        setMChecked(false)
        setCChecked(false)
        setMOption([])
        setMFee('0')
        setElevator('0')
        setParking('0')
        setPFee('0')
        setOption([])
        setStructure([])
        setImages([])
        setIsUploadPage(false)
        queryClient.invalidateQueries([MANAGED_ROOMS_QUERY_KEY])
      },
    }
  )

  const validate = (type: 'submit') => {
    mChecked && setMFee('0')
    ym === '1' && setFee('0')
    if (cChecked === false && contact !== '' && contact !== userContact) {
      if (confirm('해당 연락처를 기존 번호로 저장 하시겠습니까?')) {
        updateContact(contact)
      }
    }

    if (type === 'submit') {
      addrRef.current?.value == ''
        ? alert('주소를 입력하세요.')
        : detailAddrRef.current?.value == ''
        ? alert('상세 주소를 입력하세요.')
        : depositRef.current?.value == ''
        ? alert('보증금을 입력하세요.')
        : ym === '2' && fee == '0'
        ? alert('가격을 입력하세요.')
        : supAreaRef.current?.value == ''
        ? alert('공급 면적을 입력하세요.')
        : areaRef.current?.value == ''
        ? alert('전용 면적을 입력하세요.')
        : totalFloorRef.current?.value == ''
        ? alert('건물 층수를 입력하세요.')
        : floorRef.current?.value == ''
        ? alert('해당 층수를 입력하세요.')
        : !mChecked && mFee == '0'
        ? alert('관리비를 입력해주세요. 없다면 관리비 없음을 체크해 주세요.')
        : !mChecked && mFee != '0' && mOption == null
        ? alert('관리비 항목을 선택해주세요.')
        : floorRef.current?.value == ''
        ? alert('관리비를 입력해주세요. 없다면 관리비 없음을 체크해 주세요.')
        : titleRef.current?.value == ''
        ? alert('제목을 입력하세요')
        : descriptionRef.current?.value == ''
        ? alert('상세 설명을 입력하세요.')
        : contact === ''
        ? alert('연락받을 번호를 입력해 주세요.')
        : images.length < 3 || images.length > 10
        ? alert('최소 3장, 최대 10장 이미지를 첨부해주세요')
        : moveIn &&
          addRoom({
            room: {
              category_id: Number(category),
              type_id: Number(roomType),
              title: String(titleRef.current?.value),
              description: String(descriptionRef.current?.value),
              images: images.join(','),
              contact: contact,
            },
            saleInfo: {
              type_id: Number(ym),
              deposit: Number(depositRef.current?.value),
              fee: Number(fee),
            },
            basicInfo: {
              supply_area: Number(supAreaRef.current?.value),
              area: Number(areaRef.current?.value),
              total_floor: Number(totalFloorRef.current?.value),
              floor: Number(floorRef.current?.value),
              move_in: moveIn,
              heat_id: Number(heat),
            },
            addressInfo: {
              name: name,
              doro: doro,
              jibun: jibun,
              detail: String(detailAddrRef.current?.value),
              lat: lat,
              lng: lng,
            },
            moreInfo: {
              maintenance_fee: Number(mFee),
              maintenance_ids:
                mOption.length === 0 ? undefined : mOption.join(','),
              elevator: Boolean(Number(elevator)),
              parking: Boolean(Number(parking)),
              parking_fee: parking === '0' ? 0 : Number(pFee),
              option_ids: option.length === 0 ? undefined : option.join(','),
              structure_ids:
                structure.length === 0 ? undefined : structure.join(','),
            },
          })
    }
  }

  const { data: userContact } = useQuery<
    { userContact: string },
    unknown,
    string
  >(
    [USER_CONTACT_QUERY_KEY],
    () =>
      fetch(USER_CONTACT_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onSuccess: async (userContact) => {
        userContact !== '' && (setCChecked(true), setContact(userContact))
      },
    }
  )

  const { data: rooms, isLoading: roomsLoading } = useQuery<
    { rooms: ManagedRoom[] },
    unknown,
    ManagedRoom[]
  >([MANAGED_ROOMS_QUERY_KEY], () =>
    fetch(MANAGED_ROOMS_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
  )

  const { data: total } = useQuery(
    // get total page
    [MANAGED_ROOMS_COUNT_QUERY_KEY],
    () =>
      fetch(MANAGED_ROOMS_COUNT_QUERY_KEY)
        .then((res) => res.json())
        .then((data) =>
          data.items === 0 ? 1 : Math.ceil(data.items / MANAGED_ROOMS_TAKE)
        ),
    {
      onSuccess: async () => {
        setActivePage(1)
      },
    }
  )

  const { mutate: updateContact } = useMutation<unknown, unknown, string, any>(
    (contact) =>
      fetch('/api/user/update-Contact', {
        method: 'POST',
        body: JSON.stringify(contact),
      })
        .then((data) => data.json())
        .then((res) => res.items)
  )

  const { mutate: deleteRoom } = useMutation<unknown, unknown, number, any>(
    (id) =>
      fetch('/api/room/delete-Room', {
        method: 'POST',
        body: JSON.stringify(id),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries([MANAGED_ROOMS_QUERY_KEY])
        const previous = queryClient.getQueryData([MANAGED_ROOMS_QUERY_KEY])

        if (previous) {
          queryClient.setQueryData<ManagedRoom[]>(
            [MANAGED_ROOMS_QUERY_KEY],
            (olds) => olds?.filter((f) => f.id !== id)
          )
        }

        return previous
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([MANAGED_ROOMS_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([MANAGED_ROOMS_QUERY_KEY])
      },
    }
  )

  const { mutate: updateStatus } = useMutation<
    unknown,
    unknown,
    RoomStatus,
    any
  >(
    (items) =>
      fetch('/api/room/update-Room-Status', {
        method: 'POST',
        body: JSON.stringify(items),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (items) => {
        await queryClient.cancelQueries([MANAGED_ROOMS_QUERY_KEY])

        const previous = queryClient.getQueryData([MANAGED_ROOMS_QUERY_KEY])

        if (previous) {
          queryClient.setQueryData<ManagedRoom[]>(
            [MANAGED_ROOMS_QUERY_KEY],
            (olds) =>
              olds &&
              olds.map((old) =>
                old.id === items.id
                  ? { ...old, status_id: items.status_id }
                  : { ...old }
              )
          )
        }
        return { previous }
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([MANAGED_ROOMS_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([MANAGED_ROOMS_QUERY_KEY])
      },
    }
  )
  const updateStatus1 = (room_id: number, room_updatedAt: Date) => {
    const ExpiredDate = sub(new Date(), { days: 30 })
    if (new Date(room_updatedAt) < ExpiredDate) {
      updateStatus({ id: room_id, status_id: 3 })
    } else updateStatus({ id: room_id, status_id: 1 })
  }

  const { mutate: updateRenew } = useMutation<unknown, unknown, number, any>(
    (item) =>
      fetch('/api/room/update-ExpiredRoom-Renew', {
        method: 'POST',
        body: JSON.stringify(item),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries([MANAGED_ROOMS_QUERY_KEY])

        const previous = queryClient.getQueryData([MANAGED_ROOMS_QUERY_KEY])

        if (previous) {
          queryClient.setQueryData<ManagedRoom[]>(
            [MANAGED_ROOMS_QUERY_KEY],
            (olds) =>
              olds &&
              olds.map((old) =>
                old.id === item
                  ? { ...old, status_id: 1, updatedAt: new Date() }
                  : { ...old }
              )
          )
        }
        return { previous }
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([MANAGED_ROOMS_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([MANAGED_ROOMS_QUERY_KEY])
      },
    }
  )
  return session ? (
    <Container>
      <HomeLogo size={50} margin={100} />
      {isUploadPage ? (
        <>
          <Center_Div style={{ width: '100%' }}>
            <MainBtn className="dark" onClick={() => setIsUploadPage(true)}>
              방 내놓기
            </MainBtn>
            <MainBtn onClick={() => setIsUploadPage(false)}>내 방 관리</MainBtn>
          </Center_Div>
          <div className="w-full mt-4">
            <UploadCaveats />
          </div>
          <UploadContainer id="room">
            <Title>매물 정보</Title>
            <UploadSubContainer className="border-b">
              <SubTitle>매물 종류</SubTitle>
              <Center2_Div className="seg">
                <CustomSegmentedControl
                  value={String(category)}
                  onChange={setCategory}
                  data={CATEGORY_MAP.map((label, idx) => ({
                    label: label,
                    value: String(idx + 1),
                  }))}
                />
              </Center2_Div>
              <Center_Div className="menubtn " style={{ padding: '0.5rem' }}>
                <Menu width={180}>
                  <Menu.Target>
                    <MenuBtn style={{ width: '8rem' }}>
                      {CATEGORY_MAP[Number(category) - 1]}
                      <IconArrowDown size={15} />
                    </MenuBtn>
                  </Menu.Target>
                  <Menu.Dropdown>
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
              </Center_Div>
            </UploadSubContainer>
            <UploadSubContainer>
              <SubTitle>건물 유형</SubTitle>
              <Center2_Div className="seg">
                <CustomSegmentedControl
                  value={String(roomType)}
                  onChange={setRoomType}
                  data={TYPE_MAP.map((label, idx) => ({
                    label: label,
                    value: String(idx + 1),
                  }))}
                />
              </Center2_Div>
              <Center_Div className="menubtn" style={{ padding: '0.5rem' }}>
                <Menu width={160}>
                  <Menu.Target>
                    <MenuBtn style={{ width: '8rem' }}>
                      {TYPE_MAP[Number(roomType) - 1]}
                      <IconArrowDown size={15} />
                    </MenuBtn>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {TYPE_MAP.map((item, idx) => (
                      <Menu.Item
                        key={`${item}-${idx}`}
                        value={idx}
                        onClick={() => setRoomType(String(idx + 1))}
                        style={menuStyle(roomType, idx + 1)}
                      >
                        <Center_Div>{item}</Center_Div>
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </Center_Div>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer id="address">
            <AbsoluteText>*등기부등본 상의 주소를 입력해 주세요.</AbsoluteText>
            <Title>위치 정보</Title>
            <UploadSubContainer className="address">
              <SubTitle id="address">주소</SubTitle>
              <div className="sub-address">
                <CenterCol className="mb-3">
                  <div>
                    <Center2_Div className="font-light">
                      <IconExclamationCircle
                        className="mr-1"
                        size={18}
                        stroke={1.5}
                      />
                      도로명, 건물명, 지번에 대해 통합검색이 가능합니다.
                    </Center2_Div>
                    <Center2_Div>
                      <AddressInput
                        type="text"
                        placeholder="예) 번동 10-1, 강북구 번동"
                        ref={addrRef}
                        onKeyUp={handleEnterKeypress}
                      />
                      <SubBtn
                        className="dark"
                        onClick={loadLayout}
                        ref={postcodeButtonRef}
                      >
                        주소 검색
                      </SubBtn>
                    </Center2_Div>
                    <Upload_Textarea1
                      placeholder={DETAILADDR_PLACEHOLDER}
                      ref={detailAddrRef}
                    />
                  </div>
                </CenterCol>
                <Center_Div>
                  {addrSearchComplete && addrRef.current?.value !== '' ? (
                    <Map
                      width="310px"
                      height="280px"
                      address={addrRef.current?.value}
                    />
                  ) : (
                    <Center_Div
                      style={{
                        flexFlow: 'column',
                        width: '310px',
                        height: '280px',
                        border: `0.5px solid ${subColor_medium}`,
                        fontWeight: '300',
                      }}
                    >
                      <IconMapPin size={20} stroke={1.5} />
                      <div>주소 검색을 하시면</div>
                      <div>해당 위치가 지도에 표시됩니다.</div>
                    </Center_Div>
                  )}
                </Center_Div>
              </div>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>거래 정보</Title>
            <UploadSubContainer className="half">
              <HalfContainer className="border-b">
                <SubTitle>거래 종류</SubTitle>
                <Center2_Div>
                  <CustomSegmentedControl
                    value={ym}
                    onChange={setYm}
                    data={YEAR_MONTH_MAP.map((label, idx) => ({
                      label: label,
                      value: String(idx + 1),
                    }))}
                  />
                </Center2_Div>
              </HalfContainer>
              <HalfContainer>
                <SubTitle>가격</SubTitle>
                <Center2_Div className="pl-2">
                  {ym === '1' ? (
                    <Center2_Div>
                      <Upload_Input2
                        type="number"
                        placeholder="전세"
                        ref={depositRef}
                        onInput={(e) => getOnlyNumber(e)}
                      />{' '}
                      만원
                    </Center2_Div>
                  ) : (
                    <>
                      <Center2_Div>
                        <Upload_Input2
                          type="number"
                          placeholder="보증금"
                          ref={depositRef}
                          onInput={(e) => getOnlyNumber(e)}
                        />{' '}
                        /
                        <Upload_Input2
                          type="number"
                          placeholder="월세"
                          onChange={(e) => setFee(e.target.value)}
                          onBlur={(e) => e.target.value === '' && setFee('0')}
                          value={fee}
                          onInput={(e) => getOnlyNumber(e)}
                        />{' '}
                        만원
                      </Center2_Div>
                    </>
                  )}
                </Center2_Div>
              </HalfContainer>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>기본 정보</Title>
            <UploadSubContainer className="half">
              <HalfContainer className="border-b">
                <SubTitle className="flex-col">
                  <div>건물 크기</div>
                  <div>(1평=3.3058㎡)</div>
                </SubTitle>
                <Center2_Div className="flex-col">
                  <Center2_Div className=" w-full pl-4">
                    공급 면적
                    <Upload_Input2
                      type="number"
                      ref={supAreaRef}
                      onInput={(e) => getOnlyNumber(e)}
                    />{' '}
                    평
                  </Center2_Div>
                  <Center2_Div className=" w-full pl-4">
                    전용 면적
                    <Upload_Input2
                      type="number"
                      ref={areaRef}
                      onInput={(e) => getOnlyNumber(e)}
                    />{' '}
                    평
                  </Center2_Div>
                </Center2_Div>
              </HalfContainer>
              <HalfContainer className="border-b">
                <SubTitle className="flex-col">
                  <div>건물 층수</div>
                </SubTitle>
                <Center2_Div className="flex-col">
                  <Center2_Div className=" w-full pl-4">
                    건물 층수
                    <Upload_Input2
                      type="number"
                      ref={totalFloorRef}
                      onInput={(e) => getOnlyNumber(e)}
                    />{' '}
                    층
                  </Center2_Div>
                  <Center2_Div className=" w-full pl-4">
                    해당 층수
                    <Upload_Input2
                      type="number"
                      ref={floorRef}
                      onInput={(e) => getOnlyNumber(e)}
                    />{' '}
                    층
                  </Center2_Div>
                </Center2_Div>
              </HalfContainer>
            </UploadSubContainer>
            <UploadSubContainer className="border-b">
              <SubTitle>난방 종류</SubTitle>
              <div className="seg ">
                <CustomSegmentedControl
                  value={heat}
                  onChange={setHeat}
                  data={HEAT_MAP.map((label, idx) => ({
                    label: label,
                    value: String(idx + 1),
                  }))}
                />
              </div>
              <Center_Div className="menubtn  w-full">
                <Menu width={160}>
                  <Menu.Target>
                    <MenuBtn style={{ margin: '0.5rem', width: '8rem' }}>
                      {HEAT_MAP[Number(heat) - 1]}
                      <IconArrowDown size={15} />
                    </MenuBtn>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {HEAT_MAP.map((item, idx) => (
                      <Menu.Item
                        key={`${item}-${idx}`}
                        value={idx}
                        onClick={() => setHeat(String(idx + 1))}
                        style={menuStyle(heat, idx + 1)}
                      >
                        <Center_Div>{item}</Center_Div>
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </Center_Div>
            </UploadSubContainer>
            <Modal
              withCloseButton={false}
              opened={modal}
              onClose={() => setModal(false)}
              centered
              size={'auto'}
              overlayOpacity={0.1}
            >
              <Center_Div className="flex-col">
                <Calendar value={moveIn} onChange={setMoveIn} />
                <SubBtn
                  className="outLine"
                  style={{ marginTop: '10px' }}
                  onClick={() => setModal(false)}
                >
                  선택 완료
                </SubBtn>
              </Center_Div>
            </Modal>
            <UploadSubContainer className="border-b">
              <SubTitle>입주 가능일</SubTitle>
              <Center2_Div className="pl-4 p-1">
                <SubBtn className="outLine" onClick={() => setModal(true)}>
                  날짜 선택
                </SubBtn>
                {moveIn && (
                  <Center2_Div
                    className="moveIn"
                    style={{ marginLeft: '10px' }}
                  >
                    {format(moveIn, 'yyyy년 MM월 dd일')}
                  </Center2_Div>
                )}
              </Center2_Div>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>추가 정보</Title>
            <UploadSubContainer className="border-b">
              <SubTitle>관리비</SubTitle>
              <Center2_Div className="flex-col">
                <Center2_Div className=" space-x-5 w-full">
                  <Upload_Input2
                    type="number"
                    disabled={mChecked}
                    onChange={(e) => setMFee(e.target.value)}
                    onBlur={(e) => e.target.value === '' && setMFee('0')}
                    value={mChecked ? '0' : mFee}
                    onInput={(e) => getOnlyNumber(e)}
                  />{' '}
                  만원
                  <CustomCheckBox
                    label="관리비 없음"
                    checked={mChecked}
                    onChange={(e) => setMChecked(e.target.checked)}
                  />
                </Center2_Div>
              </Center2_Div>
            </UploadSubContainer>
            <UploadSubContainer className="border-b">
              <SubTitle>관리비 항목</SubTitle>
              <Center2_Div className="flex-col ">
                <div className="w-full p-2">
                  <Chip.Group
                    multiple
                    value={mOption}
                    onChange={setMOption}
                    color={'dark'}
                  >
                    {MAINTENENCE_MAP.map((m, idx) => (
                      <Chip
                        key={idx}
                        color={'dark'}
                        styles={() => chipStyles}
                        value={String(idx + 1)}
                      >
                        {m}
                      </Chip>
                    ))}
                  </Chip.Group>
                </div>
              </Center2_Div>
            </UploadSubContainer>
            <UploadSubContainer className="parking">
              <HalfContainer className="parking border-b">
                <SubTitle>
                  <div>엘리베이터</div>
                </SubTitle>
                <Center2_Div className="">
                  <CustomSegmentedControl
                    value={elevator}
                    onChange={setElevator}
                    data={[
                      { value: '0', label: '불가능' },
                      { value: '1', label: '가능' },
                    ]}
                  />
                </Center2_Div>
              </HalfContainer>
              <HalfContainer className="parking border-b">
                <SubTitle>
                  <div>주차여부</div>
                </SubTitle>
                <Center2_Div>
                  <CustomSegmentedControl
                    value={parking}
                    onChange={setParking}
                    data={[
                      { value: '0', label: '불가능' },
                      { value: '1', label: '가능' },
                    ]}
                  />
                  {parking === '1' && (
                    <>
                      <Upload_Input4
                        type="number"
                        onChange={(e) => setPFee(e.target.value)}
                        onBlur={(e) => e.target.value === '' && setPFee('0')}
                        value={pFee}
                        onInput={(e) => getOnlyNumber(e)}
                      />{' '}
                      만원
                    </>
                  )}
                </Center2_Div>
              </HalfContainer>
            </UploadSubContainer>
            <UploadSubContainer className="border-b">
              <SubTitle>
                <div>구조</div>
              </SubTitle>
              <Center2_Div className="">
                <Chip.Group
                  style={{ padding: '10px 20px 10px 20px' }}
                  multiple
                  value={structure}
                  onChange={setStructure}
                  color={'dark'}
                >
                  {STRUCTURE_MAP.map((s, idx) => (
                    <Chip
                      key={idx}
                      color={'dark'}
                      styles={() => chipStyles}
                      value={String(idx + 1)}
                    >
                      {s}
                    </Chip>
                  ))}
                </Chip.Group>
              </Center2_Div>
            </UploadSubContainer>
            <UploadSubContainer>
              <SubTitle>
                <div>옵션항목</div>
              </SubTitle>
              <Center2_Div>
                <Chip.Group
                  style={{ padding: '10px 20px 10px 20px' }}
                  multiple
                  value={option}
                  onChange={setOption}
                  color={'dark'}
                >
                  {OPTION_MAP.map((o, idx) => (
                    <Chip
                      key={idx}
                      color={'dark'}
                      styles={() => chipStyles}
                      value={String(idx + 1)}
                    >
                      {o.value}
                    </Chip>
                  ))}
                </Chip.Group>
              </Center2_Div>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>상세 정보</Title>
            <UploadSubContainer className="border-b">
              <SubTitle>제목</SubTitle>
              <Upload_Input3
                placeholder="예) 신논현역 도보 5분거리, 혼자 살기 좋은 방 입니다."
                ref={titleRef}
              />
            </UploadSubContainer>
            <UploadSubContainer>
              <SubTitle>상세 설명</SubTitle>
              <Upload_Textarea2
                wrap="hard"
                placeholder={DESCRIPTION_PLACEHOLDER}
                ref={descriptionRef}
              />
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>연락처 정보</Title>
            <UploadSubContainer>
              <SubTitle>연락 가능한 번호</SubTitle>
              <Center2_Div style={{ padding: '0 20px 0 20px' }}>
                <CustomCheckBox
                  label="기존 번호 사용"
                  checked={cChecked}
                  onChange={(e) =>
                    cChecked === false && userContact === ''
                      ? alert('등록된 번호가 없습니다.')
                      : cChecked === false && userContact !== '' && userContact
                      ? (setContact(userContact), setCChecked(e.target.checked))
                      : setCChecked(e.target.checked)
                  }
                />
                <Upload_Input
                  type="number"
                  disabled={cChecked}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onInput={(e) => getOnlyNumber(e)}
                  style={{
                    width: '140px',
                    marginLeft: '20px',
                  }}
                  placeholder=" '-' 를 생략하고 입력"
                />
              </Center2_Div>
            </UploadSubContainer>
          </UploadContainer>
          <UploadContainer>
            <Title>사진 등록</Title>
            <div className="m-4">
              <UploadCaveats picture={true} />
            </div>
            <div>
              <div style={{ padding: '20px' }}>
                <FileButton accept="image/*" multiple onChange={setFiles}>
                  {(props) => (
                    <SubBtn className="dark" {...props}>
                      사진 추가하기
                    </SubBtn>
                  )}
                </FileButton>
                <Center_Div className="mt-5 flex-wrap bg-zinc-100 pt-5 pb-5">
                  {images &&
                    images.length > 0 &&
                    images.map((image, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          width: '220px',
                          height: '165px',
                          margin: '10px',
                        }}
                      >
                        <Image alt={'img'} key={idx} src={image} fill />
                        <Img_Hover_Div onClick={() => handleImgDel(image)}>
                          <IconX size={15} color={'white'} />
                        </Img_Hover_Div>
                      </div>
                    ))}
                </Center_Div>
              </div>
            </div>
            <Center2_Div className="m-3">
              <IconExclamationCircle size={18} className="mr-1" />
              <div style={{ fontSize: '13px' }}>
                허위 매물을 등록할 경우 MySpot에서 임의로 계정 및 매물 전체 삭제
                처리됩니다.
              </div>
            </Center2_Div>
          </UploadContainer>
          <Center_Div className="space-x-5" style={{ margin: '30px 0 30px 0' }}>
            <SubBtn className="outLine">취소</SubBtn>
            <SubBtn
              className="dark"
              onClick={() => {
                validate('submit')
              }}
            >
              등록하기
            </SubBtn>
          </Center_Div>
        </>
      ) : (
        <>
          <Center_Div style={{ width: '100%' }}>
            <MainBtn onClick={() => setIsUploadPage(true)}>방 내놓기</MainBtn>
            <MainBtn className="dark" onClick={() => setIsUploadPage(false)}>
              내 방 관리
            </MainBtn>
          </Center_Div>
          <div className="mt-4 w-full">
            <UploadCaveats manage={true} />
          </div>
          {roomsLoading ? (
            <Center_Div className="m-72">
              <Loader color="dark" />
            </Center_Div>
          ) : rooms ? (
            <>
              {rooms.map((room, idx) => (
                <ManageContainer key={idx}>
                  <Center_Div>
                    <Center_Div className="idController">
                      <ManageId className="flex-col w-full">
                        <Manage_Div_idx>
                          {idx + 1 + (activePage - 1) * MANAGED_ROOMS_TAKE}
                        </Manage_Div_idx>
                        <Manage_Div_Id>매물번호 {room.id}</Manage_Div_Id>
                        {room.status_id === 3 ? (
                          <div style={{ color: 'red' }}>
                            {STATUS_MAP[room.status_id - 1]}
                          </div>
                        ) : (
                          <div>{STATUS_MAP[room.status_id - 1]}</div>
                        )}
                        {room.status_id === 1 && (
                          <div>
                            D-
                            {differenceInDays(
                              add(new Date(room.updatedAt), { days: 30 }),
                              new Date()
                            )}{' '}
                            일
                          </div>
                        )}
                      </ManageId>
                      <Center_Div className="flex flex-col m-2">
                        <Manage_Div_160>
                          등록일 :{' '}
                          {format(new Date(room.updatedAt), 'yyyy-MM-dd')}
                        </Manage_Div_160>
                        <Manage_Div_160 className="flex mt-2">
                          <Manage_Div_75>조회수: {room.views}</Manage_Div_75>
                          <Manage_Div_75 className="ml-4">
                            찜: {room.wished}
                          </Manage_Div_75>
                        </Manage_Div_160>
                        <ManageBtnContainer>
                            <Link href={`rooms/${room.id}/edit`}>
                              <Manage_Btn>수정</Manage_Btn>
                            </Link>
                          <Manage_Btn
                            onClick={() =>
                              confirm('해당 매물을 정말 삭제하시겠습니까?') &&
                              deleteRoom(room.id)
                            }
                          >
                            삭제
                          </Manage_Btn>
                          {room.status_id === 4 ? (
                            <Manage_Btn_Dark
                              onClick={() =>
                                updateStatus1(room.id, room.updatedAt)
                              }
                            >
                              숨김
                            </Manage_Btn_Dark>
                          ) : (
                            <Manage_Btn
                              onClick={() =>
                                updateStatus({ id: room.id, status_id: 4 })
                              }
                            >
                              숨김
                            </Manage_Btn>
                          )}
                          {new Date(room.updatedAt) <
                          sub(new Date(), { days: 30 }) ? (
                            <Manage_Btn_Main
                              onClick={() => updateRenew(room.id)}
                            >
                              갱신하기
                            </Manage_Btn_Main>
                          ) : room.status_id === 2 ? (
                            <Manage_Btn_Dark
                              onClick={() =>
                                updateStatus({ id: room.id, status_id: 1 })
                              }
                            >
                              거래완료
                            </Manage_Btn_Dark>
                          ) : (
                            <Manage_Btn
                              onClick={() =>
                                updateStatus({ id: room.id, status_id: 2 })
                              }
                            >
                              거래완료
                            </Manage_Btn>
                          )}
                        </ManageBtnContainer>
                      </Center_Div>
                    </Center_Div>
                  </Center_Div>
                  <Center_Div className="imgInfo">
                    <Center_Div>
                      <StyledImage style={{ width: '300px', height: '225px' }}>
                        <Link href={`rooms/${room.id}`}>
                          <Image
                            alt="thumbnail"
                            className="styled"
                            src={room.images.split(',')[0]}
                            fill
                          />
                        </Link>
                      </StyledImage>
                    </Center_Div>
                    <Center_Div>
                      <ManageInfo>
                        <Manage_Div_Bold className='mt-4'>
                          {CATEGORY_MAP[room.category_id - 1]}{' '}
                          {YEAR_MONTH_MAP[room.sType_id - 1]} {room.deposit}
                          {room.fee !== 0 && `/${room.fee}`}
                        </Manage_Div_Bold>
                        <div>{room.doro}</div>
                        <div className='del'>{room.detail}</div>
                        <div className='del' style={{ marginTop: '20px' }}>{room.title}</div>
                      </ManageInfo>
                    </Center_Div>
                  </Center_Div>
                </ManageContainer>
              ))}
              {total && (
                <Center_Div style={{ margin: '30px 0 30px 0' }}>
                  <CustomPagination
                    page={activePage}
                    onChange={setActivePage}
                    total={total}
                  />
                </Center_Div>
              )}
            </>
          ) : (
            <Center_Div className="m-40">등록된 매물이 없습니다</Center_Div>
          )}
        </>
      )}
    </Container>
  ) : (
    <Center_Div style={{ margin: '30vh 0' }}>
      로그인 해주시기 바랍니다.
    </Center_Div>
  )
}

const Container = styled(Center_Div)`
  flex-flow: column;
  width: 100%;
  padding: 1rem;
`
const MainBtn = styled.button`
  width: 50%;
  height: 60px;
  font-size: 14px;
  background-color: ${subColor_light};
  &.dark {
    color: ${subColor_lighter};
    background-color: black;
  }
`
export const SubBtn = styled.button`
  width: 100px;
  height: 40px;
  font-size: 12px;
  &.dark {
    background-color: black;
    color: white;
  }
  &.outLine {
    border: 0.5px solid ${subColor_medium};
  }
`

const Manage_Btn = styled.button`
  width: 70px;
  height: 40px;
  padding: 10px 0 10px 0;
  margin: 0px 10px 10px 0;
  background-color: ${subColor_light};
  color: ${subColor_Dark};
  font-size: 12px;
`
const Manage_Btn_Dark = styled(Manage_Btn)`
  background-color: ${subColor_Dark};
  color: ${subColor_lighter};
`
const Manage_Btn_Main = styled(Manage_Btn)`
  background-color: black;
  color: ${subColor_light};
`

//input
const Upload_Input = styled.input`
  :hover {
    border: 0.5px solid black;
  }
  :active {
    outline: none !important;
    border: 1px solid black;
  }
  :focus {
    outline: none !important;
    border: 1px solid black;
  }
  border: 0.5px solid ${subColor_medium};
  font-size: 13px;
  padding: 10px;
  margin: 10px;
`
const AddressInput = styled(Upload_Input)`
  height: 40px;

  margin: 20px 10px 20px 0;
  width: 10rem;
  @media (min-width: 576px) {
    width: 10rem;
  }
  @media (min-width: 768px) {
    width: 12rem;
  }
  @media (min-width: 992px) {
    width: 14rem;
  }
  @media (min-width: 1200px) {
    width: 16rem;
  }
`
const Upload_Input2 = styled(Upload_Input)`
  height: 40px;
  width: 70px;
  @media (min-width: 576px) {
    width: 110px;
  }
  @media (min-width: 768px) {
    width: 70px;
  }
  @media (min-width: 992px) {
    width: 110px;
  }
`

const Upload_Input3 = styled(Upload_Input)`
  height: 40px;
  margin: 5px;
`
const Upload_Input4 = styled(Upload_Input)`
  height: 40px;
  width: 50px;
`

//textarea
const Upload_Textarea = styled.textarea`
  border: 0.5px solid ${subColor_medium};
  font-size: 13px;
  :hover {
    border: 0.5px solid black;
  }
  :active {
    outline: none !important;
    border: 1px solid black;
  }
  :focus {
    outline: none !important;
    border: 1px solid black;
  }
  resize: none;
`
const Upload_Textarea1 = styled(Upload_Textarea)`
  height: 100px;
  padding: 10px;
  width: 15.5rem;
  @media (min-width: 576px) {
    width: 15.5rem;
  }
  @media (min-width: 768px) {
    width: 17.5rem;
  }
  @media (min-width: 992px) {
    width: 19.5rem;
  }
  @media (min-width: 1200px) {
    width: 21.5rem;
  }
`
const Upload_Textarea2 = styled(Upload_Textarea)`
  min-height: 500px;
  padding: 10px;
  margin: 5px;
`
//div
const UploadContainer = styled.div`
  position: relative;
  width: 100%;
  border: 0.5px solid ${subColor_medium};
  margin-top: 30px;

  @media (max-width: 767px) {
    .seg {
      display: none;
    }
  }
  @media (min-width: 768px) {
    .menubtn {
      display: none;
    }
  }
`
const AbsoluteText = styled.div`
  font-size: 11px;
  position: absolute;
  color: ${subColor_medium};
  right: 0.5rem;
  top: 3rem;
  @media (min-width: 576px) {
    right: 0.5rem;
    top: 1rem;
  }
`
const Title = styled(Center_Div)`
  font-size: 18px;
  font-weight: 600;
  padding: 15px;
  width: 100%;
  border-bottom: 0.5px solid ${subColor_medium};
`
const SubTitle = styled(Center_Div)`
  font-size: 14px;
  padding: 0.8rem 0;
  background-color: ${subColor_light};
  &#address {
    @media (max-width: 991px) {
      display: none;
    }
  }
`
const UploadSubContainer = styled.div`
  font-size: 14px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 576px) {
    grid-template-columns: 1fr 2fr;
  }
  @media (min-width: 768px) {
    grid-template-columns: 1fr 5fr;
  }
  &.address {
    @media (max-width: 991px) {
      grid-template-columns: 1fr;
    }
  }
  .sub-address {
    padding: 1rem;
    display: grid;
    @media (min-width: 768px) {
      grid-template-columns: 2fr 1fr;
    }
  }
  &.half {
    grid-template-columns: 1fr;
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  &.parking {
    grid-template-columns: 1fr;
    @media (min-width: 992px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  .moveIn {
    font-size: 14px;
  }
`
const HalfContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 576px) {
    grid-template-columns: 1fr 2fr;
  }
  &.parking {
    @media (min-width: 768px) {
      grid-template-columns: 1fr 5fr;
    }
    @media (min-width: 992px) {
      grid-template-columns: 1fr 2fr;
    }
  }
`
const ManageContainer = styled(UploadContainer)`
  padding: 1rem 0 1rem 0;
  font-size: 14px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;

  @media (max-width: 575px) {
    .del{
      display: none;
    }
  }

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1.5fr;
  }
  @media (min-width: 992px) {
    grid-template-columns: 1fr 2fr;
  }

  .idController {
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    @media (min-width: 576px) {
    }
    @media (min-width: 768px) {
      grid-template-columns: 1fr;

    }
    @media (min-width: 992px) {
      grid-template-columns: 1fr 1fr;
    }
    @media (min-width: 1200px) {
    }
  }
  .imgInfo {
    display: grid;
    grid-template-columns: 1fr;
    @media (min-width: 576px) {
    }
    @media (min-width: 768px) {
    }
    @media (min-width: 992px) {
      grid-template-columns: 1fr 1fr;
    }
    @media (min-width: 1200px) {
    }
  }
`
const Manage_Div_idx = styled.div`
  border-bottom: 0.5px solid ${subColor_medium};
  padding: 0px 10px 5px 10px;
  margin-bottom: 20px;
  font-size: 16px;
`
const FlexCol_Div = styled.div`
  flex-flow: column;
  display: flex;
`
const ManageInfo = styled(FlexCol_Div)`
  @media (min-width: 576px) {
  }
  @media (min-width: 768px) {
  }
  @media (min-width: 992px) {
    margin-left: 1.5rem;
  }
  @media (min-width: 1200px) {
    margin-left: 3rem;
  }
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
const Manage_Div_160 = styled.div`
  font-size: 13px;
`
const Manage_Div_75 = styled.div`
  font-size: 13px;
`
const Manage_Div_Bold = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`
const ManageBtnContainer = styled.div`
  padding-left: 1rem;
  display: grid;
  max-width: 180px;
  grid-template-columns: 1fr 1fr;
  margin-top: 1rem;
`
const Img_Hover_Div = styled(HoverDiv)`
  width: 18px;
  height: 18px;
  display: flex;
  background-color: black;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
`

export const Manage_Div_Id = styled.div`
  border: 1px solid ${subColor_Dark};
  font-size: 12px;
  padding: 0 3px 0 3px;
  border-radius: 2px;
  margin-bottom: 10px;
  color: ${subColor_Dark};
`
const ManageId = styled(Center_Div)`
  @media (min-width: 576px) {
  }
  @media (min-width: 768px) {
    margin-bottom: 1rem;
  }
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
  @media (min-width: 1200px) {
  }
`

const MenuBtn = styled(Center_Div)`
  background-color: black;
  color: white;
  padding: 10px 15px 10px 20px;
  font-size: 13px;
  margin: 0 1rem;
  :hover {
    cursor: pointer;
  }
  width: 6.5rem;
`