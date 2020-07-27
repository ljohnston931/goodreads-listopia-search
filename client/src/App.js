import React, { useState } from 'react'
import Header from './header/Header'
import Search from './search/Search'
import './App.css'
import BookAuthorCombos from './book-author-combos/BookAuthorCombos'
import { set } from 'lodash'
import BookProgress from './book-author-combos/comparison/book-progress/BookProgress'

const App = () => {
    const theIdiot = {
        bookId: 30962053,
        title: 'The Idiot',
        authorId: 39846,
        authorName: 'Elif Batuman',
    }
    const deathlyHallows = 136251
    const infiniteJest = {
        bookId: 6759,
        title: 'Infinite Jest',
        authorId: 4339,
        authorName: 'David Foster Wallace',
    }

    const [queryBooks, setQueryBooks] = useState([])

    return (
        <div className='App'>
            <Header />
            <Search setQueryBooks={setQueryBooks} />
            <BookProgress bookId={6759} />
            <BookAuthorCombos queryBooks={queryBooks} />
        </div>
    )
}

export default App
