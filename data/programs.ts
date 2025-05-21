import { Program } from '@/types/program'

export const programs: Program[] = [
  {
    id: "healing-camp",
    category: "healing",
    title: "힐링 캠프",
    description: "자연 속에서 온전한 휴식과 힐링을 경험하는 원데이 프로그램",
    duration: "8시간",
    price: 190000,
    minParticipants: 4,
    image: "/images/mountain.jpg",
    tags: ["원데이힐링", "자연치유", "스트레스해소"],
    isRecommended: true,
    details: {
      schedule: [
        "12:00 - 오리엔테이션 및 티타임",
        "13:00 - 명상 & 요가",
        "14:30 - 자연 산책 테라피",
        "16:00 - 아로마 족욕",
        "17:00 - 싱잉볼 명상",
        "18:00 - 힐링 디너",
        "19:00 - 캠프파이어 명상",
        "20:00 - 마무리 및 귀가"
      ],
      includes: [
        "전문 힐링 강사 지도",
        "요가 매트 및 도구",
        "아로마 족욕 세트",
        "싱잉볼 테라피",
        "유기농 식사 1회",
        "허브티 무제한"
      ],
      notice: [
        "편안한 옷차림 필수",
        "수건과 개인용품 지참",
        "우천시 실내 프로그램으로 대체",
        "최소 4인부터 진행"
      ]
    }
  },
  {
    id: "digital-detox",
    category: "healing",
    title: "디지털 디톡스 캠프",
    description: "일상에서 벗어나 자연과 함께하는 특별한 시간",
    duration: "2박 3일",
    price: 450000,
    minParticipants: 2,
    image: "/images/healing-room.jpg",
    tags: ["명상", "자연치유", "디지털프리"],
    details: {
      schedule: [
        "Day 1 - 오리엔테이션 및 명상 입문",
        "Day 2 - 자연 체험 및 힐링 프로그램",
        "Day 3 - 마음챙김 및 마무리"
      ],
      includes: [
        "전문 강사진의 1:1 케어",
        "명상 및 요가 클래스",
        "건강식 식사 제공",
        "숙박(2인실 기준)",
        "프로그램 교재"
      ],
      notice: [
        "디지털 기기 사용이 제한됩니다",
        "편안한 복장을 준비해주세요",
        "개인 물품은 별도 안내 예정입니다"
      ]
    }
  },
  {
    id: "teacher-healing",
    category: "education",
    title: "교원 힐링 연수",
    description: "교육자를 위한 특별한 치유 프로그램",
    duration: "3박 4일",
    price: 580000,
    minParticipants: 10,
    image: "/images/healing-room.jpg",
    tags: ["명상", "스트레스해소", "동료교류"],
    details: {
      schedule: [
        "Day 1 - 오리엔테이션 및 스트레스 관리법",
        "Day 2 - 명상과 마음챙김",
        "Day 3 - 교육자 간 경험 나눔",
        "Day 4 - 실천 계획 수립"
      ],
      includes: [
        "전문 상담사 1:1 케어",
        "명상 및 요가 클래스",
        "건강식 식사 제공",
        "숙박(2인실 기준)",
        "연수 교재 및 수료증"
      ],
      notice: [
        "교직원 증명서를 지참해주세요",
        "편안한 복장을 준비해주세요",
        "연수 시간은 30시간 인정됩니다"
      ]
    }
  },
  {
    id: "family-healing",
    category: "healing",
    title: "가족 힐링 캠프",
    description: "가족과 함께하는 특별한 추억 만들기",
    duration: "1박 2일",
    price: 360000,
    minParticipants: 4,
    image: "/images/healing-room.jpg",
    tags: ["가족활동", "자연체험", "추억만들기"],
    details: {
      schedule: [
        "Day 1 - 가족 레크리에이션 및 자연체험",
        "Day 2 - 가족 미션 및 추억 만들기"
      ],
      includes: [
        "가족 단위 활동",
        "체험 프로그램",
        "건강식 식사 제공",
        "숙박(4인실 기준)",
        "기념품"
      ],
      notice: [
        "초등학생 이상 참여 가능",
        "야외 활동복을 준비해주세요",
        "우천시 실내 프로그램으로 대체"
      ]
    }
  },
  {
    id: "wellness",
    category: "healing",
    title: "웰니스 디톡스",
    description: "건강한 몸과 마음을 위한 프로그램",
    duration: "4박 5일",
    price: 890000,
    minParticipants: 1,
    image: "/images/healing-room.jpg",
    tags: ["건강식", "요가", "디톡스"],
    details: {
      schedule: [
        "Day 1 - 건강 체크 및 프로그램 안내",
        "Day 2-4 - 맞춤형 운동 및 식이요법",
        "Day 5 - 건강 평가 및 생활 수칙"
      ],
      includes: [
        "전문의 상담",
        "맞춤형 운동 처방",
        "디톡스 식단 제공",
        "숙박(1인실 기준)",
        "운동복 및 용품"
      ],
      notice: [
        "사전 건강검진이 필요합니다",
        "개인 운동복을 준비해주세요",
        "식단 조절이 포함됩니다"
      ]
    }
  },
  {
    id: "pension",
    category: "pension",
    title: "숙박객 전용 패키지",
    description: "자연 속에서 편안한 휴식과 힐링을 경험하세요",
    duration: "1박 2일",
    price: 700000,
    minParticipants: 15,
    image: "/images/healing-room.jpg",
    tags: ["1박2일", "15인기준", "조식포함"],
    details: {
      schedule: [
        "15:00 - 체크인",
        "자유시간 (펜션 주변 산책)",
        "저녁식사 (자유식)",
        "다음날 아침식사",
        "11:00 - 체크아웃"
      ],
      includes: [
        "주차 가능",
        "와이파이",
        "TV/에어컨",
        "기본 침구류",
        "주방 시설"
      ],
      notice: [
        "체크인 15:00 / 체크아웃 11:00",
        "주차 가능",
        "전 객실 금연",
        "가장 빠른 예약 가능 주말: 7월 26일(토요일)"
      ]
    }
  },
  {
    id: "pension-hourly",
    category: "pension",
    title: "3시간 단위 대여",
    description: "잠깐의 휴식이 필요할 때, 3시간 단위로 이용하세요",
    duration: "3시간",
    price: 300000,
    minParticipants: 4,
    image: "/images/healing-room.jpg",
    tags: ["단기대여", "미팅", "휴식"],
    details: {
      schedule: [
        "1부 09:00 - 12:00",
        "2부 13:00 - 16:00",
        "3부 17:00 - 20:00"
      ],
      includes: [
        "객실 1실",
        "주차 1대",
        "타월 세트",
        "커피 서비스"
      ],
      notice: [
        "최대 4인 기준입니다",
        "시간 엄수 필수",
        "최대 3회까지 연속 예약 가능",
        "시간 변경은 사전 문의 필수"
      ]
    }
  },
  {
    id: "pension-day-night",
    category: "pension",
    title: "주/야간 패키지",
    description: "주간 또는 야간 시간대를 자유롭게 이용하세요",
    duration: "5시간",
    price: 400000,
    minParticipants: 6,
    image: "/images/healing-room.jpg",
    tags: ["주간권", "야간권", "파티"],
    details: {
      schedule: [
        "주간권 10:00 - 15:00",
        "야간권 17:00 - 22:00"
      ],
      includes: [
        "객실 1실",
        "주차 2대",
        "타월 세트",
        "음료 서비스",
        "바베큐 시설 (재료 별도)"
      ],
      notice: [
        "최대 6인 기준입니다",
        "시간 초과 시 추가 요금",
        "소음 주의 필수",
        "야간 수영장 이용 불가",
        "시간 변경은 사전 문의 필수"
      ]
    }
  },
  {
    id: "meditation",
    category: "healing",
    title: "명상 프로그램",
    description: "마음의 평화를 찾는 전문 명상 프로그램",
    duration: "120분",
    price: 80000,
    minParticipants: 1,
    image: "/images/yoga-class.jpg",
    tags: ["마음챙김", "스트레스해소", "초보가능"],
    details: {
      schedule: [
        "호흡 명상 (30분)",
        "걷기 명상 (30분)",
        "차 명상 (30분)",
        "마음챙김 명상 (30분)"
      ],
      includes: [
        "전문 명상 강사 지도",
        "명상 도구 제공",
        "유기농 차 제공",
        "명상 가이드북"
      ],
      notice: [
        "편한 복장으로 참여해주세요",
        "수건과 물병을 지참해주세요",
        "식사 후 1시간 이후 참여 권장"
      ]
    }
  },
  {
    id: "singing-bowl",
    category: "healing",
    title: "싱잉볼 테라피",
    description: "소리의 진동으로 깊은 이완을 경험하는 프로그램",
    duration: "90분",
    price: 120000,
    minParticipants: 1,
    image: "/programs/singing-bowl.jpg",
    tags: ["소리치유", "깊은이완", "스트레스해소"],
    details: {
      schedule: [
        "심신이완 준비 (15분)",
        "싱잉볼 명상 (45분)",
        "차크라 클렌징 (20분)",
        "마무리 테라피 (10분)"
      ],
      includes: [
        "전문 싱잉볼 테라피스트",
        "7가지 차크라 싱잉볼 세트",
        "아로마 테라피",
        "온열 매트"
      ],
      notice: [
        "편안한 옷차림 필수",
        "금속 액세서리 착용 금지",
        "임산부는 사전 상담 필요"
      ]
    }
  },
  {
    id: "yoga",
    category: "healing",
    title: "자연 요가 클래스",
    description: "자연 속에서 진행되는 힐링 요가 수업",
    duration: "90분",
    price: 70000,
    minParticipants: 1,
    image: "/programs/yoga.jpg",
    tags: ["요가", "자연명상", "전체레벨"],
    details: {
      schedule: [
        "몸풀기 스트레칭 (15분)",
        "하타 요가 (45분)",
        "명상 요가 (20분)",
        "쿨다운 (10분)"
      ],
      includes: [
        "전문 요가 강사 지도",
        "요가 매트 대여",
        "타월 제공",
        "허브티 서비스"
      ],
      notice: [
        "운동복 착용 필수",
        "식사는 2시간 전까지 마무리",
        "초보자도 참여 가능",
        "우천시 실내 진행"
      ]
    }
  },
  {
    id: "prototype-workshop",
    category: "education",
    title: "시제품 개발 워크샵",
    description: "아이디어를 실제 제품으로 만드는 1박 2일 집중 과정",
    duration: "1박 2일",
    price: 990000,
    minParticipants: 1,
    image: "/programs/prototype.jpg",
    tags: ["제품개발", "실습위주", "소그룹"],
    details: {
      schedule: [
        "Day 1 - 아이디어 발상 및 기획",
        "- 아이디어 스케치 및 피드백",
        "- 3D 모델링 기초 실습",
        "Day 2 - 시제품 제작",
        "- 3D 프린팅 실습",
        "- 후가공 및 완성",
        "- 결과물 발표회"
      ],
      includes: [
        "전문 강사 1:1 지도",
        "3D 프린터 사용",
        "재료 및 도구 제공",
        "숙박(2인실 기준)",
        "식사 3식 제공",
        "결과물 택배 발송"
      ],
      notice: [
        "노트북 지참 필수",
        "기초 디자인 툴 사전 설치 필요",
        "최대 6인 소그룹으로 진행"
      ]
    }
  },
  {
    id: "marketing-bootcamp",
    category: "education",
    title: "마케팅 원데이 부트캠프",
    description: "실전 디지털 마케팅 전략 수립 1박 2일 과정",
    duration: "1박 2일",
    price: 990000,
    minParticipants: 1,
    image: "/programs/marketing.jpg",
    tags: ["디지털마케팅", "실전과정", "데이터분석"],
    details: {
      schedule: [
        "Day 1 - 마케팅 기초 및 실습",
        "- 마케팅 트렌드 분석",
        "- SNS 마케팅 전략 수립",
        "- 실전 광고 캠페인 기획",
        "Day 2 - 실전 마케팅",
        "- 광고 집행 실습",
        "- 데이터 분석",
        "- 성과 리포트 작성"
      ],
      includes: [
        "실전 워크북 제공",
        "광고 플랫폼 실습비",
        "데이터 분석 툴 라이센스",
        "숙박(2인실 기준)",
        "식사 3식 제공",
        "수료증 발급"
      ],
      notice: [
        "노트북 필수 지참",
        "기본적인 엑셀 사용 가능자",
        "실제 운영 중인 SNS 계정 필요"
      ]
    }
  },
  {
    id: "website-oneday",
    category: "education",
    title: "하루만에 웹사이트 완성",
    description: "노코드 툴을 활용한 웹사이트 제작 1박 2일 과정",
    duration: "1박 2일",
    price: 990000,
    minParticipants: 1,
    image: "/programs/website.jpg",
    tags: ["노코드", "웹사이트", "실습위주"],
    details: {
      schedule: [
        "Day 1 - 기획 및 기초 실습",
        "- 웹사이트 기획 및 와이어프레임",
        "- 노코드 툴 기초 학습",
        "- 템플릿 커스터마이징",
        "Day 2 - 제작 및 배포",
        "- 실전 웹사이트 제작",
        "- 콘텐츠 구성",
        "- 도메인 연결 및 배포"
      ],
      includes: [
        "노코드 툴 1년 구독권",
        "프리미엄 템플릿 제공",
        "도메인 1년",
        "웹호스팅 1년",
        "숙박(2인실 기준)",
        "식사 3식 제공"
      ],
      notice: [
        "노트북 필수 지참",
        "기초 컴퓨터 활용 가능자",
        "최대 8인 소그룹으로 진행",
        "수강생 웹호스팅 1년 지원"
      ]
    }
  }
] 