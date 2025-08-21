'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        console.log('로그인 시도:', email)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('로그인 오류:', error)
          throw error
        }
        console.log('로그인 성공')
      } else {
        console.log('회원가입 시도:', email)
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          console.error('회원가입 오류:', error)
          throw error
        }
        console.log('회원가입 성공')
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      console.log('구글 로그인 시도')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname || '/whisky-Log/'}`
        }
      })
      if (error) {
        console.error('구글 로그인 오류:', error)
        throw error
      }
      console.log('구글 로그인 성공')
    } catch (error) {
      console.error('Google auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6" data-theme="whisky">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="avatar placeholder mb-4">
            <div className="bg-primary text-primary-content rounded-box w-20">
              <span className="text-4xl">🥃</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Whisky Log</h1>
          <p className="opacity-70">당신의 위스키 여정을 기록하세요</p>
        </div>

        {/* 폼 카드 */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-6">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
            
            {/* 구글 로그인 버튼 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn btn-outline w-full mb-6"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  처리중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 {isLogin ? '로그인' : '회원가입'}
                </>
              )}
            </button>

            <div className="divider">또는</div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">이메일 주소</span>
                </label>
                <input
                  type="email"
                  required
                  className="input input-bordered"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">비밀번호</span>
                </label>
                <input
                  type="password"
                  required
                  className="input input-bordered"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    처리중...
                  </>
                ) : (
                  isLogin ? '로그인' : '회원가입'
                )}
              </button>
            </form>

            {/* 전환 버튼 */}
            <div className="divider">또는</div>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="btn btn-ghost w-full"
            >
              {isLogin ? '계정이 없으신가요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
            </button>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8">
          <p className="text-sm opacity-50">
            위스키 컬렉션과 시음 기록을 관리하세요
          </p>
        </div>
      </div>
    </div>
  )
} 