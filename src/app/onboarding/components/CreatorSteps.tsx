import React from 'react';
import NextImage from 'next/image';
import { Check, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../onboarding.types';

interface CreatorStepsProps {
  step: number;
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  tiers: { name: string; price: string; description: string; benefits: string[] }[];
  setTiers: (tiers: { name: string; price: string; description: string; benefits: string[] }[]) => void;
  selectedCoverImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => void;
  socials: { instagram: string; twitter: string; youtube: string; website: string };
  setSocials: (socials: { instagram: string; twitter: string; youtube: string; website: string }) => void;
}

export default function CreatorSteps({
  step,
  selectedCategories,
  toggleCategory,
  tiers,
  setTiers,
  selectedCoverImage,
  handleImageUpload,
  socials,
  setSocials
}: CreatorStepsProps) {

  // Step 4: Categories
  if (step === 4) {
    return (
      <div className="w-full max-w-4xl text-center animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Choose Your Categories</h1>
          <p className="text-lg text-[#475467] font-inter">Select up to 5 categories that best describe your content</p>
          <p className="text-sm text-purple-600 mt-2 font-inter">{selectedCategories.length}/5 selected</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`p-6 rounded-[20px] border transition-all text-left flex flex-col gap-3 hover:shadow-md ${
                selectedCategories.includes(cat.id)
                  ? 'border-[#9810fa] bg-purple-50 text-[#9810fa]'
                  : 'border-gray-200 bg-white text-[#475467] hover:border-purple-200'
              }`}
            >
              <div className="flex justify-between items-start">
                {cat.icon}
                {selectedCategories.includes(cat.id) && <Check className="w-4 h-4 bg-purple-600 text-white rounded-full p-0.5" />}
              </div>
              <span className="font-medium font-inter">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 5: Tiers
  if (step === 5) {
    return (
      <div className="w-full max-w-5xl text-center">
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Set Your Subscription Tiers</h1>
          <p className="text-lg text-[#475467] font-inter">Create pricing options for your fans</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <div key={index} className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-lg text-left">
              <div className="mb-4">
                <label className="text-sm font-medium text-[#344054] mb-1 block">Tier Name</label>
                <input 
                  value={tier.name}
                  onChange={(e) => {
                    const newTiers = [...tiers];
                    newTiers[index].name = e.target.value;
                    setTiers(newTiers);
                  }}
                  placeholder={index === 0 ? 'Basic' : index === 1 ? 'Premium' : 'VIP'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-[#344054] mb-1 block">Price (USD/month)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input 
                    type="text" 
                    value={tier.price}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].price = e.target.value;
                      setTiers(newTiers);
                    }}
                    placeholder="4.99" 
                    className="w-full pl-6 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344054] mb-1 block">Benefits</label>
                <div className="space-y-3">
                  {tier.benefits.map((benefit: string, bIndex: number) => (
                    <div key={bIndex} className="flex gap-2 items-center">
                      <input 
                        value={benefit}
                        onChange={(e) => {
                          const newTiers = [...tiers];
                          newTiers[index].benefits[bIndex] = e.target.value;
                          setTiers(newTiers);
                        }}
                        placeholder={bIndex === 0 ? "Exclusive posts" : "Additional benefit"}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent" 
                      />
                      {tier.benefits.length > 1 && (
                        <button 
                          onClick={() => {
                            const newTiers = [...tiers];
                            newTiers[index].benefits = newTiers[index].benefits.filter((_: string, i: number) => i !== bIndex);
                            setTiers(newTiers);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newTiers = [...tiers];
                      newTiers[index].benefits.push('');
                      setTiers(newTiers);
                    }}
                    className="text-sm text-purple-600 flex items-center gap-1 font-medium hover:text-purple-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Benefit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 6: Cover Image
  if (step === 6) {
    return (
      <div className="w-full max-w-3xl text-center">
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Upload Cover Image</h1>
          <p className="text-lg text-[#475467] font-inter">Make a striking first impression.</p>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-xl">
          <div className="border-2 border-dashed border-gray-300 rounded-[24px] aspect-[21/9] flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden">
            {selectedCoverImage ? (
              <NextImage 
                src={selectedCoverImage} 
                alt="Cover" 
                fill 
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover" 
              />
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-[#344054] font-medium font-inter">Click to upload cover image</p>
              </>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'cover')} />
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Socials
  if (step === 7) {
    return (
      <div className="w-full max-w-2xl text-center">
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#101828] mb-3 font-inter">Connect Your Social Media</h1>
          <p className="text-lg text-[#475467] font-inter">Let fans find you elsewhere.</p>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-xl text-left space-y-6">
          {['Instagram', 'Twitter / X', 'YouTube', 'Website'].map((platform) => (
            <div key={platform}>
              <label className="text-sm font-medium text-[#344054] mb-1.5 flex items-center gap-2">
                {platform}
              </label>
              <input 
                type="text" 
                placeholder={`Link to ${platform}`}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-inter text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9810fa] focus:border-transparent transition-all"
                onChange={(e) => setSocials({...socials, [platform.split(' ')[0].toLowerCase()]: e.target.value})}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
