"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Calendar, Percent, IndianRupee, Copy, RefreshCw } from "lucide-react";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minRideAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    maxUsageLimit: "",
  });

  const fetchPromos = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/promos");
    const d = await res.json();
    if (d.success) setPromos(d.promos);
    setLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/promo/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        discountValue: Number(formData.discountValue),
        minRideAmount: formData.minRideAmount ? Number(formData.minRideAmount) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
        maxUsageLimit: formData.maxUsageLimit ? Number(formData.maxUsageLimit) : 1000,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      fetchPromos();
    } else {
      const d = await res.json();
      alert(d.error || "Failed to create promo");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Promo Codes</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage promotional campaigns and discounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> New Promo Code
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw size={24} className="text-slate-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map(promo => (
            <div key={promo._id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                  <span className="text-indigo-400 font-black tracking-widest uppercase text-sm">{promo.code}</span>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {promo.status}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4 h-10">{promo.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950 rounded-xl p-3 border border-white/5">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Tag size={12}/> Discount</p>
                  <p className="text-white font-bold">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-white/5">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={12}/> Expiry</p>
                  <p className="text-white font-bold text-sm">{new Date(promo.validUntil).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Uses: {promo.currentUsageCount} / {promo.maxUsageLimit}</span>
                {promo.maxDiscount > 0 && <span>Max Cap: ₹{promo.maxDiscount}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Create Promo Code</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">CODE</label>
                  <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase" placeholder="SUMMER50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">DISCOUNT TYPE</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white">
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">DESCRIPTION</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white" placeholder="50% off on all rides" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">DISCOUNT VALUE</label>
                  <input required type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white" placeholder={formData.discountType === 'percentage' ? '50' : '100'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">MAX DISCOUNT (₹)</label>
                  <input type="number" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white" placeholder="e.g. 150" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">VALID FROM</label>
                  <input required type="datetime-local" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">VALID UNTIL</label>
                  <input required type="datetime-local" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                Publish Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
