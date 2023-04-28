import { useEffect } from 'react'

export default function Map({
  width,
  height,
  address,
  level,
  fill,
}: {
  width?: string
  height?: string
  address?: string
  level?: number
  fill?: boolean
}) {
  const onLoadKakaoMap = () => {
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder() // 주소-좌표 반환 객체를 생성

      const addrMarker = (address: string) => {
        // 주소로 좌표를 검색
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            // 정상적으로 검색이 완료됐으면
            var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)
            // 지도를 생성
            const container = document.getElementById('map')
            const options = {
              center: coords,
              level: level ? level : 3,
            }
            const map =
              container && new window.kakao.maps.Map(container, options)
            // 결과값으로 받은 위치를 마커로 표시
            map &&
              new window.kakao.maps.Marker({
                map: map,
                position: coords,
              })
          } else {
            // 정상적으로 좌표가 검색이 안 될 경우 디폴트 좌표로 검색
            const container = document.getElementById('map')
            const options = {
              center: new window.kakao.maps.LatLng(35.824171, 127.14805),
              level: 6,
            }
            // 지도를 생성
            container && new window.kakao.maps.Map(container, options)
          }
        })
      }

      address && addrMarker(address)
    })
  }
  useEffect(() => {
    onLoadKakaoMap()
  }, [address])

  return (
    <>
      {fill ? (
        <div
          id="map"
          style={{
            width: '100%',
            height: '100%',
          }}
        ></div>
      ) : (
        <div
          id="map"
          style={{
            width: width,
            height: height,
          }}
        ></div>
      )}
    </>
  )
}
