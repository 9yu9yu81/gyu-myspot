import styled from '@emotion/styled'
import { Modal } from '@mantine/core'
import { IconChevronLeft, IconChevronRight, IconHeart } from '@tabler/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  StyledImage,
  subColor_Dark,
  subColor_light,
  subColor_medium,
} from 'components/styledComponent'
import {
  CATEGORY_MAP,
  HEAT_MAP,
  MAINTENENCE_MAP,
  OPTION_MAP,
  STATUS_MAP,
  STRUCTURE_MAP,
  TYPE_MAP,
  YEAR_MONTH_MAP,
} from 'constants/const'
import { compareAsc, format } from 'date-fns'
import { GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Carousel from 'nuka-carousel'
import { useEffect, useState } from 'react'
import MapN from 'components/MapN'

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
interface RoomViews {
  id: number
  views: number
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

export default function RoomIndex(room: RoomAllData) {
  const carouselConfig = {
    nextButtonText: <IconChevronRight color="black" size={40} stroke={2} />,
    nextButtonStyle: { background: 'rgba(0,0,0,0)' },
    prevButtonText: <IconChevronLeft color="black" size={40} stroke={2} />,
    prevButtonStyle: { background: 'rgba(0,0,0,0)' },
  }
  const ISWISHED_QUERY_KEY = `/api/wishlist/get-IsWished?room_id=${room.id}`
  const ROOM_WISHED_QUERY_KEY = `/api/room/get-Room-Wished?id=${room.id}`

  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [modal, setModal] = useState<boolean>(false)
  const [cModal, setCModal] = useState<boolean>(false)
  const [imgIndex, setImgIndex] = useState<number>(0)
  const mList: number[] = [] //관리비 항목
  const noMList: number[] = [] //관리비 제외 항목
  for (let i = 0; i < MAINTENENCE_MAP.length; i++) {
    //관리비 항목 나누기
    room.maintenance_ids?.split(',').includes(String(i + 1))
      ? mList.push(i)
      : noMList.push(i)
  }
  const showMList = (list: number[]) => {
    //관리 항목 보여주기
    return list.map((m, idx) => (
      <span key={m} style={{ color: `${subColor_Dark}` }}>
        {MAINTENENCE_MAP[Number(m)]}
        {idx < list.length - 1 && ', '}
      </span>
    ))
  }
  const optionList: string[] | undefined = room.option_ids?.split(',')
  const showOptionList = () => {
    return optionList?.map((item, idx) => (
      <Info_Div_Option key={idx}>
        <Image
          src={OPTION_MAP[Number(item) - 1].icon}
          alt={OPTION_MAP[Number(item) - 1].value}
          width={50}
          height={50}
        />
        {OPTION_MAP[Number(item) - 1].value}
      </Info_Div_Option>
    ))
  }
  const openModal = (idx: number) => {
    setModal(true)
    setImgIndex(idx)
  }

  const { mutate: increaseViews } = useMutation<
    unknown,
    unknown,
    RoomViews,
    any
  >((items) =>
    fetch(`/api/room/update-Room-Views`, {
      method: 'POST',
      body: JSON.stringify(items),
    })
      .then((data) => data.json())
      .then((res) => res.items)
  )
  useEffect(() => {
    increaseViews({ id: room.id, views: room.views + 1 })
  }, [])

  const { data: isWished } = useQuery<{ isWished: boolean }, unknown, boolean>(
    [ISWISHED_QUERY_KEY],
    () =>
      fetch(ISWISHED_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  )
  const { data: wished } = useQuery<{ wished: number }, unknown, number>(
    [ROOM_WISHED_QUERY_KEY],
    () =>
      fetch(ROOM_WISHED_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  )

  const { mutate: updateIsWished } = useMutation<unknown, unknown, number, any>(
    (room_id) =>
      fetch(`/api/wishlist/update-IsWished`, {
        method: 'POST',
        body: JSON.stringify(room_id),
      })
        .then((data) => data.json())
        .then((res) => res.items),
    {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: [ISWISHED_QUERY_KEY] })
        const previous = queryClient.getQueryData([ISWISHED_QUERY_KEY])
        queryClient.setQueryData<boolean>([ISWISHED_QUERY_KEY], (old) => !old)

        queryClient.setQueryData<number>([ROOM_WISHED_QUERY_KEY], (old) =>
          old ? (isWished ? old - 1 : old + 1) : 1
        )

        return previous
      },
      onError: (__, _, context) => {
        queryClient.setQueryData([ISWISHED_QUERY_KEY], context.previous)
      },
      onSuccess: async () => {
        queryClient.invalidateQueries([ISWISHED_QUERY_KEY])
        queryClient.invalidateQueries([ROOM_WISHED_QUERY_KEY])
      },
    }
  )

  return (
    <>
      <Modal
        opened={modal}
        onClose={() => setModal(false)}
        withCloseButton={false}
        centered
        styles={{
          overlay: {
            margin: 0,
            padding: 0,
          },
          inner: {
            margin: 0,
            padding: 0,
          },
        }}
        size={'100%'}
      >
        <Carousel
          slideIndex={imgIndex}
          wrapAround
          defaultControlsConfig={carouselConfig}
        >
          {room.images.split(',').map((img, idx) => (
            <StyledImageContianer>
              <Image src={img} alt="carousel" key={idx} fill />
            </StyledImageContianer>
          ))}
        </Carousel>
      </Modal>
      <Container>
        <Img_Wrapper className="desktop">
          <Carousel
            wrapAround
            autoplay
            autoplayInterval={5000}
            cellAlign="center"
            defaultControlsConfig={carouselConfig}
            slidesToShow={2}
          >
            {room.images.split(',').map((_, idx) => (
              <StyledImage1 key={idx} onClick={() => openModal(idx)}>
                <Image
                  className="styled"
                  alt="img1"
                  src={room.images.split(',')[idx]}
                  fill
                />
              </StyledImage1>
            ))}
          </Carousel>
          <Img_Btn onClick={() => openModal(0)}>사진 크게 보기</Img_Btn>
        </Img_Wrapper>
        <Img_Wrapper className="mobile">
          <Carousel
            wrapAround
            autoplay
            autoplayInterval={5000}
            defaultControlsConfig={carouselConfig}
            slidesToShow={1}
          >
            {room.images.split(',').map((_, idx) => (
              <StyledImage1 key={idx} onClick={() => openModal(idx)}>
                <Image
                  className="styled"
                  alt="img1"
                  src={room.images.split(',')[idx]}
                  fill
                />
              </StyledImage1>
            ))}
          </Carousel>
          <Img_Btn onClick={() => openModal(0)}>사진 크게 보기</Img_Btn>
        </Img_Wrapper>
        <InfoContainer className="relative">
          <div className="inner">
            <Info_Div1_Col>
              <Info_Div_Title>가격정보</Info_Div_Title>
              <Info_Div1_B>
                <Info_Div_SubTitle>
                  {room.sType_id === 1 ? <div>전세</div> : <div>월세</div>}
                </Info_Div_SubTitle>
                {room.sType_id === 1 ? (
                  <Info_Div2>{room.deposit}</Info_Div2>
                ) : (
                  <Info_Div2>
                    {room.deposit}/{room.fee}
                  </Info_Div2>
                )}
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>관리비</Info_Div_SubTitle>
                {room.maintenance_fee === 0 ? (
                  <Info_Div2>관리비 없음</Info_Div2>
                ) : (
                  <div className="w-full">
                    <Info_Div2_B>
                      <div>매월 {room.maintenance_fee} 만원</div>
                      <div>{showMList(mList)}</div>
                    </Info_Div2_B>
                    <Info_Div2>
                      별도 금액으로 부과되는 항목
                      <div>{showMList(noMList)}</div>
                    </Info_Div2>
                  </div>
                )}
              </Info_Div1_B>
              {room.parking ? (
                <Info_Div1_B>
                  <Info_Div_SubTitle>주차비</Info_Div_SubTitle>
                  <Info_Div2>{room.parking_fee} 만원</Info_Div2>
                </Info_Div1_B>
              ) : (
                <></>
              )}
              <Info_Div1_B>
                <Info_Div_SubTitle>
                  한달 <br />
                  예상 주거비용
                </Info_Div_SubTitle>
                <Info_Div2>
                  <div>
                    {room.parking_fee + room.maintenance_fee + room.fee} 만원 +
                    α
                  </div>
                  <div style={{ color: `${subColor_Dark}` }}>
                    ( 월세 + 관리비 + 주차비 )
                  </div>
                  <div
                    style={{ color: `${subColor_medium}`, fontSize: '15px' }}
                  >
                    별도 금액으로 부과되는 항목 제외
                  </div>
                </Info_Div2>
              </Info_Div1_B>
            </Info_Div1_Col>
            <Info_Div1_Col>
              <Info_Div_Title>상세정보</Info_Div_Title>
              <Info_Div1_B>
                <Info_Div_SubTitle>방종류</Info_Div_SubTitle>
                <Info_Div2>{CATEGORY_MAP[room.category_id - 1]}</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>해당층/건물층</Info_Div_SubTitle>
                <Info_Div2>
                  {room.floor}층 / {room.total_floor}층
                </Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>공급면적</Info_Div_SubTitle>
                <Info_Div2>{room.supply_area} 평</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>전용면적</Info_Div_SubTitle>
                <Info_Div2>{room.area} 평</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>난방종류</Info_Div_SubTitle>
                <Info_Div2>{HEAT_MAP[room.heat_id - 1]}</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>주차</Info_Div_SubTitle>
                <Info_Div2>{room.parking ? '가능' : '불가능'}</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>엘리베이터</Info_Div_SubTitle>
                <Info_Div2>{room.elevator ? '있음' : '없음'}</Info_Div2>
              </Info_Div1_B>
              {room.structure_ids !== null && (
                <Info_Div1_B>
                  <Info_Div_SubTitle>방 구조</Info_Div_SubTitle>
                  <Info_Div2>
                    {room.structure_ids?.split(',').map((item, idx) => (
                      <div key={idx}>{STRUCTURE_MAP[Number(item) - 1]}</div>
                    ))}
                  </Info_Div2>
                </Info_Div1_B>
              )}
              <Info_Div1_B>
                <Info_Div_SubTitle>입주가능일</Info_Div_SubTitle>
                <Info_Div2>
                  {compareAsc(new Date(room.move_in), new Date()) === -1
                    ? '즉시 입주 가능'
                    : format(new Date(room.move_in), 'yyyy년 MM월 dd일')}
                </Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>건물유형</Info_Div_SubTitle>
                <Info_Div2>{TYPE_MAP[room.type_id - 1]}</Info_Div2>
              </Info_Div1_B>
              <Info_Div1_B>
                <Info_Div_SubTitle>최초등록일</Info_Div_SubTitle>
                <Info_Div2>
                  {format(new Date(room.updatedAt), 'yyyy년 MM월 dd일')}
                </Info_Div2>
              </Info_Div1_B>
            </Info_Div1_Col>
            {room.option_ids && optionList && (
              <Info_Div1_Col>
                <Info_Div_Title>옵션</Info_Div_Title>
                <Info_Div1 style={{ flexWrap: 'wrap' }}>
                  {showOptionList()}
                </Info_Div1>
              </Info_Div1_Col>
            )}
            <Info_Div1_Col>
              <Info_Div_Title>위치 및 주변시설</Info_Div_Title>
              <div style={{ marginBottom: '30px' }}>
                {room.doro} {room.detail}
              </div>
              <MapWrapper>
                <MapN fill address={room.doro} />
              </MapWrapper>
            </Info_Div1_Col>
            <Info_Div1_Col>
              <Info_Div_Title>상세 설명</Info_Div_Title>
              <Info_Div_Bg>
                <div style={{ fontWeight: '700', marginBottom: '15px' }}>
                  {room.title}
                </div>
                <div>{room.description}</div>
              </Info_Div_Bg>
            </Info_Div1_Col>
          </div>
          <div className="inner2">
            <CardContainer>
              <div style={{ display: 'flex' }}>
                <Manage_Div_Id>매물번호 {room.id}</Manage_Div_Id>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexFlow: 'column',
                  margin: '20px 0 30px 0',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {YEAR_MONTH_MAP[room.sType_id - 1]}
                  {room.sType_id === 1
                    ? room.deposit
                    : room.deposit + '/' + room.fee}
                </div>
                <div
                  style={{
                    color: `${subColor_Dark}`,
                  }}
                >
                  매물 조회수 {room.views + 1} 회
                </div>
                <CardImgContainer>
                  <CardImg>
                    <Card_img src="/icons/elevator.png" />
                    {room.floor} 층
                  </CardImg>
                  <CardImg>
                    <Card_img src="/icons/house-design.png" />
                    {room.area} 평
                  </CardImg>
                  <CardImg>
                    <Card_img src="/icons/bill.png" />
                    {room.maintenance_fee} 만 원
                  </CardImg>
                </CardImgContainer>
                <div style={{ display: 'flex' }}>
                  <div style={{ fontWeight: '700', minWidth: '60px' }}>
                    방 유형
                  </div>
                  <div>{CATEGORY_MAP[room.category_id - 1]}</div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ fontWeight: '700', minWidth: '60px' }}>
                    위치
                  </div>
                  <div>{room.doro}</div>
                </div>
              </div>
              {room.status_id === 1 ? (
                <>
                  <Center2_Div>
                    <Dark_Btn
                      onClick={() =>
                        session && status === 'authenticated'
                          ? setCModal((prev) => !prev)
                          : router.push('/login')
                      }
                    >
                      연락처 보기
                    </Dark_Btn>
                    <Upload_Btn_Outline
                      onClick={() =>
                        session && status === 'authenticated'
                          ? updateIsWished(room.id)
                          : router.push('/login')
                      }
                    >
                      <Center_Div style={{ fontSize: '16px' }}>
                        {isWished ? (
                          <IconHeart
                            size={20}
                            color="red"
                            fill="red"
                            style={{ marginRight: '10px' }}
                          />
                        ) : (
                          <IconHeart
                            size={20}
                            stroke={1.5}
                            style={{ marginRight: '10px' }}
                          />
                        )}
                        {wished}
                      </Center_Div>
                    </Upload_Btn_Outline>
                  </Center2_Div>
                  {cModal && (
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                      <div style={{ fontWeight: '700', minWidth: '60px' }}>
                        연락처
                      </div>
                      <div>{room.contact}</div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    width: '240px',
                    height: '80px',
                    display: 'flex',
                    backgroundColor: 'black',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {STATUS_MAP[room.status_id - 1]}
                </div>
              )}
            </CardContainer>
          </div>
        </InfoContainer>
      </Container>
    </>
  )
}
const Card_img = ({ src }: { src: string }) => {
  return (
    <Image
      style={{ marginRight: '15px' }}
      alt={src}
      width={27}
      height={27}
      src={src}
    />
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
const Container = styled(Center_Div)`
  flex-flow: column;
  width: 100%;
  padding: 1.5rem;
  font-size: 16px;
`
const CardImg = styled(Center2_Div)`
  width: 120px;
  font-size: 16px;
`
const Img_Wrapper = styled.div`
  width: 100%;
  position: relative;

  &.desktop {
    @media (max-width: 767px) {
      display: none;
    }
  }
  &.mobile {
    @media (min-width: 768px) {
      display: none;
    }
  }
`
const StyledImage1 = styled(StyledImage)`
  width: 100%;
  height: 260px;
  @media (min-width: 576px) {
    height: 340px;
  }
  @media (min-width: 768px) {
    width: 340px;
    height: 255px;
  }
  @media (min-width: 992px) {
    width: 440px;
    height: 330px;
  }
  @media (min-width: 1200px) {
    width: 540px;
    height: 360px;
  }
`
const Img_Btn = styled.button`
  border-radius: 3px;
  width: 100px;
  height: 35px;
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: white;
  font-size: 13px;
`
const Info_Div1 = styled.div`
  width: 100%;
  display: flex;
`
const Info_Div1_Col = styled(Info_Div1)`
  flex-flow: column;
  margin: 2.5rem 0;
  padding: 0 1rem 0 1rem;
`
const Info_Div1_B = styled(Info_Div1)`
  border-bottom: 1px solid ${subColor_light};
  padding: 1rem 0;
`
const Info_Div_Bg = styled(Info_Div1)`
  padding: 1rem 0;
  background-color: white;
  white-space: pre;
  line-height: 180%;
  flex-flow: column;
`

const Info_Div2 = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column;
  * {
    line-height: 180%;
  }
`
const Info_Div2_B = styled(Info_Div2)`
  border-bottom: 1px solid ${subColor_light};
  padding: 0 0 15px 0;
  margin: 0 0 15px 0;
`
const Info_Div_Title = styled(Center2_Div)`
  font-weight: 700;
  font-size: 25px;
  margin: 0 0 20px 0;
`
const Info_Div_SubTitle = styled(Info_Div_Title)`
  width: 150px;
  margin-bottom: auto;
  font-size: 17px;
`
const Info_Div_Option = styled(Center_Div)`
  width: 60px;
  flex-flow: column;
  margin: 10px 20px 20px 0;
  font-size: 13px;
`

const CardContainer = styled.div`
  width: 300px;
  height: 430px;
  padding: 30px;
  border: 0.5px solid ${subColor_light};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-flow: column;
  font-size: 14px;
  margin: 2rem 0 0 0;
  @media (min-width: 576px) {
    font-size: 15px;
    width: 340px;
    height: 460px;
  }
  @media (min-width: 768px) {
    position: sticky;
    margin: 50px 0 0 30px;
    top: 80px;
    right: 0;
    font-size: 13px;
    width: 260px;
    height: 420px;
  }
  @media (min-width: 992px) {
    font-size: 14px;
    width: 300px;
    height: 430px;
  }
  @media (min-width: 1200px) {
  }
`
export const Manage_Div_Id = styled(Center_Div)`
  border: 1px solid ${subColor_Dark};
  height: 20px;
  font-size: 12px;
  padding: 3px 6px 3px 6px;
  border-radius: 2px;
  color: ${subColor_Dark};
`

const CardImgContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 120px);
  grid-template-rows: repeat(2, 40px);
  margin: 15px 0 15px 0;
`
const Dark_Btn = styled.button`
  color: white;
  background-color: black;
  margin-right: 1rem;
  width: 140px;
  height: 40px;
  @media (min-width: 576px) {
    width: 180px;
  }
  @media (min-width: 768px) {
    width: 100px;
    font-size: 13px;
  }
  @media (min-width: 992px) {
    width: 130px;
    font-size: 13px;
  }
`
const Upload_Btn_Medium = styled.button`
  width: 100px;
  height: 40px;
  font-size: 12px;
`
const Upload_Btn_Outline = styled(Upload_Btn_Medium)`
  border: 0.5px solid ${subColor_medium};
`
const InfoContainer = styled.div`
  display: flex;
  flex-flow: column-reverse;
  position: relative;
  .inner {
    display: flex;
    flex-flow: column;
    @media (min-width: 576px) {
    }
  }
  .inner2 {
    display: flex;
    @media (max-width: 767px) {
      justify-content: center;
    }
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2.5fr 1fr;
  }
`
const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  positon: relative;
  height: 300px;
  @media (min-width: 992px) {
    height: 350px;
  }
  @media (min-width: 1200px) {
    height: 400px;
  }
`
const StyledImageContianer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  @media (min-width: 576px) {
    height: 432px;
  }
  @media (min-width: 768px) {
    height: 576px;
  }
  @media (min-width: 992px) {
    height: 744px;
  }
  @media (min-width: 1200px) {
    height: 900px;
  }
`