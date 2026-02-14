'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Loader2,
  Check
} from 'lucide-react';
import { useCreators } from '@/hooks/useCreators';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LandingPage() {
  const { creators, loading } = useCreators();
  const { user } = useAuth();
  const router = useRouter();
  const topCreators = creators.slice(0, 6);

  const handleProtectedAction = (path: string) => {
    if (!user) {
      toast.error('Please sign in to explore our creators!', {
        icon: '🔒',
        style: {
          borderRadius: '12px',
          background: '#101828',
          color: '#fff',
        },
      });
      return;
    }
    router.push(path);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient overlay - exact Figma gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(250, 245, 255, 1) 0%, rgba(253, 242, 248, 1) 50%, rgba(255, 247, 237, 1) 100%)'
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
              opacity: 0.08
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '9999px'
              }}
            >
              <span 
                className="text-sm font-medium"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.2px',
                  fontWeight: 400,
                  color: '#0A0A0A'
                }}
              >
                🎉 Join 500K+ creators already earning
              </span>
            </div>

            {/* Main Heading - Exact Figma sizes */}
            <h1 className="mb-6 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span 
                className="block"
                style={{ 
                  fontSize: '66.8px',
                  fontWeight: 400,
                  color: '#101828',
                  lineHeight: '1.2'
                }}
              >
                Empowering Creators.
              </span>
              <span 
                className="block"
                style={{
                  fontSize: '66.8px',
                  fontWeight: 400,
                  background: 'linear-gradient(90deg, rgba(173, 70, 255, 1) 0%, rgba(227, 132, 255, 1) 50%, rgba(134, 93, 255, 1) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1.2'
                }}
              >
                Connecting Fans.
              </span>
            </h1>

            {/* Description - Exact Figma size */}
            <p 
              className="mb-10 max-w-3xl mx-auto leading-relaxed"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '18.6px',
                fontWeight: 400,
                color: '#4A5565'
              }}
            >
              Turn your passion into profit. Build a sustainable business with subscription-based content and direct fan support.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '9999px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                Become a Creator
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleProtectedAction('/discover')}
                className="inline-flex items-center px-6 py-3 rounded-full border-2 hover:border-purple-500 hover:text-purple-600 transition-colors"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  color: '#101828',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '9999px'
                }}
              >
                Explore Creators
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E7EB'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Active Creators */}
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-14 h-14 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(252, 231, 243, 1) 100%)',
                  borderRadius: '14px'
                }}
              >
                <Users className="w-6 h-6" style={{ color: '#8200DB' }} />
              </div>
              <div 
                className="mb-2"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#101828'
                }}
              >
                500K+
              </div>
              <div 
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.2px',
                  fontWeight: 400,
                  color: '#4A5565'
                }}
              >
                Active Creators
              </div>
            </div>

            {/* Paid Out */}
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-14 h-14 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(252, 231, 243, 1) 100%)',
                  borderRadius: '14px'
                }}
              >
                <DollarSign className="w-6 h-6" style={{ color: '#8200DB' }} />
              </div>
              <div 
                className="mb-2"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#101828'
                }}
              >
                $2.5B+
              </div>
              <div 
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.2px',
                  fontWeight: 400,
                  color: '#4A5565'
                }}
              >
                Paid Out
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-14 h-14 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(252, 231, 243, 1) 100%)',
                  borderRadius: '14px'
                }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: '#8200DB' }} />
              </div>
              <div 
                className="mb-2"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#101828'
                }}
              >
                35%
              </div>
              <div 
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.2px',
                  fontWeight: 400,
                  color: '#4A5565'
                }}
              >
                Monthly Growth
              </div>
            </div>

            {/* Avg Rating */}
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-14 h-14 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(252, 231, 243, 1) 100%)',
                  borderRadius: '14px'
                }}
              >
                <Star className="w-6 h-6" style={{ color: '#8200DB' }} />
              </div>
              <div 
                className="mb-2"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#101828'
                }}
              >
                4.9/5
              </div>
              <div 
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.2px',
                  fontWeight: 400,
                  color: '#4A5565'
                }}
              >
                Avg. Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '32.2px',
                fontWeight: 400,
                color: '#101828'
              }}
            >
              Top Creators
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '16.7px',
                fontWeight: 400,
                color: '#4A5565'
              }}
            >
              Discover amazing creators and subscribe to exclusive content
            </p>
          </div>

          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
             </div>
          ) : topCreators.length === 0 ? (
            <div className="text-center py-12 text-[#475467] bg-white rounded-[14px] border border-dashed border-gray-200">
              No creators found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {topCreators.map((creator) => (
                <div 
                  key={creator.userId} 
                  onClick={() => handleProtectedAction(`/profile/${creator.userId}`)}
                  className="bg-white border border-gray-200 rounded-[14px] overflow-hidden hover:shadow-xl transition-all group relative cursor-pointer"
                >
                  {/* Gradient banner */}
                  <div 
                    className="h-32 group-hover:opacity-90 transition-opacity relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)'
                    }}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar positioned relative to card */}
                      <div className="relative -mt-12">
                        <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden shrink-0 relative">
                          <Image 
                            src={creator.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.user.displayName)}`} 
                            alt={creator.user.displayName} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 pt-2">
                        {/* Category badge */}
                        <div className="mb-3">
                          <span 
                            className="inline-block px-2 py-1 rounded-lg border"
                            style={{
                              backgroundColor: '#F3E8FF',
                              borderColor: '#E9D4FF',
                              color: '#8200DB',
                              fontSize: '11.4px',
                              fontWeight: 500,
                              fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            {creator.categories?.[0] || 'Creator'}
                          </span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-2">
                          <span 
                            className="flex items-center gap-1.5"
                            style={{
                              fontSize: '13.2px',
                              fontWeight: 400,
                              color: '#364153',
                              fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            <Users className="w-4 h-4" style={{ color: '#8200DB' }} />
                            {(creator.subscriberCount || 0).toLocaleString()}
                          </span>
                          <span 
                            className="flex items-center gap-1.5"
                            style={{
                              fontSize: '13.2px',
                              fontWeight: 400,
                              color: '#364153',
                              fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            <DollarSign className="w-4 h-4" style={{ color: '#8200DB' }} />
                            ${creator.subscriptionTiers?.[0]?.price || '9.99'}/mo
                          </span>
                        </div>
                        
                        {/* Username */}
                        <p 
                          className="mb-2"
                          style={{
                            fontSize: '13.2px',
                            fontWeight: 400,
                            color: '#4A5565',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          @{creator.user.displayName.toLowerCase().replace(/\s/g, '')}
                        </p>
                        
                        {/* Name with checkmark */}
                        <div className="flex items-center gap-2">
                          <h3 
                            className="group-hover:text-purple-600 transition-colors"
                            style={{
                              fontSize: '15.1px',
                              fontWeight: 400,
                              color: '#101828',
                              fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            {creator.user.displayName}
                          </h3>
                          <Check className="w-4 h-4" style={{ color: '#8200DB' }} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => handleProtectedAction('/discover')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 hover:border-purple-500 hover:text-purple-600 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                color: '#0A0A0A',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              View All Creators
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Creator Success Stories Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '32.2px',
                fontWeight: 400,
                color: '#101828'
              }}
            >
              Creator Success Stories
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '16.7px',
                fontWeight: 400,
                color: '#4A5565'
              }}
            >
              Real creators, real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 border-2 border-white shadow-sm overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                  </div>
                  <div>
                    <h4 
                      style={{
                        fontSize: '15.1px',
                        fontWeight: 400,
                        color: '#101828',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Jessica Martinez
                    </h4>
                    <p 
                      style={{
                        fontSize: '13.2px',
                        fontWeight: 400,
                        color: '#4A5565',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Fitness Creator
                    </p>
                  </div>
                </div>
              </div>
              <p 
                className="mb-4 leading-relaxed"
                style={{
                  fontSize: '15.1px',
                  fontWeight: 400,
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                &quot;NuttyFans changed my life! I went from side hustle to full-time creator in just 6 months.&quot;
              </p>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  color: '#00C950',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <DollarSign className="w-4 h-4" style={{ color: '#00C950' }} />
                <span 
                  style={{
                    fontSize: '15.1px',
                    fontWeight: 400,
                    color: '#00C950'
                  }}
                >
                  $12K/month
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 border-2 border-white shadow-sm overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                  </div>
                  <div>
                    <h4 
                      style={{
                        fontSize: '15.1px',
                        fontWeight: 400,
                        color: '#101828',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      David Kim
                    </h4>
                    <p 
                      style={{
                        fontSize: '13.2px',
                        fontWeight: 400,
                        color: '#4A5565',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Music Producer
                    </p>
                  </div>
                </div>
              </div>
              <p 
                className="mb-4 leading-relaxed"
                style={{
                  fontSize: '15.1px',
                  fontWeight: 400,
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                &quot;The best platform for connecting with real fans. The subscription model is perfect for sustainable income.&quot;
              </p>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  color: '#00C950',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <DollarSign className="w-4 h-4" style={{ color: '#00C950' }} />
                <span 
                  style={{
                    fontSize: '15.1px',
                    fontWeight: 400,
                    color: '#00C950'
                  }}
                >
                  $8.5K/month
                </span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 border-2 border-white shadow-sm overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400"></div>
                  </div>
                  <div>
                    <h4 
                      style={{
                        fontSize: '15.1px',
                        fontWeight: 400,
                        color: '#101828',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Nina Patel
                    </h4>
                    <p 
                      style={{
                        fontSize: '13.2px',
                        fontWeight: 400,
                        color: '#4A5565',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Digital Artist
                    </p>
                  </div>
                </div>
              </div>
              <p 
                className="mb-4 leading-relaxed"
                style={{
                  fontSize: '15.1px',
                  fontWeight: 400,
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                &quot;Finally, a platform that values creators. The community is amazing and the tools are powerful.&quot;
              </p>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  color: '#00C950',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <DollarSign className="w-4 h-4" style={{ color: '#00C950' }} />
                <span 
                  style={{
                    fontSize: '15.1px',
                    fontWeight: 400,
                    color: '#00C950'
                  }}
                >
                  $15K/month
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#101828] to-[#1d2939] text-white overflow-hidden relative">
        {/* Background gradient overlays (subtle purple/pink glow) */}
        <div className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-600/20 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 
            className="mb-6"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '43.7px',
              fontWeight: 400
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p 
            className="mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '18.6px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            Join thousands of creators earning a sustainable income doing what they love. Get analytics, direct messaging, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full hover:shadow-lg transition-all transform hover:-translate-y-1"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '9999px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => handleProtectedAction('/discover')}
              className="transition-colors"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Explore Discover Feed
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
