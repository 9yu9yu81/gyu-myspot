import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import styled from '@emotion/styled'
import { Chip, FileButton, Menu, Modal } from '@mantine/core'
import {
  IconArrowDown,
  IconExclamationCircle,
  IconMapPin,
  IconX,
} from '@tabler/icons'
import {
  Center2_Div,
  CenterCol,
  Center_Div,
  subColor_medium,
} from 'components/styledComponent'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  CATEGORY_MAP,
  YEAR_MONTH_MAP,
  TYPE_MAP,
  HEAT_MAP,
  MAINTENENCE_MAP,
  STRUCTURE_MAP,
  OPTION_MAP,
  getOnlyNumber,
} from 'constants/const'
import format from 'date-fns/format'
import dynamic from 'next/dynamic'
const Map = dynamic(import('components/MapN'))
const UploadCaveats = dynamic(import('components/upload/UploadCaveats'))
const CustomSegmentedControl = dynamic(
  import('components/CustomSegmentedControl')
)
const CustomCheckBox = dynamic(import('components/CustomCheckBox'))
import { Calendar } from '@mantine/dates'
import {
  AbsoluteText,
  AddressInput,
  DESCRIPTION_PLACEHOLDER,
  HalfContainer,
  Img_Hover_Div,
  MenuBtn,
  SubBtn,
  SubTitle,
  Title,
  UploadContainer,
  UploadSubContainer,
  Upload_Input,
  Upload_Input2,
  Upload_Input3,
  Upload_Input4,
  Upload_Textarea1,
  Upload_Textarea2,
} from 'pages/upload'
import { menuStyle } from 'pages/mainMap'

const DETAILADDR_PLACEHOLDER = `상세 주소
예) e편한세상 101동 1101호`

