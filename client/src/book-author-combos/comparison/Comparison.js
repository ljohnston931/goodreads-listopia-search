import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Message from './Message'
import './comparison.css'
import BookProgress from './book-progress/BookProgress'
import { Status } from '../../CONSTANTS'
import { load } from 'cheerio'

const Comparison = React.memo(props => {
    const [listsInCommon, setListsInCommon] = useState([])
    const [error, setError] = useState(false)
    const [loadedCombosCount, setLoadedCombosCount] = useState(0)

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

    const onFinish = status => {
        if (status === Status.Error) {
            setError(true)
        } else if (status === Status.Loaded) {
            setLoadedCombosCount(prevCount => prevCount + 1)
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
                            onFinish={onFinish}
                        />
                    )
                } else {
                    return null
                }
            })
        } catch (error) {
            setError(true)
        }
    }

    useEffect(() => {
        setError(false)
        setListsInCommon([])
    }, [props.bookAuthorCombos])

    useEffect(() => {
        if (!error && loadedCombosCount === props.bookAuthorCombo.length) {
            getListsInCommon()
                .then(newListsInCommon => {
                    console.log(newListsInCommon)
                    debugger
                    setListsInCommon(newListsInCommon)
                })
                .catch(error => {
                    console.log(error)
                    setError(true)
                })
        }
    }, [loadedCombosCount])

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
