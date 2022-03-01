import { FaCircle, FaShip } from 'react-icons/fa'

const Tradelane = () => {
  const events = [
    {
      _id: 1,
      title: 'Mombasa Port',
      date: '16 Feb',
      time: '18:00',
      type: 'Departs from',
      ref: 'Ocean',
      description: 'MAERSK UTAH',
    },
    {
      _id: 2,
      title: 'Mogadishu Port',
      date: '18 Jun',
      time: '10:00',
      type: 'Arrives at',
      ref: 'Ocean',
      description: 'Mogadishu Port Terminal',
    },
    {
      _id: 3,
      title: 'Mombasa Port',
      date: '16 Feb',
      time: '18:00',
      type: 'Departs from',
      ref: 'Ocean',
      description: 'MAERSK UTAH',
    },
    {
      _id: 4,
      title: 'Mogadishu Port',
      date: '18 Jun',
      time: '10:00',
      type: 'Arrives at',
      ref: 'Ocean',
      description: 'Mogadishu Port Terminal',
    },
  ]
  return (
    <div className='timeline'>
      {events.map((event) => (
        <div
          key={event._id}
          className='card font-monospace bg-transparent border-0 '
        >
          <div className='card-body'>
            <div className='row' style={{ marginBottom: '-32px' }}>
              <div className='col-3 text-end'>
                <div className='left'>
                  <h6 className='fw-light text-muted'>{event.date}</h6>
                  <h6 className='fw-light text-muted'>{event.time}</h6>
                </div>
              </div>
              <div className='col-9 border border-success border-bottom-0 border-end-0 border-top-0 pb-4'>
                <div className='right'>
                  <h6 className='card-title fw-light'>{event.type}</h6>
                  <div className='position-relative'>
                    <FaCircle
                      className={`border border-success rounded-pill position-absolute mt-2 ${
                        event.isActiveLocation ? 'text-success' : 'text-light'
                      }`}
                      style={{ marginLeft: '-20' }}
                    />
                  </div>
                  <h1 className='card-title fs-4'>{event.title}</h1>
                  <div className='card-text'>
                    <h6 className='fw-light'>
                      <FaShip className='mb-1' /> {event.ref}
                    </h6>
                    <h6 className='fw-light'>{event.description}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Tradelane
