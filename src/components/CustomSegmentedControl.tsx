import { SegmentedControl } from '@mantine/core'
import { mainColor, subColor_lighter, subColor_medium } from './styledComponent'

export default function CustomSegmentedControl({
  value,
  onChange,
  data,
  size = 20,
}: {
  value?: string
  onChange?: any
  data?: any
  size?: number
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      color={'gray'}
      data={data}
      styles={() => ({
        root: {
          backgroundColor: 'white',
          padding: `${size * 0.5}px`,
        },
        label: {
          border: `0.5px solid ${subColor_medium}`,
          padding: `${size * 0.5}px`,
          paddingRight: `${size}px`,
          paddingLeft: `${size}px`,
          fontSize: `${size * 0.65}px`,
          color: `${mainColor}`,
          fontWeight: 'normal',
        },
        labelActive: {
          backgroundColor: `${mainColor}`,
          padding: `${size * 0.5}px`,
          paddingRight: `${size}px`,
          paddingLeft: `${size}px`,
          fontSize: '${size * 0.65}px',
          color: `${subColor_lighter} !important`,
          fontWeight: 'normal',
        },
        control: {
          borderWidth: '0px !important',
          paddingRight: `${size * 0.5}px`,
          paddingLeft: `${size * 0.5}px`,
        },
        active: { backgroundColor: 'white', padding: `${size * 0.5}px` },
      })}
      transitionDuration={0}
    />
  )
}
