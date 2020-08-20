import React, { useEffect, useState } from 'react'
import BookProgress from '../book-progress/BookProgress'
import axios from 'axios'
import { Status } from '../../../CONSTANTS'

const AuthorProgress = props => {
    const [authorBooks, setAuthorBooks] = useState([])
    const [loadedBooksCount, setLoadedBooksCount] = useState(0)

    const onFinishBook = status => {
        if (status === Status.Error) {
            props.onFinish(Status.Error)
        } else if (status === Status.Loaded) {
            setLoadedBooksCount(prevCount => prevCount + 1)
        }
    }

    const getAuthorBooks = async () => {
        const res = await axios.get(`/api/cache/authors/${props.authorId}/books`)
        setAuthorBooks(res.data)
    }

    useEffect(() => {
        getAuthorBooks()
    }, [props.authorId])

    useEffect(() => {
        if (loadedBooksCount !== 0 && loadedBooksCount === authorBooks.length) {
            props.onFinish(Status.Loaded)
        }
    }, [loadedBooksCount])
    console.log('author books', authorBooks)
    return (
        <div>
            {authorBooks.length === 0 && <div>Retrieving books for {props.authorName}</div>}
            <div>
                {authorBooks.map(authorBook => (
                    <BookProgress
                        title={authorBook.title}
                        bookId={authorBook.bookId}
                        onFinish={onFinishBook}
                    />
                ))}
            </div>
        </div>
    )
}

export default AuthorProgress
