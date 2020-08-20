import React, { useState } from 'react'
import Header from './header/Header'
import Search from './search/Search'
import './App.css'
import BookAuthorCombos from './book-author-combos/BookAuthorCombos'

const App = () => {
    const [queryBooks, setQueryBooks] = useState([])

    return (
        <div className='App'>
            <Header />
            <Search setQueryBooks={setQueryBooks} />
            <BookAuthorCombos queryBooks={queryBooks} />
        </div>
    )
}

export default App
