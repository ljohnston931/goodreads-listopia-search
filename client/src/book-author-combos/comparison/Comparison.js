import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Message from './Message'
import './comparison.css'
import BookProgress from './book-progress/BookProgress'
import { Status } from '../../CONSTANTS'

const Comparison = React.memo(props => {
    const [listsInCommon, setListsInCommon] = useState([])
    const [error, setError] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(new Array(props.bookAuthorCombo.length))

    const listToString = list => {
        if (list.length === 0) {
            return ''
        }
        if (list.length === 1) {
            return list[0]
        }
        if (list.length === 2) {
            return `${list[0]} and ${list[1]}`
        }
        const itemsExceptLast = list.slice(0, -1).join(', ')
        return `${itemsExceptLast}, and ${list[list.length - 1]}`
    }

    const createHeader = bookAuthorCombo => {
        const titleAuthorStrings = bookAuthorCombo.map(queryBook => {
            if (queryBook.bookId) {
                return queryBook.title
            } else {
                return `a book by ${queryBook.authorName}`
            }
        })
        const lengthString = listsInCommon.length ? `(${listsInCommon.length})` : ''
        return `Lists that contain ${listToString(titleAuthorStrings)} ${lengthString}`
    }

    const getListsInCommon = async () => {
        const bookIds = props.bookAuthorCombo.map(book => book.bookId).filter(id => id)
        const authorIds = props.bookAuthorCombo.map(book => book.authorId).filter(id => id)
        const resp = await axios.post('/api/lists/in-common', {
            bookIds: bookIds,
            authorIds: authorIds,
        })
        return resp.data
    }

    const createOnFinish = index => {
        return status => {
            let newLoadingProgress = [...loadingProgress]
            newLoadingProgress[index] = status
            setLoadingProgress(newLoadingProgress)
        }
    }

    const createBookProgressComponents = () => {
        try {
            return props.bookAuthorCombo.map((combo, comboIndex) => {
                if (combo.bookId) {
                    return (
                        <BookProgress
                            title={combo.title}
                            bookId={combo.bookId}
                            onFinish={createOnFinish(comboIndex)}
                        />
                    )
                } else {
                    return null
                }
            })
        } catch (error) {
            debugger
            setError(true)
        }
    }

    useEffect(() => {
        setError(false)
        setListsInCommon([])
    }, [props.bookAuthorCombos])

    useEffect(() => {
        if (loadingProgress.includes(Status.Error)) {
            setError(error)
        } else if (loadingProgress.every(status => status === Status.Loaded)) {
            getListsInCommon()
                .then(newListsInCommon => {
                    setListsInCommon(newListsInCommon)
                })
                .catch(error => {
                    console.log(error)
                    setError(error)
                })
        }
    }, [loadingProgress])

    return (
        <section id='comparison'>
            <div className='comparison-header'>{createHeader(props.bookAuthorCombo)}</div>
            {/* <Message
                loadingStartTime={loadingStartTime}
                error={error}
                numOfResults={listsInCommon.length}
            /> */}
            {error ? <div>Error</div> : createBookProgressComponents()}
            <div className='results'>
                {listsInCommon.map(list => (
                    <div key={list.href}>
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href={`https://www.goodreads.com/${list.href}`}>
                            {list.title}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    )
})

export default Comparison
