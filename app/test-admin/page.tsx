export default function TestAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">🛠️ 테스트 관리자 페이지</h1>
            <p className="mt-2 text-gray-600">정상 작동하는 페이지입니다!</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">✅ 성공적으로 페이지가 로드되었습니다!</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5">
              <p className="text-gray-700 mb-4">
                이 페이지가 보인다면 기본적인 Next.js 라우팅이 작동하고 있습니다.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📍 다음 단계:</h4>
                  <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
                    <li><strong>F12 키</strong>를 눌러 개발자 도구 열기</li>
                    <li><strong>Console 탭</strong>으로 이동</li>
                    <li>아래 코드를 <strong>복사해서 붙여넣기</strong></li>
                    <li><strong>Enter 키</strong>로 실행</li>
                  </ol>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <div className="text-white mb-2">// 이 코드를 콘솔에 복사해서 실행하세요:</div>
                  {`(async () => {
  console.log('=== 관리자 권한 설정 시작 ===');
  
  // localStorage에서 로그인 정보 찾기
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  console.log('Supabase 키들:', keys);
  
  let userEmail = null;
  for (let key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data.user?.email) {
        userEmail = data.user.email;
        console.log('발견된 사용자:', userEmail);
        break;
      }
    } catch (e) {}
  }
  
  if (userEmail === 'sool9241@naver.com') {
    console.log('✅ 관리자 계정 확인완료!');
    alert('관리자 권한이 확인되었습니다!\\n\\n다음:\\n1. 이 알림창 닫기\\n2. 페이지 새로고침 (F5)\\n3. /admin-dashboard 접속');
  } else if (userEmail) {
    console.log('❌ 다른 계정:', userEmail);
    alert('다른 계정입니다: ' + userEmail);
  } else {
    console.log('❌ 로그인 정보 없음');
    alert('로그인이 필요합니다!\\n/login 페이지로 이동해주세요.');
  }
})();`}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">📝 중요 안내:</h4>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    <li>위 코드를 <strong>브라우저 콘솔</strong>에서 실행하세요</li>
                    <li>성공 메시지가 뜨면 <strong>F5로 새로고침</strong></li>
                    <li>그 다음 <strong>/admin-dashboard</strong> 접속해보세요</li>
                    <li>현재 서버는 <strong>포트 3001</strong>에서 실행 중입니다</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a 
                    href="/" 
                    className="block bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 text-center transition-colors"
                  >
                    <div className="font-medium text-blue-900">🏠 메인 사이트</div>
                    <div className="text-sm text-blue-700 mt-1">홈페이지</div>
                  </a>
                  
                  <a 
                    href="/login" 
                    className="block bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 text-center transition-colors"
                  >
                    <div className="font-medium text-green-900">🔐 로그인</div>
                    <div className="text-sm text-green-700 mt-1">로그인 페이지</div>
                  </a>

                  <a 
                    href="/admin-dashboard" 
                    className="block bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200 text-center transition-colors"
                  >
                    <div className="font-medium text-purple-900">⚙️ 관리자</div>
                    <div className="text-sm text-purple-700 mt-1">관리자 대시보드</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 현재 상태 표시 */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">🔍 현재 상태</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• 서버 실행: <span className="text-green-600 font-medium">포트 3001</span></div>
              <div>• 페이지 로드: <span className="text-green-600 font-medium">정상</span></div>
              <div>• Next.js 라우팅: <span className="text-green-600 font-medium">작동</span></div>
              <div>• 다음 단계: <span className="text-blue-600 font-medium">브라우저 콘솔에서 위 코드 실행</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 