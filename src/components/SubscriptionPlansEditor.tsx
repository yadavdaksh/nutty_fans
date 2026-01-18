'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Check, Loader2 } from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  benefits: string[];
}

interface SubscriptionPlansEditorProps {
  initialTiers?: Tier[];
  onSave: (tiers: Tier[]) => Promise<void>;
  saving: boolean;
}

export default function SubscriptionPlansEditor({ initialTiers = [], onSave, saving }: SubscriptionPlansEditorProps) {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers.length > 0 ? initialTiers : [
    { name: 'Basic', price: '9.99', benefits: ['Access to basic content'] }
  ]);
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const handleAddTier = () => {
    if (tiers.length >= 3) {
      alert("Maximum 3 tiers allowed.");
      return;
    }
    setTiers([...tiers, { name: 'New Tier', price: '19.99', benefits: ['Exclusive content'] }]);
    setActiveTierIndex(tiers.length);
  };

  const handleRemoveTier = (index: number) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
    if (activeTierIndex >= newTiers.length) {
      setActiveTierIndex(Math.max(0, newTiers.length - 1));
    }
  };

  const updateTier = (index: number, field: keyof Tier, value: string | string[]) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleBenefitChange = (tierIndex: number, benefitIndex: number, value: string) => {
    const newBenefits = [...tiers[tierIndex].benefits];
    newBenefits[benefitIndex] = value;
    updateTier(tierIndex, 'benefits', newBenefits);
  };

  const addBenefit = (tierIndex: number) => {
    const newBenefits = [...tiers[tierIndex].benefits, ''];
    updateTier(tierIndex, 'benefits', newBenefits);
  };

  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const newBenefits = tiers[tierIndex].benefits.filter((_, i) => i !== benefitIndex);
    updateTier(tierIndex, 'benefits', newBenefits);
  };

  return (
    <div className="space-y-8">
      {/* Tiers List (Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tiers.map((tier, index) => (
          <button
            key={index}
            onClick={() => setActiveTierIndex(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeTierIndex === index
                ? 'bg-[#101828] text-white shadow-md transform scale-105'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tier.name || 'Untitled Tier'}
          </button>
        ))}
        {tiers.length < 3 && (
          <button
            onClick={handleAddTier}
            className="flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Tier
          </button>
        )}
      </div>

      {/* Active Tier Editor */}
      {tiers.length > 0 && tiers[activeTierIndex] && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold text-[#101828]">
              Edit {tiers[activeTierIndex].name} Tier
            </h3>
            {tiers.length > 1 && (
              <button 
                onClick={() => handleRemoveTier(activeTierIndex)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete Tier"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">Tier Name</label>
                <input
                type="text"
                value={tiers[activeTierIndex].name}
                onChange={(e) => updateTier(activeTierIndex, 'name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-gray-900"
                placeholder="e.g. Premium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">Monthly Price ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tiers[activeTierIndex].price}
                  onChange={(e) => updateTier(activeTierIndex, 'price', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900"
                  placeholder="9.99"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#344054] mb-3">Benefits</label>
             <div className="space-y-3">
               {tiers[activeTierIndex].benefits.map((benefit, bIndex) => (
                 <div key={bIndex} className="flex gap-3">
                   <div className="flex-1 relative">
                     <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                     <input
                       type="text"
                       value={benefit}
                       onChange={(e) => handleBenefitChange(activeTierIndex, bIndex, e.target.value)}
                       className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-900"
                       placeholder="Describe a benefit..."
                     />
                   </div>
                   <button 
                     onClick={() => removeBenefit(activeTierIndex, bIndex)}
                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button
                 onClick={() => addBenefit(activeTierIndex)}
                 className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"
               >
                 <Plus className="w-4 h-4" />
                 Add Benefit
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={() => onSave(tiers)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ad46ff] to-[#f6339a] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving Changes...' : 'Save All Plans'}
        </button>
      </div>
    </div>
  );
}
