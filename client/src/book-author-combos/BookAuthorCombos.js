import React, { useState } from 'react'
import Comparison from './comparison/Comparison'
import './book-author-combos.css'

const BookAuthorCombos = props => {
    const [loadedCombosCount, setLoadedCombosCount] = useState(0)

    const incrementLoadedCombos = () => {
        setLoadedCombosCount(prevCount => prevCount + 1)
    }

    const getBookAuthorCombos = queryBooks =>
        queryBooks.reduce((combos, book) => {
            const bookInfo = { bookId: book.bookId, title: book.title }
            const authorInfo = {
                authorId: book.author.id,
                authorName: book.author.name,
            }

            let previousCombos = combos.map(combo => combo)
            if (previousCombos.length) {
                const combosWithNewBookInfo = previousCombos.map(combo => combo.concat(bookInfo))
                const combosWithNewAuthorInfo = previousCombos.map(combo =>
                    combo.concat(authorInfo)
                )

                combos = combosWithNewBookInfo.concat(combosWithNewAuthorInfo)
            } else {
                combos = [[bookInfo], [authorInfo]]
            }
            return combos
        }, [])

    return (
        <section id='book-author-combos'>
            {getBookAuthorCombos(props.queryBooks).map((bookAuthorCombo, comboIndex) => {
                if (comboIndex <= loadedCombosCount) {
                    return (
                        <Comparison
                            key={JSON.stringify(bookAuthorCombo)}
                            bookAuthorCombo={bookAuthorCombo}
                            onFinish={incrementLoadedCombos}
                        />
                    )
                } else {
                    return null
                }
            })}
        </section>
    )
}

export default BookAuthorCombos