interface RoomUploadData {
  room: {
    id: number
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
interface RoomAllData {
  id: number
  category_id: number
  user_id: string
  status_id: number
  type_id: number
  updatedAt: Date
  title: string
  description: string

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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const room: RoomAllData = await fetch(
    `${process.env.HOST}/api/room/get-Room?id=${context.params?.id}`
  )
    .then((res) => res.json())
    .then((data) => data.items)
  return {
    props: {
      ...room,
    },
  }
}

export default function RoomEdit(room: RoomAllData) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const USER_CONTACT_QUERY_KEY = '/../api/user/get-Contact'
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

  const [category, setCategory] = useState<string>(String(room.category_id)) //매물종류
  const [roomType, setRoomType] = useState<string>(String(room.type_id)) //건물유형
  const [ym, setYm] = useState<string>(String(room.sType_id)) //전월세종류
  const [heat, setHeat] = useState<string>(String(room.heat_id)) //난방종류
  const [deposit, setDeposit] = useState<string>(String(room.deposit)) //보증금
  const [fee, setFee] = useState<string>(String(room.fee)) //월세
  const [area, setArea] = useState<string>(String(room.area)) //전용면적
  const [supArea, setSupArea] = useState<string>(String(room.supply_area)) //공급면적
  const [floor, setFloor] = useState<string>(String(room.floor)) //층
  const [tFloor, setTFloor] = useState<string>(String(room.total_floor)) //건물 층수
  const [title, setTitle] = useState<string>(room.title) //제목
  const [description, setDescription] = useState<string>(room.description) //상세설명
  const [images, setImages] = useState<string[]>(room.images.split(',')) //사진
  const [moveIn, setMoveIn] = useState<Date | null>(room.move_in) //입주가능일
  const [modal, setModal] = useState<boolean>(false) //캘린더 모달
  const [mChecked, setMChecked] = useState<boolean>(false) //관리비 없음 체크
  const [mFee, setMFee] = useState<string>(String(room.maintenance_fee)) //관리비
  const [mOption, setMOption] = useState<string[] | undefined>(
    room.maintenance_ids?.split(',')
  ) //관리비 항목
  const [elevator, setElevator] = useState<string>(String(room.elevator)) //엘베 유무
  const [parking, setParking] = useState<string>(String(room.parking)) //주차가능한지
  const [pFee, setPFee] = useState<string>(String(room.parking_fee)) //주차비
  const [option, setOption] = useState<string[] | undefined>(
    room.option_ids?.split(',')
  ) //옵션항목
  const [structure, setStructure] = useState<string[] | undefined>(
    room.structure_ids?.split(',')
  ) //방구조
  const [contact, setContact] = useState<string>(room.contact) //연락처
  const [cChecked, setCChecked] = useState<boolean>(false) //기존 연락처 사용할지
  //daum-postcode
  const [name, setName] = useState<string>(room.name) //건물명
  const [doro, setDoro] = useState<string>(room.doro)
  const [jibun, setJibun] = useState<string>(room.jibun)
  const [lat, setLat] = useState<number>(room.lat)
  const [lng, setLng] = useState<number>(room.lng)
  const [addr, setAddr] = useState<string>(room.doro)
  const [detailAddr, setDetailAddr] = useState<string>(room.detail)

  //daum-postcode 띄우는 함수
  const loadLayout = () => {
    window.daum.postcode.load(() => {
      const postcode = new window.daum.Postcode({
        oncomplete: function (data: any) {
          if (data.userSelectedType === 'R') {
            // 사용자가 도로명 주소를 선택했을 경우
            setAddr(data.roadAddress)
          } else {
            // 사용자가 지번 주소를 선택했을 경우(J)
            setAddr(data.jibunAddress)
          }
          setName(data.buildingName)
          setDoro(data.roadAddress)
          setJibun(data.jibunAddress)
        },
      })
      postcode.open({
        q: addr,
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
      addrConverter(addr)
    })
  }
  useEffect(() => {
    onLoadKakaoMap()
  }, [addr])

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

  const { mutate: updateRoom } = useMutation<
    unknown,
    unknown,
    RoomUploadData,
    any
  >(
    (room) =>
      fetch('/../api/room/update-Room', {
        method: 'POST',
        body: JSON.stringify(room),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onSuccess: async () => {
        router.replace(`/rooms/${room.id}`)
      },
    }
  )

  const validate = (type: 'submit') => {
    if (cChecked === false && contact !== '' && contact !== userContact) {
      if (confirm('해당 연락처를 기존 번호로 저장 하시겠습니까?')) {
        updateContact(contact)
      }
    }
    if (type === 'submit') {
      addr === ''
        ? alert('주소를 입력하세요.')
        : detailAddr === ''
        ? alert('상세 주소를 입력하세요.')
        : deposit === ''
        ? alert('보증금을 입력하세요.')
        : ym === '2' && fee === '0'
        ? alert('월세를 입력하세요.')
        : supArea === ''
        ? alert('공급 면적을 입력하세요.')
        : area === ''
        ? alert('전용 면적을 입력하세요.')
        : tFloor === ''
        ? alert('건물 층수를 입력하세요.')
        : floor === ''
        ? alert('층수를 입력하세요.')
        : !mChecked && mFee == '0'
        ? alert('관리비를 입력해주세요. 없다면 관리비 없음을 체크해 주세요.')
        : !mChecked && mFee != '0' && mOption == null
        ? alert('관리비 항목을 선택해주세요.')
        : title === ''
        ? alert('제목을 입력하세요')
        : description === ''
        ? alert('상세 설명을 입력하세요.')
        : contact === ''
        ? alert('연락받을 번호를 입력해 주세요.')
        : images.length < 3 || images.length > 10
        ? alert('최소 3장, 최대 10장 이미지를 첨부해주세요')
        : moveIn &&
          updateRoom({
            room: {
              id: room.id,
              category_id: Number(category),
              type_id: Number(roomType),
              title: title,
              description: description,
              images: images.join(','),
              contact: contact,
            },
            saleInfo: {
              type_id: Number(ym),
              deposit: Number(deposit),
              fee: ym === '1' ? 0 : Number(fee),
            },
            basicInfo: {
              supply_area: Number(supArea),
              area: Number(area),
              total_floor: Number(tFloor),
              floor: Number(floor),
              move_in: moveIn,
              heat_id: Number(heat),
            },
            addressInfo: {
              name: name,
              doro: doro,
              jibun: jibun,
              detail: detailAddr,
              lat: lat,
              lng: lng,
            },
            moreInfo: {
              maintenance_fee: mChecked ? 0 : Number(mFee),
              maintenance_ids:
                mOption && mOption.length !== 0 ? mOption.join(',') : undefined,
              elevator: Boolean(Number(elevator)),
              parking: Boolean(Number(parking)),
              parking_fee: parking === '0' ? 0 : Number(pFee),
              option_ids:
                option && option.length !== 0 ? option.join(',') : undefined,
              structure_ids:
                structure && structure.length !== 0
                  ? structure.join(',')
                  : undefined,
            },
          })
    }
  }

  const { data: userContact } = useQuery<
    { userContact: string },
    unknown,
    string
  >([USER_CONTACT_QUERY_KEY], () =>
    fetch(USER_CONTACT_QUERY_KEY)
      .then((res) => res.json())
      .then((data) => data.items)
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

  return session && status === 'authenticated' ? (
    <Container>
      <MainTitle>수정하기</MainTitle>
      <div className="m-1">
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
                    onKeyUp={handleEnterKeypress}
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
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
                  value={detailAddr}
                  onChange={(e) => setDetailAddr(e.target.value)}
                />
              </div>
            </CenterCol>
            <Center_Div>
              {addr !== '' ? (
                <Map width="300px" height="280px" address={addr} />
              ) : (
                <Center_Div
                  style={{
                    flexFlow: 'column',
                    width: '300px',
                    height: '280px',
                    border: `0.5px solid ${subColor_medium}`,
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
                    placeholder="전세"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    onInput={(e) => getOnlyNumber(e)}
                  />{' '}
                  만원
                </Center2_Div>
              ) : (
                <>
                  <Center2_Div>
                    <Upload_Input2
                      placeholder="보증금"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      onInput={(e) => getOnlyNumber(e)}
                    />{' '}
                    /
                    <Upload_Input2
                      placeholder="월세"
                      onChange={(e) => setFee(e.target.value)}
                      onInput={(e) => getOnlyNumber(e)}
                      value={fee}
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
              <Center2_Div className="w-full pl-4">
                공급 면적
                <Upload_Input2
                  type="number"
                  value={supArea}
                  onChange={(e) => setSupArea(e.target.value)}
                  onInput={(e) => getOnlyNumber(e)}
                />{' '}
                평
              </Center2_Div>
              <Center2_Div className=" w-full pl-4">
                전용 면적
                <Upload_Input2
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
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
              <Center2_Div className="w-full pl-4">
                건물 층수
                <Upload_Input2
                  type="number"
                  value={tFloor}
                  onChange={(e) => setTFloor(e.target.value)}
                  onInput={(e) => getOnlyNumber(e)}
                />{' '}
                층
              </Center2_Div>
              <Center2_Div className="w-full pl-4">
                해당 층수
                <Upload_Input2
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
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
              <Center2_Div className="moveIn" style={{ marginLeft: '10px' }}>
                {format(new Date(moveIn), 'yyyy년 MM월 dd일')}
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
            <Center2_Div className="space-x-5 w-full">
              <Upload_Input2
                type="number"
                disabled={mChecked}
                onChange={(e) => setMFee(e.target.value)}
                onBlur={(e) => e.target.value === '' && setMFee('0')}
                onInput={(e) => getOnlyNumber(e)}
                value={mChecked ? '0' : mFee}
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
          <Center2_Div className="flex-col">
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
            <Center2_Div>
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
          <Center2_Div>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </UploadSubContainer>
        <UploadSubContainer>
          <SubTitle>상세 설명</SubTitle>
          <Upload_Textarea2
            wrap="hard"
            placeholder={DESCRIPTION_PLACEHOLDER}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        <SubBtn className="outLine" onClick={() => router.back()}>
          취소
        </SubBtn>
        <SubBtn
          className="dark"
          onClick={() => {
            validate('submit')
          }}
        >
          수정하기
        </SubBtn>
      </Center_Div>
    </Container>
  ) : (
    <Center_Div style={{ margin: '30vh 0' }}>
      로그인 해주시기 바랍니다.
    </Center_Div>
  )
}

const MainTitle = styled.div`
  width: 100%;
  height: 100px;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  margin: 6rem 0 2rem 0;
  font-weight: 600;
}}
`
const Container = styled.div`
  flex-flow: column;
  width: 100%;
  padding: 1rem;
`