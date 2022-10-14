// import moment from 'moment'
import dynamic from 'next/dynamic'
import FormContainer from '../components/FormContainer'
// import Link from 'next/link'
// import { FaCircle, FaDownload } from 'react-icons/fa'
import withAuth from '../HOC/withAuth'

const Home = () => {
  // const bookings = [
  //   {
  //     _id: '1',
  //     trackingNo: '1KT7DS08D',
  //     importExport: 'Export',
  //     movementType: 'Port to Port',
  //     departureDate: moment().format('19 Oct'),
  //     arrivalDate: moment().format('19 Oct'),
  //     departureCountry: 'Erdirne-Edirne , Turkey',
  //     destinationCountry: 'Mogadishu , Turkey',
  //     createdBy: 'Mamos Business',
  //     referenceNo: 'Not Provided',
  //   },
  //   {
  //     _id: '2',
  //     trackingNo: '1KT7DS08D',
  //     importExport: 'Export',
  //     movementType: 'Port to Port',
  //     departureDate: moment().format('19 Oct'),
  //     arrivalDate: moment().format('19 Oct'),
  //     departureCountry: 'Erdirne-Edirne , Turkey',
  //     destinationCountry: 'Mogadishu , Turkey',
  //     createdBy: 'Mamos Business',
  //     referenceNo: 'Not Provided',
  //   },
  //   {
  //     _id: '3',
  //     trackingNo: '1KT7DS08D',
  //     importExport: 'Export',
  //     movementType: 'Port to Port',
  //     departureDate: moment().format('19 Oct'),
  //     arrivalDate: moment().format('19 Oct'),
  //     departureCountry: 'Erdirne-Edirne , Turkey',
  //     destinationCountry: 'Mogadishu , Turkey',
  //     createdBy: 'Mamos Business',
  //     referenceNo: 'Not Provided',
  //   },
  // ]
  return (
    <div className='container'>
      <FormContainer>
        <div className='text-center'>
          <h6>Version 1.3 is coming soon</h6>
        </div>
      </FormContainer>
    </div>
    // <div className='row gy-3'>
    //   <div className='d-flex justify-content-between my-4'>
    //     <h1 className='text-primary'>Shipments</h1>
    //     <Link href='/orders/bookings'>
    //       <a className='btn btn-primary btn text-light rounded-pill p-3 my-auto'>
    //         Start booking
    //       </a>
    //     </Link>
    //   </div>
    //   <hr />

    //   <div className='col-lg-6 col-md-4 col-12 me-auto'>
    //     <input
    //       type='search'
    //       className='form-control form-control-lg'
    //       placeholder='Search by seaport, airport, tracking no, etc'
    //     />{' '}
    //   </div>
    //   <div className='col-auto'>
    //     <button className='btn btn-lg btn-primary text-light'>Active</button>
    //   </div>
    //   <div className='col-auto'>
    //     <button className='btn btn-lg btn-outline-primary '>Delivered</button>
    //   </div>
    //   <div className='col-auto'>
    //     <button className='btn btn-lg btn-outline-primary '>Cancelled</button>
    //   </div>
    //   <div className='col-auto'>
    //     <button className='btn btn-lg btn-outline-primary rounded-pill'>
    //       <FaDownload className='mb-1' /> Get Report
    //     </button>
    //   </div>
    //   <hr className='mt-3' />
    //   {bookings?.map((obj) => (
    //     <div key={obj?._id} className='col-12 mt-4'>
    //       <div className='card border-0 bg-light'>
    //         <div className='card-body'>
    //           <div className='d-flex justify-content-between'>
    //             <div>
    //               {obj?.trackingNo} . {obj?.importExport} . {obj?.movementType}
    //             </div>
    //             <div>
    //               <button className='btn btn-secondary btn-sm'>
    //                 Carrier booking confirmed
    //               </button>
    //               <button className='btn btn-info btn-sm ms-2'>
    //                 Tasks due
    //               </button>
    //             </div>
    //           </div>

    //           <div className='d-flex justify-content-between my-3'>
    //             <div>
    //               <span>{obj?.departureDate}</span>
    //               <FaCircle className='mb-1 mx-2' />
    //               <span className='fw-bold'>{obj?.departureCountry}</span>
    //             </div>
    //             <div>
    //               <span>{obj?.arrivalDate}</span>
    //               <FaCircle className='mb-1 mx-2' />
    //               <span className='fw-bold'>{obj?.destinationCountry}</span>
    //             </div>
    //           </div>

    //           <div className='d-flex justify-content-between my-3'>
    //             <div>
    //               <span>Booked By</span>
    //               <h6 className='fw-bold'>{obj?.createdBy}</h6>
    //             </div>
    //             <div>
    //               <span>Reference No.</span>
    //               <h6 className='fw-bold'>{obj?.referenceNo}</h6>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   ))}
    // </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
