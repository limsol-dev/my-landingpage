export default function ForceAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">🔓 강제 관리자 페이지</h1>
            <p className="mt-2 text-gray-600">권한 체크 없이 바로 접근 가능한 관리자 페이지입니다</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 환영 메시지 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-medium text-green-800 mb-2">✅ 관리자 페이지 접속 성공!</h3>
          <p className="text-green-700">
            권한 체크를 우회하여 관리자 기능에 접근하고 있습니다.
          </p>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 회원 수</dt>
                    <dd className="text-lg font-medium text-gray-900">1+</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 예약 수</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 매출</dt>
                    <dd className="text-lg font-medium text-gray-900">0원</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 관리 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">회원 관리</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">사용자 계정 관리 기능</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <button className="w-full bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left">
                    <div className="font-medium text-blue-900">사용자 목록 보기</div>
                    <div className="text-sm text-blue-700 mt-1">등록된 모든 사용자 확인</div>
                  </button>
                  
                  <button className="w-full bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left">
                    <div className="font-medium text-green-900">권한 관리</div>
                    <div className="text-sm text-green-700 mt-1">사용자 권한 설정 및 수정</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">예약 관리</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">예약 현황 및 관리 기능</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <button className="w-full bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left">
                    <div className="font-medium text-purple-900">예약 현황</div>
                    <div className="text-sm text-purple-700 mt-1">실시간 예약 상황 확인</div>
                  </button>
                  
                  <button className="w-full bg-orange-50 hover:bg-orange-100 p-3 rounded-lg text-left">
                    <div className="font-medium text-orange-900">정산 관리</div>
                    <div className="text-sm text-orange-700 mt-1">매출 분석 및 정산 처리</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">시스템 상태</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm font-medium text-gray-900">데이터베이스</div>
                <div className="text-xs text-gray-500">정상 연결</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm font-medium text-gray-900">인증 시스템</div>
                <div className="text-xs text-gray-500">정상 작동</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm font-medium text-gray-900">결제 시스템</div>
                <div className="text-xs text-gray-500">연결 대기</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">🔧</div>
                <div className="text-sm font-medium text-gray-900">관리자 권한</div>
                <div className="text-xs text-gray-500">강제 활성화</div>
              </div>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">페이지 이동</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="/" className="block bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center">
                <div className="font-medium text-blue-900">🏠 메인 사이트</div>
                <div className="text-sm text-blue-700 mt-1">홈페이지로 이동</div>
              </a>
              
              <a href="/profile" className="block bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center">
                <div className="font-medium text-green-900">👤 내 프로필</div>
                <div className="text-sm text-green-700 mt-1">사용자 정보</div>
              </a>
              
              <a href="/admin-dashboard" className="block bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <div className="font-medium text-purple-900">⚙️ 원본 관리자</div>
                <div className="text-sm text-purple-700 mt-1">권한 체크 있는 페이지</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 