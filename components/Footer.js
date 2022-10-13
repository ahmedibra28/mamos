import Image from 'next/image'

const Footer = () => {
  // const date = new Date()
  // const currentYear = date.getFullYear()

  return (
    <footer className='text-primary'>
      <div className='row '>
        <div className='col text-center py-1 footer font-monospace bg-light my-auto'>
          {/* Copyright {currentYear} &copy; All Rights Reserved -  */}
          Developed by{' '}
          <a target='_blank' href='https://ahmedibra.com' rel='noreferrer'>
            Ahmed Ibrahim
          </a>
          <br />
          <Image src='/w-logo.png' width='30' height='30' alt='logo' />
          <span className='ms-3 float-end me-5 pe-5'>version: 1.2</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
