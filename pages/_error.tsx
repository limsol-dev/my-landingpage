import { NextPage } from 'next'

interface ErrorProps {
  statusCode?: number
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div style={{ display: 'none' }}>
      {/* 에러 메시지를 숨김 처리 */}
      {statusCode
        ? `서버에서 ${statusCode} 에러가 발생했습니다`
        : '클라이언트에서 에러가 발생했습니다'}
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 