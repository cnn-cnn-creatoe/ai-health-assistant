import { Phone } from 'lucide-react'
import { Button } from './ui'
import { readProfile } from '../services/profileStore'

interface EmergencyButtonProps {
  variant?: 'primary' | 'danger'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function EmergencyButton({ variant = 'danger', size = 'md', showLabel = true }: EmergencyButtonProps) {
  const profile = readProfile()

  const handleEmergencyCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant={variant}
          size={size}
          onClick={() => handleEmergencyCall('120')}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          {showLabel && '120 急救'}
        </Button>
        {profile.emergencyContactPhone && (
          <Button
            variant="secondary"
            size={size}
            onClick={() => handleEmergencyCall(profile.emergencyContactPhone)}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            {showLabel && (profile.emergencyContactName || '紧急联系人')}
          </Button>
        )}
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          紧急情况请立即拨打急救电话或联系紧急联系人
        </p>
      )}
    </div>
  )
}
