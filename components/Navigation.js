import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { FaSignInAlt, FaPowerOff } from 'react-icons/fa'
import useAuthHook from '../utils/api/auth'
import { useMutation } from 'react-query'
import { useRouter } from 'next/router'
import { customLocalStorage } from '../utils/customLocalStorage'
// import { Access, UnlockAccess } from '../utils/UnlockAccess'

const Navigation = () => {
  const router = useRouter()
  const { postLogout } = useAuthHook()

  const { mutateAsync } = useMutation(postLogout, {
    onSuccess: () => router.push('/auth/login'),
  })

  const logoutHandler = () => {
    mutateAsync({})
  }

  const userInfo =
    typeof window !== 'undefined' && localStorage.getItem('userInfo')
      ? JSON.parse(
          typeof window !== 'undefined' && localStorage.getItem('userInfo')
        )
      : null

  const guestItems = () => {
    return (
      <>
        <ul className='navbar-nav ms-auto'>
          {/* <li className='nav-item'>
            <Link href='/auth/register' className='nav-link' aria-current='page'>
                <FaUserPlus className='mb-1' /> Register
            </Link> 
          </li>
            */}
          <li className='nav-item'>
            <Link href='/auth/login' className='nav-link' aria-current='page'>
              <FaSignInAlt className='mb-1' /> Login
            </Link>
          </li>
        </ul>
      </>
    )
  }

  const user = () => {
    const userInfo =
      customLocalStorage() &&
      customLocalStorage().userInfo &&
      customLocalStorage().userInfo

    return userInfo
  }

  const menus = () => {
    const dropdownItems =
      customLocalStorage()?.userAccessRoutes?.clientPermission?.map(
        (route) => ({
          menu: route.menu,
          sort: route.sort,
        })
      )

    const menuItems =
      customLocalStorage()?.userAccessRoutes?.clientPermission?.map(
        (route) => route
      )

    const dropdownArray = dropdownItems?.filter(
      (item) => item?.menu !== 'hidden' && item?.menu !== 'normal'
    )

    const uniqueDropdowns = dropdownArray?.reduce((a, b) => {
      var i = a.findIndex((x) => x.menu === b.menu)
      return (
        i === -1 ? a.push({ menu: b.menu, ...b, times: 1 }) : a[i].times++, a
      )
    }, [])

    return {
      uniqueDropdowns: uniqueDropdowns?.sort((a, b) => b?.sort - a?.sort),
      menuItems: menuItems?.sort((a, b) => b?.sort - a?.sort),
    }
  }

  useEffect(() => {
    menus()
  }, [])

  const authItems = () => {
    return (
      <>
        <ul className='navbar-nav ms-auto'>
          {menus() &&
            menus().menuItems.map(
              (menu) =>
                menu.menu === 'normal' && (
                  <li key={menu._id} className='nav-item'>
                    <Link
                      href={menu.path}
                      className='nav-link'
                      aria-current='page'
                    >
                      {menu.name}
                    </Link>
                  </li>
                )
            )}

          {menus() &&
            menus().uniqueDropdowns.map((item) => (
              <li key={item?.menu} className='nav-item dropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  id='navbarDropdownMenuLink'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  {item?.menu === 'profile'
                    ? user() && user().name
                    : item?.menu.charAt(0).toUpperCase() +
                      item?.menu.substring(1)}
                </a>
                <ul
                  className='dropdown-menu border-0'
                  aria-labelledby='navbarDropdownMenuLink'
                >
                  {menus() &&
                    menus().menuItems.map(
                      (menu) =>
                        menu.menu === item?.menu && (
                          <li key={menu._id}>
                            <Link href={menu.path} className='dropdown-item'>
                              {menu.name}
                            </Link>
                          </li>
                        )
                    )}
                </ul>
              </li>
            ))}

          <li className='nav-item'>
            <Link
              href='/auth/login'
              className='nav-link'
              aria-current='page'
              onClick={logoutHandler}
            >
              <FaPowerOff className='mb-1' /> Logout
            </Link>
          </li>
        </ul>
      </>
    )
  }

  return (
    <nav className='navbar navbar-expand-sm navbar-dark bg-primary'>
      <div className='container'>
        <Link href='/'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width='90'
            height='auto'
            src='/logo.png'
            className='img-fluid brand-logos'
            alt='logo'
          />
        </Link>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
          aria-controls='navbarNav'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarNav'>
          {userInfo ? authItems() : guestItems()}
        </div>
      </div>
    </nav>
  )
}

export default dynamic(() => Promise.resolve(Navigation), { ssr: false })
