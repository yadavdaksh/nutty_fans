'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';
import { useCreators } from '@/hooks/useCreators';

export default function LandingPage() {
  const { creators, loading } = useCreators();
  const topCreators = creators.slice(0, 6);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-8">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                🎉 Join 500K+ creators already earning
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl font-semibold mb-6 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="text-[#101828]">Empowering Creators.</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">Connecting Fans.</span>
            </h1>

            {/* Description */}
            <p className="text-xl font-normal text-[#4a5565] mb-10 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Turn your passion into profit. Build a sustainable business with subscription-based content and direct fan support.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Become a Creator
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-gray-200 text-[#101828] font-medium hover:border-purple-500 hover:text-purple-600 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explore Creators
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Active Creators */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-4xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>500K+</div>
              <div className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Active Creators</div>
            </div>

            {/* Paid Out */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mb-4">
                <DollarSign className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-4xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>$2.5B+</div>
              <div className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Paid Out</div>
            </div>

            {/* Monthly Growth */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-4xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>35%</div>
              <div className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Monthly Growth</div>
            </div>

            {/* Avg Rating */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-4xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>4.9/5</div>
              <div className="text-base font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Avg. Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Top Creators</h2>
            <p className="text-xl font-normal text-[#4a5565] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Discover amazing creators and subscribe to exclusive content
            </p>
          </div>

          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
             </div>
          ) : topCreators.length === 0 ? (
            <div className="text-center py-12 text-[#475467] bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No creators found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {topCreators.map((creator) => (
                <Link 
                  key={creator.userId} 
                  href={`/profile/${creator.userId}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 group-hover:opacity-90 transition-opacity"></div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-100 -mt-16 border-4 border-white shadow-lg overflow-hidden shrink-0">
                        <img 
                          src={creator.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.user.displayName)}`} 
                          alt={creator.user.displayName} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[#101828] group-hover:text-purple-600 transition-colors">
                            {creator.user.displayName}
                          </h3>
                          <Check className="w-4 h-4 text-[#9810fa] fill-current" />
                        </div>
                        <p className="text-sm font-normal text-[#4a5565] mb-3">@{creator.user.displayName.toLowerCase().replace(/\s/g, '')}</p>
                        <div className="flex items-center gap-4 text-sm font-normal text-[#4a5565] mb-4">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users className="w-4 h-4 text-purple-500" />
                            {(creator.subscriberCount || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            {creator.subscriptionTiers?.[0]?.price || '9.99'}/mo
                          </span>
                        </div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-gray-100 text-[#344054] rounded-full">
                          {creator.categories?.[0] || 'Creator'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-200 text-[#101828] font-semibold hover:border-purple-500 hover:text-purple-600 transition-all bg-white"
            >
              View All Creators
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Creator Success Stories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Success Stories</h2>
            <p className="text-xl font-normal text-[#4a5565] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Real creators, real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 border-2 border-white shadow-sm"></div>
                <div>
                  <h4 className="font-bold text-[#101828]">Jessica Martinez</h4>
                  <p className="text-sm font-medium text-purple-600">Fitness Creator</p>
                </div>
              </div>
              <p className="font-normal text-[#4a5565] mb-6 leading-relaxed italic">
                &quot;NuttyFans changed my life! I went from side hustle to full-time creator in just 6 months.&quot;
              </p>
              <div className="flex items-center gap-2 text-[#101828] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-bold">$12K/month earnings</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 border-2 border-white shadow-sm"></div>
                <div>
                  <h4 className="font-bold text-[#101828]">David Kim</h4>
                  <p className="text-sm font-medium text-blue-600">Music Producer</p>
                </div>
              </div>
              <p className="text-[#4a5565] mb-6 leading-relaxed italic">
                &quot;The best platform for connecting with real fans. The subscription model is perfect for sustainable income.&quot;
              </p>
              <div className="flex items-center gap-2 text-[#101828] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-bold">$8.5K/month earnings</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 border-2 border-white shadow-sm"></div>
                <div>
                  <h4 className="font-bold text-[#101828]">Nina Patel</h4>
                  <p className="text-sm font-medium text-pink-600">Digital Artist</p>
                </div>
              </div>
              <p className="text-[#4a5565] mb-6 leading-relaxed italic">
                &quot;Finally, a platform that values creators. The community is amazing and the tools are powerful.&quot;
              </p>
              <div className="flex items-center gap-2 text-[#101828] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-bold">$15K/month earnings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#101828] to-[#1d2939] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators earning a sustainable income doing what they love. Get analytics, direct messaging, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/discover" className="text-white hover:text-purple-400 font-semibold transition-colors">
              Explore Discover Feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
