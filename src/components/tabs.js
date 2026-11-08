import { House, LayoutGrid, Printer, Gamepad2, Package, Rocket, Target } from 'lucide-react'

export const tabs = [
  { id: 'overview', label: 'Overview', icon: House },
  { id: 'launch', label: 'Launch', icon: Rocket },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'apps', label: 'Apps', icon: LayoutGrid },
  { id: 'printing', label: '3D Printing', icon: Printer },
  { id: 'roblox', label: 'Roblox', icon: Gamepad2 },
  { id: 'products', label: 'Products', icon: Package },
]
