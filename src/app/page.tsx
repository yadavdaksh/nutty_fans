import Link from 'next/link';
import { ArrowRight, Users, DollarSign, TrendingUp, Star, Sparkles } from 'lucide-react';

export default function Home() {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Creator Card 1 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>Alex Rivera</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm font-normal text-[#4a5565] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>@alexfitpro</p>
                    <div className="flex items-center gap-4 text-sm font-normal text-[#4a5565] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        156K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $19.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                      Fitness
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card 2 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]">Marcus Chen</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm text-[#4a5565] mb-2">@marcusmusic</p>
                    <div className="flex items-center gap-4 text-sm text-[#4a5565] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        95K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $14.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      Music
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card 3 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-pink-400 to-rose-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]">Emma Rose</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm text-[#4a5565] mb-2">@emmaroseart</p>
                    <div className="flex items-center gap-4 text-sm text-[#4a5565] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        210K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $12.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-pink-50 text-pink-700 rounded-full">
                      Art
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card 4 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-green-400 to-emerald-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-300 to-emerald-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]">Jake Thompson</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm text-[#4a5565] mb-2">@jakethephoto</p>
                    <div className="flex items-center gap-4 text-sm text-[#4a5565] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        89K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $7.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                      Photography
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card 5 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]">Luna Star</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm text-[#4a5565] mb-2">@lunastarmusic</p>
                    <div className="flex items-center gap-4 text-sm text-[#4a5565] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        175K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $15.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                      Music
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Card 6 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-orange-400 to-red-400"></div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-red-300 -mt-10 border-4 border-white"></div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#101828]">Sarah Johnson</h3>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <p className="text-sm text-[#4a5565] mb-2">@sarahjfitness</p>
                    <div className="flex items-center gap-4 text-sm text-[#4a5565] mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        128K
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        $9.99/mo
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                      Fitness
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 text-[#101828] font-medium hover:border-purple-500 hover:text-purple-600 transition-colors"
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300"></div>
                <div>
                  <h4 className="font-semibold text-[#101828]" style={{ fontFamily: 'Inter, sans-serif' }}>Jessica Martinez</h4>
                  <p className="text-sm font-normal text-[#4a5565]" style={{ fontFamily: 'Inter, sans-serif' }}>Fitness Creator</p>
                </div>
              </div>
              <p className="font-normal text-[#4a5565] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                &quot;NuttyFans changed my life! I went from side hustle to full-time creator in just 6 months.&quot;
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>$12K/month</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300"></div>
                <div>
                  <h4 className="font-semibold text-[#101828]">David Kim</h4>
                  <p className="text-sm text-[#4a5565]">Music Producer</p>
                </div>
              </div>
              <p className="text-[#4a5565] mb-4 leading-relaxed">
                &quot;The best platform for connecting with real fans. The subscription model is perfect for sustainable income.&quot;
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">$8.5K/month</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-rose-300"></div>
                <div>
                  <h4 className="font-semibold text-[#101828]">Nina Patel</h4>
                  <p className="text-sm text-[#4a5565]">Digital Artist</p>
                </div>
              </div>
              <p className="text-[#4a5565] mb-4 leading-relaxed">
                &quot;Finally, a platform that values creators. The community is amazing and the tools are powerful.&quot;
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">$15K/month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl font-normal text-white/90 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join thousands of creators earning a sustainable income doing what they love.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
