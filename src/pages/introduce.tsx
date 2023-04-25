import styled from '@emotion/styled'
import { subColor_Dark } from 'components/styledComponent'
import Image from 'next/image'

export default function Introduce() {
  return (
    <Container>
      <Intro>
        <div style={{ margin: '1rem;' }}>
          {`안녕하세요. MySpot 개발자 9yu9yu81 입니다.
개발 공부를 시작하고, 제대로 만들어보는 페이지가 처음이라 부족한 점이 많고, 누군가에게 보여주고 소개하는 것이 많이 어색하기도 합니다.

이 페이지의 시작은, 대학생활을 하면서 방을 구하는 주변 친구들을 보며, 문득 생각이 들었던 아이디어를, 한 번 구현 해보고 싶다는 마음으로 시작이 되었습니다.
`}
        </div>
        <ImgWrapper>
          <Image src="/images/lightRoom.jpg" fill alt="lightRoom" />
        </ImgWrapper>
      </Intro>
      <div className="main">
        {`  보통 우리는 오랜 공부 하는 시간을 거쳐서 스무 살이 되어, 설레는 마음으로 대학의 문을 두드리곤 합니다.
그곳이 원하는 곳이었든, 아쉽게도 원치 않던 곳이었든, 새로운 환경으로의 첫 발걸음이 시작되는 가운데, 
지금껏 겪어보지 못했던 타지 생활을 하게 되는 경우가 더러 있습니다.

  낯선 대학생활이 시작되기 전에, 우리는 처음 겪어보는 더 낯선 타지 생활이라는 환경 앞에서 
설레었던 마음과 함께 사실 걱정스러운 생각도 종종 들게 됩니다.
그 걱정 중 하나가 있다면, 본가에서 나와 혼자 생활하게 된다는 것인데,
그렇다면 현실적으로 과연 어디서 지내야 하는지가 주된 고민거리가 되는 경우가 많습니다.

  여러 이유들이 존재하고 또한 기숙사라는 다른 선택지가 존재하겠지만,
그 선택은 뒤로한 채, 재밌게도 우리는 자취라는 로망을 실현시킬 기회라 생각하며 개인의 소망을 앞 새우곤 하죠.
사실 제가 지금까지도 그 로망을 갖고 있는 사람 중 하나거든요...

  우리는 여기서 한 가지 문제에 직면합니다.
" 방은 어디서 어떻게 구하지? "
이 질문에 우리는 쉽게 '다방이나 직방 같은 사이트에서 찾아봐야지'라는 생각이 먼저 들게 됩니다.
먼저 사이트에 들어가서 원하는 위치에 원하는 방을 물색하며 방을 찾아보고서, 
보증금/월세 가격을 마주하고는 고민거리가 생길 수도 있습니다.

  다방, 직방에서 제공하는 플랫폼은 크게 보면 [집주인 - 공인중개사 - 세입자] 간의 연결을 해주는 서비스를 제공합니다.
집주인, 세입자 서로가 더 편한 대신 중개료가 붙는 시스템으로,
여기서 우리는 결국 현실적으로 다른 차선택을 하게 됩니다.

  저는 '발품을 팔다'라는 말을 들어본 적은 있긴 한데, 사실 정확히 무슨 말인지는 잘 몰랐던 때가 있었습니다.
하지만 주변에서 현실적인 선택을 하게 됨으로써,
직접 더 저렴하게 방을 찾기 위해 걸어 다니는 수고를 들이며 열심히 발품을 팔고 있는 친구들을 보았었고,
어쩌면 여러분들은 직접 발품을 팔고 있는 자기 자신을 보고 있을지도 모릅니다.
우리는 이렇게 발품을 팔면서 집주인과 직접 컨택을 하고, 조금 더 저렴한 가격으로 방을 찾을 수 있게 됩니다.

  여기서 정말 단순한 생각을 해보게 된 것이 이 아이디어를 구체화하게 된 시작이었습니다.
만약에 직접 발품을 팔지 않고, 원하는 위치의 매물을 소유한 집주인과 다이렉트로 연결되어 거래를 하게 된다면 어떨까
중개료가 붙지 않아서, 집주인은 더 저렴한 가격으로 매물을 내놓게 되고
그러므로, 세입자는 편하면서도 더 합리적인 가격으로 방을 구해볼 수 있지 않을까

  직접 발품을 뛰어다니는 사람은 내가 되고, 내가 얻은 매물 정보들로 새로 방을 구하는 사람들에게 바로 연결해 주는,
즉, [집주인 - 세입자]를 바로 연결시켜주는 원룸 직거래 서비스를 제공하는 플랫폼을 만들어 보아야겠다는 생각을 하게 되었습니다.

  대학생이든 아니든, 타지 생활이 처음이든 아니든, 그게 중요한 게 아니라,
새로운 곳에서 새로운 생활을 시작할 때, 설렘이 아닌 걱정과 염려가 먼저 앞서지 않게 하고,
수고스러움을 덜어줄 수 있게 하자는 단순한 생각으로 이러한 사업을 시작해 보게 되었고,
이렇게 직접 고민하며 페이지를 만들어보게 되었습니다.`}
      </div>
      <Outro>
        <ImgWrapper className="outro">
          <Image src="/images/introRoom.png" fill alt="IntroRoom" />
        </ImgWrapper>
        <div style={{ margin: '1rem' }}>
          {`
  부족한 점이 많습니다. 하지만 이 프로젝트를 진행하면서 많은 고민을 하고 시행착오를 겪으면서도,

그 안에서 재미를 느끼고 있고 앞으로 발전할 점들 또한 많습니다. 
열심히 배우고 항상 정진할 마음가짐으로 임하겠습니다.

부족한 글 끝까지 읽어주셔서 감사드리며, 또한 찾아오신 모든 분들께 진심으로 감사드립니다.
          `}
        </div>
      </Outro>
    </Container>
  )
}

const Container = styled.div`
  margin: 100px 0 100px 0;
  padding: 0 20px 0 20px;
  .main {
  }
  font-weight: 300;
  white-space: pre-wrap;
  line-height: 170%;
  .split {
    border-top: 0.5px solid ${subColor_Dark};
    margin: 120px 0 120px 0px;
  }

  @media (min-width: 576px) {
    line-height: 180%;
  }
  @media (min-width: 768px) {
    line-height: 200%;
  }
  @media (min-width: 992px) {
  }
  @media (min-width: 1200px) {
  }
`

const Intro = styled.div`
  display: grid;
  align-items: center;
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`
const Outro = styled(Intro)``

const ImgWrapper = styled.div`
  width: 100%;
  height: 14rem;
  position: relative;
  margin: 1rem 0 1rem 0;
  @media (min-width: 576px) {
    height: 18rem;
  }
  @media (min-width: 768px) {
    height: 24rem;
  }
  @media (min-width: 992px) {
    height: 18rem;
    margin: 0;
  }
  @media (min-width: 1200px) {
    height: 20rem;
  }
`