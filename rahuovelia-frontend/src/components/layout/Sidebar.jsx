import SidebarContent from './SidebarContent'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-ink-950 lg:flex">
      <SidebarContent layoutIdPrefix="sidebar-active" />
    </aside>
  )
}
