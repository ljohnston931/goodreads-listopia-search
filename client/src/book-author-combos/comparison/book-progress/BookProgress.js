import { Line } from 'rc-progress'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './book-progress.css'

const BookProgress = props => {
    const [pagesScraped, setPagesScraped] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [bookLists, setBookLists] = useState([])

    const scrapeFirstPageFromGoodreads = async () => {
        const firstPageResp = await axios.get(`/api/goodreads/lists/${props.bookId}/pages/${1}`)
        setBookLists(firstPageResp.data.lists)
        setTotalPages(firstPageResp.data.totalPages)
        setPagesScraped(1)
    }

    const scrapeAnotherPageFromGoodreads = async () => {
        const pageResp = await axios.get(
            `/api/goodreads/lists/${props.bookId}/pages/${pagesScraped + 1}`
        )
        setBookLists(bookLists.concat(pageResp.data.lists))
        setPagesScraped(pagesScraped + 1)
    }

    useEffect(() => {
        const inDatabase = false
        if (inDatabase) {
            setPagesScraped(1)
            //props.done()
        } else {
            scrapeFirstPageFromGoodreads()
        }
    }, [])

    useEffect(() => {
        if (pagesScraped && pagesScraped < totalPages) {
            scrapeAnotherPageFromGoodreads()
        }
        // else {
        //     await axios.post(`/api/cache/lists`, { params: lists })
        //     done
        // }
    }, [pagesScraped])

    return (
        <div>
            <span>Retrieving lists for {props.bookId}</span>
            <Line
                percent={(pagesScraped / totalPages) * 100}
                strokeWidth='10'
                trailWidth='5'
                strokeColor='#3d7e9a'
                className='progress-bar'
            />
        </div>
    )
}

export default BookProgress
