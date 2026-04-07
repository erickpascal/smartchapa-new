'use client'
import { useState } from 'react'

type Screen = 'login' | 'home' | 'trips' | 'seats' | 'payment' | 'tracking' | 'driver' | 'operator' | 'admin'

export default function PreviewPage() {
  const [screen, setScreen] = useState<Screen>('login')
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<'mpesa' | 'emola' | 'wallet'>('mpesa')

  const nav = (s: Screen) => setScreen(s)

  const screens: { id: Screen; label: string; icon: string }[] = [
    { id: 'login',    label: 'Login',     icon: '🔐' },
    { id: 'home',     label: 'Home',      icon: '🏠' },
    { id: 'trips',    label: 'Viagens',   icon: '🚌' },
    { id: 'seats',    label: 'Assentos',  icon: '💺' },
    { id: 'payment',  label: 'Pagamento', icon: '💳' },
    { id: 'tracking', label: 'Tracking',  icon: '📍' },
    { id: 'driver',   label: 'Capitão', icon: '🚗' },
    { id: 'operator', label: 'Operador',  icon: '📊' },
    { id: 'admin',    label: 'Admin',     icon: '🔑' },
  ]

  const takenSeats = [1, 2, 5, 8, 11, 13]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚌</span>
          <h1 className="text-[18px] font-bold text-gray-900">SmartChapa Preview</h1>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">DEV</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {screens.map((s) => (
            <button
              key={s.id}
              onClick={() => nav(s.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                screen === s.id
                  ? 'bg-[#1A6B3C] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-gray-800" style={{minHeight: 680}}>

        {/* ── LOGIN ── */}
        {screen === 'login' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50 items-center justify-center px-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1A6B3C] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🚌</div>
              <h1 className="text-[26px] font-bold text-gray-900">SmartChapa</h1>
              <p className="text-gray-400 text-[13px] mt-1">O seu transporte, digitalizado.</p>
            </div>
            <div className="w-full bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900">Entrar</h2>
                <p className="text-gray-400 text-[13px]">Aceda à sua conta para continuar.</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-[13px] border-r border-gray-200">🇲🇿 +258</span>
                <input type="tel" placeholder="84 000 0000" className="flex-1 px-3 py-3 text-[15px] outline-none" />
              </div>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none" />
              <button onClick={() => nav('home')} className="w-full bg-[#1A6B3C] text-white font-semibold py-3.5 rounded-xl text-[16px]">
                Entrar →
              </button>
              <p className="text-center text-[13px] text-gray-500">
                Não tem conta? <span className="text-[#1A6B3C] font-semibold">Criar conta</span>
              </p>
            </div>
            <div className="mt-4 w-full bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-800 text-[11px] font-semibold mb-2">🔧 Acesso rápido</p>
              <div className="grid grid-cols-2 gap-2">
                {[{l:'👤 Passageiro',s:'home'},{l:'🚌 Capitão',s:'driver'},{l:'📊 Operador',s:'operator'},{l:'🔑 Admin',s:'admin'}].map((b) => (
                  <button key={b.s} onClick={() => nav(b.s as Screen)} className="bg-white border border-amber-200 text-amber-800 text-[11px] font-medium py-1.5 rounded-lg">
                    {b.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HOME ── */}
        {screen === 'home' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50">
            <div className="bg-[#0D4A2B] px-4 pt-10 pb-6">
              <p className="text-[#A8D5B8] text-[13px]">Bom dia, Ana!</p>
              <h1 className="text-white text-[20px] font-bold mt-0.5 mb-4">Para onde vai hoje?</h1>
              <div className="flex items-center gap-3 bg-white/15 rounded-2xl px-4 py-3">
                <span className="text-white/60 text-[16px]">🔍</span>
                <span className="text-white/50 text-[14px]">Pesquisar rota ou paragem...</span>
              </div>
            </div>
            <div className="px-4 pt-3 pb-2">
              <div className="flex gap-2">
                {['Todos','Chapa','Metro Bus','Expresso'].map((c,i) => (
                  <span key={c} className={`px-3 py-1 rounded-full text-[12px] font-medium ${i===0?'bg-[#1A6B3C] text-white':'bg-white text-gray-600 border border-gray-200'}`}>{c}</span>
                ))}
              </div>
            </div>
            <div className="px-4 space-y-3 pb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rotas disponíveis</p>
              {[
                {name:'Baixa → Museu', seats:12, time:'8 min', fare:15, cat:'chapa'},
                {name:'Machava → Julius Nyerere', seats:8, time:'12 min', fare:25, cat:'chapa'},
                {name:'Costa do Sol → Praça', seats:0, time:'35 min', fare:30, cat:'chapa'},
                {name:'Benfica → Baixa', seats:6, time:'20 min', fare:20, cat:'metro'},
                {name:'Zimpeto → J. Nyerere', seats:14, time:'5 min', fare:25, cat:'expresso'},
              ].map((r) => (
                <button key={r.name} onClick={() => nav('trips')} className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-[14px]">{r.name}</p>
                      <p className="text-gray-400 text-[12px] mt-0.5">{r.time} · {r.seats > 0 ? `${r.seats} assentos` : 'Lotado'}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${r.cat==='metro'?'bg-blue-50 text-blue-700':r.cat==='expresso'?'bg-amber-50 text-amber-700':'bg-[#E8F4ED] text-[#0D4A2B]'}`}>{r.cat}</span>
                    </div>
                    <div>
                      {r.seats > 0
                        ? <span className="font-bold text-[#1A6B3C] text-[16px]">{r.fare} MT</span>
                        : <span className="bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-1 rounded-lg">LOTADO</span>
                      }
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-auto flex bg-white border-t border-gray-100">
              {[['🏠','Início'],['🗺️','Mapa'],['📋','Reservas'],['👤','Perfil']].map(([icon,label]) => (
                <div key={label} className={`flex-1 flex flex-col items-center py-2 text-[10px] ${label==='Início'?'text-[#1A6B3C]':'text-gray-400'}`}>
                  <span className="text-[18px]">{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRIPS ── */}
        {screen === 'trips' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50">
            <div className="bg-[#1A6B3C] px-4 py-4 flex items-center gap-3">
              <button onClick={() => nav('home')} className="text-white text-[20px]">←</button>
              <span className="text-white font-semibold text-[17px]">Baixa → Museu</span>
            </div>
            <div className="px-4 pt-4 space-y-3 pb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Paragens</p>
                <div className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-500">📍 Praça dos Trabalhadores</div>
                <div className="border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-500">🏁 Paragem do Museu</div>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Próximas chapas</p>
              {[
                {time:'09:52 → 10:07', driver:'António J.', rating:4, plate:'MZ-10-3421', seats:12, selected:true},
                {time:'10:15 → 10:30', driver:'José M.', rating:5, plate:'MZ-10-5809', seats:8, selected:false},
                {time:'10:45 → 11:00', driver:'Maria S.', rating:4, plate:'MZ-10-2233', seats:14, selected:false},
              ].map((t) => (
                <button key={t.time} onClick={() => nav('seats')} className={`w-full text-left rounded-xl p-4 ${t.selected?'border-2 border-[#1A6B3C] bg-[#E8F4ED]':'border border-gray-100 bg-white'}`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-[15px]">{t.time}</p>
                      <p className="text-gray-500 text-[12px] mt-0.5">{t.driver} · {'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</p>
                      <p className="font-mono text-[11px] text-gray-400">{t.plate} · {t.seats} livres</p>
                    </div>
                    <span className="font-bold text-[#1A6B3C] text-[16px]">15 MT</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 mt-auto">
              <button onClick={() => nav('seats')} className="w-full bg-[#1A6B3C] text-white font-semibold py-4 rounded-xl text-[16px]">Reservar agora →</button>
            </div>
          </div>
        )}

        {/* ── SEATS ── */}
        {screen === 'seats' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50">
            <div className="bg-[#1A6B3C] px-4 py-4 flex items-center gap-3">
              <button onClick={() => nav('trips')} className="text-white text-[20px]">←</button>
              <span className="text-white font-semibold text-[17px]">Escolher assento</span>
            </div>
            <div className="px-4 pt-5">
              <p className="text-center text-[12px] text-gray-400 mb-4">MZ-10-3421 · 14 assentos</p>
              <div className="text-center text-[11px] text-gray-400 mb-2 uppercase tracking-wider">Frente do chapa</div>
              <div className="flex justify-start mb-2">
                <div className="w-[calc(50%-8px)] h-9 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-[11px] text-gray-400">Capitão</div>
              </div>
              <div className="grid gap-2" style={{gridTemplateColumns:'1fr 1fr 20px 1fr 1fr'}}>
                {Array.from({length:14},(_,i)=>i+1).map((seat) => {
                  const col = (seat-1) % 4
                  const taken = takenSeats.includes(seat)
                  const selected = selectedSeat === seat
                  return (
                    <>
                      {col === 2 && <div key={`a${seat}`} className="border-l border-dashed border-gray-200"/>}
                      <button
                        key={seat}
                        disabled={taken}
                        onClick={() => setSelectedSeat(seat)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[13px] font-semibold ${
                          taken ? 'border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                          : selected ? 'border-2 border-[#F5A623] bg-[#FFF8E7] text-[#F5A623]'
                          : 'border-2 border-[#1A6B3C] bg-white text-[#1A6B3C]'
                        }`}
                      >{selected ? '✓' : seat}</button>
                    </>
                  )
                })}
              </div>
              <div className="flex gap-4 justify-center mt-4 text-[11px] text-gray-500">
                <span><span className="inline-block w-3 h-3 rounded border-2 border-[#1A6B3C] mr-1"/>Livre</span>
                <span><span className="inline-block w-3 h-3 rounded border border-gray-300 bg-gray-100 mr-1"/>Ocupado</span>
                <span><span className="inline-block w-3 h-3 rounded border-2 border-[#F5A623] bg-[#FFF8E7] mr-1"/>Selecionado</span>
              </div>
            </div>
            <div className="px-4 mt-auto pb-4 pt-4">
              <div className="bg-white rounded-xl px-4 py-3 mb-3 flex justify-between border border-gray-100">
                <span className="text-[13px] text-gray-600">{selectedSeat ? `Assento ${selectedSeat} selecionado` : 'Selecione um assento'}</span>
                <span className="font-bold text-[#1A6B3C]">15 MT</span>
              </div>
              <button onClick={() => nav('payment')} disabled={!selectedSeat} className="w-full bg-[#1A6B3C] disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl text-[16px]">Confirmar reserva →</button>
            </div>
          </div>
        )}

        {/* ── PAYMENT ── */}
        {screen === 'payment' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50">
            <div className="bg-[#1A6B3C] px-4 py-4 flex items-center gap-3">
              <button onClick={() => nav('seats')} className="text-white text-[20px]">←</button>
              <span className="text-white font-semibold text-[17px]">Pagamento</span>
            </div>
            <div className="px-4 pt-5 space-y-4">
              <div className="bg-[#E8F4ED] rounded-2xl p-5 text-center">
                <p className="text-[36px] font-bold text-[#0D4A2B]">15 MT</p>
                <p className="text-[#1A6B3C] text-[13px] mt-1">Baixa → Museu · Assento {selectedSeat ?? 6} · 09:52</p>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Escolher método</p>
              {([
                {id:'mpesa', logo:'M', bg:'bg-[#E31E24]', label:'M-Pesa', sub:'+258 84 *** 4521'},
                {id:'emola', logo:'e', bg:'bg-[#FF6B00]', label:'eMola', sub:'+258 86 *** 2201'},
                {id:'wallet', logo:'💚', bg:'bg-[#1A6B3C]', label:'Carteira SmartChapa', sub:'Saldo: 150 MT'},
              ] as const).map((p) => (
                <button key={p.id} onClick={() => setSelectedPayment(p.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${selectedPayment===p.id?'border-2 border-[#1A6B3C] bg-[#E8F4ED]':'border border-gray-200 bg-white'}`}>
                  <div className={`w-10 h-10 rounded-full ${p.bg} flex items-center justify-center text-white font-bold text-[14px]`}>{p.logo}</div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 text-[14px]">{p.label}</p>
                    <p className="text-gray-400 text-[12px]">{p.sub}</p>
                  </div>
                  {selectedPayment===p.id && <span className="text-[#1A6B3C] text-[18px]">✓</span>}
                </button>
              ))}
            </div>
            <div className="px-4 mt-auto pb-4 pt-4">
              <button onClick={() => nav('tracking')} className="w-full bg-[#1A6B3C] text-white font-semibold py-4 rounded-xl text-[16px]">
                Pagar 15 MT via {selectedPayment==='mpesa'?'M-Pesa':selectedPayment==='emola'?'eMola':'Carteira'} →
              </button>
              <p className="text-center text-[12px] text-gray-400 mt-2">Receberá um PIN no seu telemóvel</p>
            </div>
          </div>
        )}

        {/* ── TRACKING ── */}
        {screen === 'tracking' && (
          <div className="flex flex-col min-h-[680px]">
            <div className="bg-[#C8E0CC] h-52 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-[#1A6B3C] font-semibold text-[14px]">Mapa ao vivo</p>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#F5A623] text-white text-[12px] font-bold px-3 py-1 rounded-lg">🚌 3 min</div>
              </div>
            </div>
            <div className="bg-white flex-1 px-4 pt-4 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F4ED] flex items-center justify-center text-[#1A6B3C] font-bold">AJ</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">António Joaquim</p>
                  <p className="text-[#F5A623]">★★★★☆</p>
                </div>
                <p className="font-mono text-[12px] text-gray-400">MZ-10-3421</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['3 min','Chegada'],['1.2 km','Distância'],['10:07','Destino']].map(([v,l]) => (
                  <div key={l} className="bg-[#E8F4ED] rounded-xl p-3 text-center">
                    <p className="font-semibold text-[#0D4A2B] text-[14px]">{v}</p>
                    <p className="text-[11px] text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#E8F4ED] rounded-xl px-4 py-3 flex items-center gap-2">
                <span>✅</span>
                <p className="text-[#0D4A2B] text-[13px] font-medium">Pagamento confirmado · Assento {selectedSeat ?? 6}</p>
              </div>
              <button className="w-full border-2 border-[#1A6B3C] text-[#1A6B3C] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-[14px]">
                📞 Ligar ao capitão
              </button>
            </div>
            <div className="fixed bottom-20 right-6">
              <button className="w-14 h-14 rounded-full bg-[#D32F2F] text-white font-bold text-[13px] shadow-lg">SOS</button>
            </div>
          </div>
        )}

        {/* ── DRIVER ── */}
        {screen === 'driver' && (
          <div className="flex flex-col min-h-[680px]">
            <div className="bg-[#0D4A2B] px-4 pt-10 pb-6">
              <p className="text-[#A8D5B8] text-[13px]">Bom dia, António!</p>
              <p className="text-white text-[20px] font-bold mb-4">Painel do capitão</p>
              <div className="grid grid-cols-3 gap-2">
                {[['3','Viagens'],['47','Passageiros'],['705 MT','Ganhos']].map(([v,l],i) => (
                  <div key={l} className={`rounded-xl px-3 py-2 text-center ${i===2?'bg-[#F5A623]/20 border border-[#F5A623]/40':'bg-white/10'}`}>
                    <p className={`font-bold text-[16px] ${i===2?'text-[#F5A623]':'text-white'}`}>{v}</p>
                    <p className="text-white/60 text-[11px]">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 pt-4 space-y-3 flex-1">
              <div className="bg-white border-l-4 border-[#1A6B3C] rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Baixa → Museu</p>
                    <p className="text-gray-400 text-[13px]">Partida: 09:52 · 14 reservas</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-[#E8F4ED] text-[#0D4A2B] text-[11px] font-semibold px-2 py-0.5 rounded-full">14/14</span>
                    <p className="font-mono text-[11px] text-gray-400 mt-1">MZ-10-3421</p>
                  </div>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {[['en_route','Em rota'],['at_stop','Na paragem'],['completed','Concluída']].map(([v,l],i) => (
                    <div key={v} className={`flex-1 py-2.5 text-center text-[12px] font-medium ${i!==0?'border-l border-gray-200':''} ${i===0?'bg-[#1A6B3C] text-white':'bg-white text-gray-500'}`}>{l}</div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="border border-[#1A6B3C] text-[#1A6B3C] font-semibold py-2.5 rounded-xl text-[13px]">👥 Manifesto</button>
                  <button className="bg-[#1A6B3C] text-white font-semibold py-2.5 rounded-xl text-[13px]">🧭 Navegar</button>
                </div>
              </div>
            </div>
            <div className="flex bg-white border-t border-gray-100 mt-auto">
              {[['🏠','Início'],['👥','Manifesto'],['💰','Ganhos'],['👤','Perfil']].map(([icon,label]) => (
                <div key={label} className={`flex-1 flex flex-col items-center py-2 text-[10px] ${label==='Início'?'text-[#1A6B3C]':'text-gray-400'}`}>
                  <span className="text-[18px]">{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OPERATOR ── */}
        {screen === 'operator' && (
          <div className="flex flex-col min-h-[680px] bg-gray-50">
            <div className="bg-[#0D4A2B] px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">SmartChapa</span>
                <span className="ml-2 bg-green-500/30 text-green-300 text-[11px] px-2 py-0.5 rounded-full">● Ao vivo</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-[12px]">JM</div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {[['24','Chapas activos','bg-[#E8F4ED] text-[#0D4A2B]'],['1,847','Passageiros','bg-blue-50 text-blue-900'],['35,420 MT','Receita hoje','bg-[#FFF8E7] text-amber-900'],['4.6 ★','Avaliação média','bg-purple-50 text-purple-900']].map(([v,l,cls]) => (
                <div key={l} className={`rounded-2xl p-4 ${cls}`}>
                  <p className="text-[24px] font-bold">{v}</p>
                  <p className="text-[12px] opacity-60 mt-1">{l}</p>
                </div>
              ))}
            </div>
            <div className="px-4">
              <p className="font-semibold text-gray-900 text-[14px] mb-3">Frota ao vivo</p>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {[
                  {dot:'bg-[#1A6B3C]',plate:'MZ-10-3421',driver:'António J.',status:'Em rota',badge:'bg-[#E8F4ED] text-[#0D4A2B]'},
                  {dot:'bg-[#1A6B3C]',plate:'MZ-10-5809',driver:'José M.',status:'Em rota',badge:'bg-[#E8F4ED] text-[#0D4A2B]'},
                  {dot:'bg-[#F5A623]',plate:'MZ-10-2201',driver:'Pedro C.',status:'Na paragem',badge:'bg-[#FFF8E7] text-amber-800'},
                  {dot:'bg-[#D32F2F]',plate:'MZ-10-8821',driver:'Clara N.',status:'Offline',badge:'bg-red-50 text-red-700'},
                ].map((v) => (
                  <div key={v.plate} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`}/>
                    <span className="font-mono text-[12px] text-gray-700 w-24">{v.plate}</span>
                    <span className="text-[12px] text-gray-600 flex-1">{v.driver}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${v.badge}`}>{v.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN ── */}
        {screen === 'admin' && (
          <div className="flex flex-col min-h-[680px]">
            <div className="bg-[#1A237E] px-4 py-3 flex items-center justify-between">
              <span className="text-white font-bold">SmartChapa Admin</span>
              <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
            <div className="flex flex-1">
              <div className="w-36 bg-white border-r border-gray-100 p-3 space-y-1 shrink-0">
                {[['👥','Utilizadores',true],['📋','Reservas',false],['🛣️','Rotas',false],['✅','Aprovações',true],['📊','Relatórios',false]].map(([icon,label,active]) => (
                  <div key={String(label)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] ${active?'bg-[#E8F4ED] text-[#0D4A2B] font-medium':'text-gray-500'}`}>
                    <span>{icon}</span>{label}
                    {label==='Aprovações' && <span className="ml-auto bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">3</span>}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 space-y-3">
                <p className="font-bold text-gray-900 text-[15px]">Aprovação de capitães</p>
                {[{name:'Manuel Cossa',date:'há 2 dias'},{name:'Sofia Nhantumbo',date:'há 3 dias'}].map((d) => (
                  <div key={d.name} className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full bg-[#E8F4ED] flex items-center justify-center text-[#1A6B3C] font-bold text-[12px]">
                        {d.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-[13px]">{d.name}</p>
                        <p className="text-gray-400 text-[11px]">Reg. {d.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      <span className="text-[10px] bg-[#E8F4ED] text-[#0D4A2B] px-2 py-0.5 rounded-full">✓ Carta válida</span>
                      <span className="text-[10px] bg-[#E8F4ED] text-[#0D4A2B] px-2 py-0.5 rounded-full">✓ Registo veículo</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#1A6B3C] text-white text-[12px] font-semibold py-2 rounded-lg">✓ Aprovar</button>
                      <button className="flex-1 border border-[#D32F2F] text-[#D32F2F] text-[12px] font-semibold py-2 rounded-lg">✕ Rejeitar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
