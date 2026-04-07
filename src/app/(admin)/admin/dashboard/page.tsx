'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  ClipboardList,
  Route,
  ShieldCheck,
  BarChart2,
  Settings,
  Check,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'passenger' | 'driver' | 'operator' | 'admin'
type UserStatus = 'active' | 'suspended' | 'pending'
type DocStatus = 'pending' | 'approved' | 'rejected'

interface AdminUser {
  id: string
  name: string
  phone: string
  role: UserRole
  status: UserStatus
  created_at: string
}

interface PendingDriver {
  id: string
  name: string
  phone: string
  created_at: string
  documents: {
    id: string
    doc_type: string
    file_url: string
    status: DocStatus
  }[]
}

interface AdminData {
  pending_drivers: PendingDriver[]
  users: AdminUser[]
  total_users: number
  pending_count: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchAdminData(params: {
  search: string
  role: string
}): Promise<AdminData> {
  try {
    const qs = new URLSearchParams({ search: params.search, role: params.role }).toString()
    const res = await fetch(`/api/admin/users?${qs}`)
    if (!res.ok) throw new Error('failed')
    return await res.json()
  } catch {
    return {
      pending_drivers: [
        {
          id: 'mock-1',
          name: 'Manuel Cossa',
          phone: '+258841234567',
          created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
          documents: [
            { id: 'd1', doc_type: 'licence',              file_url: '', status: 'pending' },
            { id: 'd2', doc_type: 'vehicle_registration', file_url: '', status: 'pending' },
          ],
        },
        {
          id: 'mock-2',
          name: 'Sofia Nhantumbo',
          phone: '+258869876543',
          created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
          documents: [
            { id: 'd3', doc_type: 'licence', file_url: '', status: 'pending' },
          ],
        },
      ],
      users: [
        { id: 'u1', name: 'Ana Matola',     phone: '+258841111111', role: 'passenger', status: 'active',    created_at: new Date().toISOString() },
        { id: 'u2', name: 'António Joaquim',phone: '+258842222222', role: 'driver',    status: 'active',    created_at: new Date().toISOString() },
        { id: 'u3', name: 'João Machava',   phone: '+258843333333', role: 'operator',  status: 'active',    created_at: new Date().toISOString() },
        { id: 'u4', name: 'Carlos Tembe',   phone: '+258844444444', role: 'passenger', status: 'suspended', created_at: new Date().toISOString() },
      ],
      total_users: 4,
      pending_count: 2,
    }
  }
}

async function updateUserStatus(payload: {
  userId: string
  action: 'activate' | 'suspend'
}): Promise<void> {
  const res = await fetch(`/api/admin/users/${payload.userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: payload.action }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar utilizador')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  passenger: { label: 'Passageiro',    className: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  driver:    { label: 'Capitão',       className: 'bg-blue-50 text-blue-800' },
  operator:  { label: 'Operador',      className: 'bg-[#FFF8E7] text-amber-800' },
  admin:     { label: 'Administrador', className: 'bg-purple-50 text-purple-800' },
}

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  active:    { label: 'Activo',    className: 'bg-[#E8F4ED] text-[#0D4A2B]' },
  suspended: { label: 'Suspenso',  className: 'bg-red-50 text-red-700' },
  pending:   { label: 'Pendente',  className: 'bg-[#FFF8E7] text-amber-800' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const docTypeLabels: Record<string, string> = {
  licence: 'Carta de condução',
  vehicle_registration: 'Registo do veículo',
  id_card: 'BI / Documento de identidade',
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

type Tab = 'users' | 'approvals' | 'routes' | 'reports' | 'settings'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  tab: Tab
  badge?: number
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, badge, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors relative ${
        active
          ? 'bg-[#E8F4ED] text-[#0D4A2B]'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-[#D32F2F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { setUser } = useUserStore()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('approvals')

  const handleLogout = async () => {
    document.cookie = 'smartchapa_guest_role=;path=/;max-age=0'
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<AdminData>({
    queryKey: ['admin-data', search, roleFilter],
    queryFn: () => fetchAdminData({ search, role: roleFilter }),
    refetchInterval: 30_000,
  })

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] })
    },
  })

  const pendingDrivers: PendingDriver[] = data?.pending_drivers ?? []
  const users: AdminUser[] = data?.users ?? []
  const pendingCount = data?.pending_count ?? 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <nav className="bg-[#1A237E] px-6 py-4 flex items-center justify-between shrink-0">
        <span className="text-white font-bold text-[18px]">SmartChapa Admin</span>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 text-white text-[12px] font-medium px-3 py-1 rounded-full">
            Super Admin
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-100 p-4 shrink-0 space-y-1">
          <NavItem
            icon={<Users size={18} />}
            label="Utilizadores"
            tab="users"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <NavItem
            icon={<ClipboardList size={18} />}
            label="Reservas"
            tab="approvals"
            active={false}
            onClick={() => {}}
          />
          <NavItem
            icon={<Route size={18} />}
            label="Rotas"
            tab="routes"
            active={false}
            onClick={() => {}}
          />
          <NavItem
            icon={<ShieldCheck size={18} />}
            label="Aprovações"
            tab="approvals"
            badge={pendingCount}
            active={activeTab === 'approvals'}
            onClick={() => setActiveTab('approvals')}
          />
          <NavItem
            icon={<BarChart2 size={18} />}
            label="Relatórios"
            tab="reports"
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          />
          <NavItem
            icon={<Settings size={18} />}
            label="Configurações"
            tab="settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">

          {/* ── Approvals tab ────────────────────────────────────────────── */}
          {activeTab === 'approvals' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-[20px] font-bold text-gray-900">
                  Aprovação de capitães
                </h1>
                {pendingCount > 0 && (
                  <span className="bg-[#FFF8E7] text-amber-800 text-[13px] font-semibold px-3 py-1 rounded-full border border-amber-200">
                    {pendingCount} aguardando
                  </span>
                )}
              </div>

              {isLoading && (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#1A237E] animate-spin" />
                </div>
              )}

              {!isLoading && pendingDrivers.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <ShieldCheck size={40} className="mx-auto text-[#1A6B3C] mb-3 opacity-50" />
                  <p className="font-medium text-gray-600">Sem aprovações pendentes</p>
                  <p className="text-gray-400 text-[13px] mt-1">Todos os capitães foram processados.</p>
                </div>
              )}

              <div className="space-y-4">
                {pendingDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-[#E8F4ED] flex items-center justify-center text-[#1A6B3C] font-bold text-[15px] shrink-0">
                        {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-[15px]">{driver.name}</p>
                        <p className="text-gray-400 text-[13px]">
                          {driver.phone} · Reg. {formatDate(driver.created_at)}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {driver.documents.map((doc) => (
                            <span
                              key={doc.id}
                              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8F4ED] text-[#0D4A2B]"
                            >
                              ✓ {docTypeLabels[doc.doc_type] ?? doc.doc_type}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          disabled={isPending}
                          onClick={() =>
                            changeStatus({ userId: driver.id, action: 'activate' })
                          }
                          className="flex items-center gap-1.5 bg-[#1A6B3C] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#155a32] disabled:opacity-50 transition-colors"
                        >
                          <Check size={15} />
                          Aprovar
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => setRejectingId(driver.id)}
                          className="flex items-center gap-1.5 border-2 border-[#D32F2F] text-[#D32F2F] text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <X size={15} />
                          Rejeitar
                        </button>
                      </div>
                    </div>

                    {/* Reject reason input */}
                    {rejectingId === driver.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                        <input
                          type="text"
                          placeholder="Motivo da rejeição..."
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#D32F2F]"
                        />
                        <button
                          onClick={() => {
                            changeStatus({ userId: driver.id, action: 'suspend' })
                            setRejectingId(null)
                          }}
                          className="bg-[#D32F2F] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="text-gray-400 text-[13px] px-3"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Users tab ────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <h1 className="text-[20px] font-bold text-gray-900">
                Gestão de utilizadores
              </h1>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Pesquisar nome ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1A237E]"
                />
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] pr-9 outline-none focus:border-[#1A237E] bg-white"
                  >
                    <option value="all">Todos os papéis</option>
                    <option value="passenger">Passageiros</option>
                    <option value="driver">Capitães</option>
                    <option value="operator">Operadores</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
                <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 text-[12px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <span className="col-span-2">Nome</span>
                  <span>Papel</span>
                  <span>Estado</span>
                  <span className="text-right">Ações</span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-7 h-7 rounded-full border-4 border-gray-100 border-t-[#1A237E] animate-spin" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-[14px]">
                    Nenhum utilizador encontrado
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const role = roleConfig[u.role] ?? roleConfig.passenger
                      const status = statusConfig[u.status] ?? statusConfig.active
                      return (
                        <div
                          key={u.id}
                          className="grid grid-cols-5 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="col-span-2">
                            <p className="font-medium text-gray-900 text-[14px]">{u.name}</p>
                            <p className="text-gray-400 text-[12px]">{u.phone}</p>
                          </div>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${role.className}`}>
                            {role.label}
                          </span>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${status.className}`}>
                            {status.label}
                          </span>
                          <div className="flex justify-end">
                            <button
                              disabled={isPending}
                              onClick={() =>
                                changeStatus({
                                  userId: u.id,
                                  action: u.status === 'active' ? 'suspend' : 'activate',
                                })
                              }
                              className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                                u.status === 'active'
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-[#1A6B3C] text-[#1A6B3C] hover:bg-[#E8F4ED]'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspender' : 'Reativar'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Other tabs placeholder ───────────────────────────────────── */}
          {activeTab !== 'users' && activeTab !== 'approvals' && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Settings size={36} className="mb-3 opacity-30" />
              <p className="text-[15px] font-medium">Em construção</p>
              <p className="text-[13px] mt-1">Esta secção será adicionada em breve.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
