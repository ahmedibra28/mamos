import LoadingIcons from 'react-loading-icons'

export const Spinner = (props) => {
  const { height = '3em', stroke = '#f9c212' } = props
  return (
    <div className='text-center'>
      <LoadingIcons.ThreeDots
        stroke={stroke}
        height={height}
        fill='transparent'
      />
      <p style={{ color: '#f9c212' }}>Loading...</p>
    </div>
  )
}
