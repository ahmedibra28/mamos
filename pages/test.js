// import React from 'react'
// import ReactToPdf from 'react-to-pdf'

// const Test = () => {
//   const ref = React.createRef()

//   const options = {
//     orientation: 'portrait',
//     unit: 'in',
//     format: [11, 8.5],
//   }

//   return (
//     <div>
//       <h1 ref={ref}>Hello</h1>
//       <ReactToPdf
//         targetRef={ref}
//         filename='mamos.pdf'
//         options={options}
//         x={0.5}
//         y={0.5}
//         scale={0.8}
//       >
//         {({ toPdf }) => <button onClick={toPdf}>Generate pdf</button>}
//       </ReactToPdf>
//       <div
//         className='container border border-danger w-100 text-center text-wrap'
//         style={{ width: '100%', height: '100%' }}
//         ref={ref}
//       >
//         <h1 className='text-center'>Hello PDF Generator</h1>
//         <p>
//           Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quia modi
//           fugiat praesentium voluptatum voluptatibus ipsa adipisci officia
//           laborum id mollitia totam rem aliquam magnam libero, sed, eius odio
//           nobis accusantium.
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Test

import React from 'react'
import { jsPDF } from 'jspdf'

const Test = () => {
  const download = () => {
    const doc = new jsPDF()
    const re = 'YO'
    const data = `<h1>Hello ${re}</h1>`

    const text = `
        <div>
        <h1 style={{color: 'red'}}>Test</h1>
        </div>
    `

    doc.text(data, 10, 10)
    doc.save('a4.pdf')
  }

  return (
    <div>
      <button className='btn btn-primary' onClick={download}>
        Download
      </button>
    </div>
  )
}

export default Test
