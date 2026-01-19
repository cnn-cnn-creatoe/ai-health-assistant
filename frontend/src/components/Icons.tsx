import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardPlus,
  FileText,
  HeartPulse,
  MessagesSquare,
  Pill,
  Search,
  Stethoscope,
  ThermometerSun,
  BarChart3,
} from 'lucide-react'

type IconProps = { className?: string }

const wrap =
  (IconComp: React.ComponentType<IconProps>) =>
  ({ className = 'w-5 h-5' }: IconProps) =>
    <IconComp className={className} />

// 通用 UI 图标
export const ArrowRightIcon = wrap(ArrowRight)
export const SearchIcon = wrap(Search)
export const CheckIcon = wrap(Check)
export const AlertIcon = wrap(AlertTriangle)

// 医疗/健康相关
export const ActivityIcon = wrap(Activity)
export const HeartIcon = wrap(HeartPulse)
export const RecordsIcon = wrap(FileText)
export const CalendarIcon = wrap(CalendarDays)
export const ChatIcon = wrap(MessagesSquare)
export const DoctorIcon = wrap(Stethoscope)
export const PillIcon = wrap(Pill)
export const TemperatureIcon = wrap(ThermometerSun)
export const ReportAddIcon = wrap(ClipboardPlus)
export const ChartIcon = wrap(BarChart3)
