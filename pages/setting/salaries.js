import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

import useEmployees from '../../api/employees'
import useSalaries from '../../api/salaries'

const Employee = () => {
  const { getEmployees } = useEmployees()
  const { paySalary } = useSalaries()

  const { data, isLoading, isError, error } = getEmployees

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = paySalary

  const toUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      <Head>
        <title>Payroll</title>
        <meta property='og:title' content='Employee' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>Payment has been done successfully.</Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      <div className='row mt-2'>
        <div className='col-md-4 col-6 me-auto'>
          <h3 className='fw-light font-monospace'>Payroll</h3>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered table-striped caption-top '>
              <caption>{data && data.length} records were found</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Salary</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((employee) => (
                    <tr key={employee._id}>
                      <td>{toUpper(employee.name)}</td>
                      <td>{employee.email}</td>
                      <td>{employee.mobile}</td>
                      <td>{employee.address}</td>
                      <td>${employee.salary.toFixed(2)}</td>
                      <td>
                        {employee.isActive ? (
                          <FaCheckCircle className='text-success mb-1' />
                        ) : (
                          <FaTimesCircle className='text-danger mb-1' />
                        )}
                      </td>

                      <td className='btn-employee'>
                        <button
                          disabled={isLoadingUpdate}
                          className='btn btn-success btn-sm rounded-pill '
                          onClick={() => updateMutateAsync(employee)}
                        >
                          {isLoadingUpdate ? (
                            <span className='spinner-border' />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Employee)), {
  ssr: false,
})
