import { FaSearch } from 'react-icons/fa'

const Search = ({ q, setQ, placeholder, searchHandler }) => {
  return (
    <form onSubmit={searchHandler}>
      <div className='input-group'>
        <input
          type='text'
          className='form-control shadow-none'
          placeholder={placeholder}
          aria-label='Search'
          onChange={(e) => setQ(e.target.value)}
          value={q}
        />
        <div className='input-group-append'>
          <button type='submit' className='btn btn-outline-secondary'>
            <FaSearch />
          </button>
        </div>
      </div>
    </form>
  )
}

export default Search
