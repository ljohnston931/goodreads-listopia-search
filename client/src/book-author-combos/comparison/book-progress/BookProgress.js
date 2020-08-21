import { Line } from 'rc-progress'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Status } from '../../../CONSTANTS'
import _ from 'lodash'
import './book-progress.css'

const BookProgress = props => {
    const [pagesScraped, setPagesScraped] = useState(0)
    const [totalPages, setTotalPages] = useState(-1)
    const [bookLists, setBookLists] = useState([])
    const [bookHasNoLists, setBookHasNoLists] = useState(false)
    const [bookListsAreCached, setBookListsAreCached] = useState(false)
    const BATCH_SIZE = 1

    const checkDatabaseAndScrapeFirstPage = async () => {
        const resp = await axios.get(`/api/cache/lists/${props.bookId}`)
        const inDatabase = resp.data
        if (inDatabase) {
            console.log('in database')
            setPagesScraped(-1)
            setBookListsAreCached(true)
            props.onFinish(Status.Loaded)
        } else {
            console.log('not in database')
            scrapeFirstPageFromGoodreads()
        }
    }

    const scrapeFirstPageFromGoodreads = async () => {
        const firstPageResp = await axios.get(`/api/goodreads/lists/${props.bookId}/pages/${1}`)
        if (firstPageResp.data.totalPages === 0) {
            setTotalPages(1)
            setPagesScraped(1)
            cacheLists([])
        } else {
            setBookLists(firstPageResp.data.lists)
            setTotalPages(firstPageResp.data.totalPages)
            setPagesScraped(1)
        }
    }

    const scrapeAnotherPageFromGoodreads = async () => {
        const pages = _.range(pagesScraped + 1, pagesScraped + 1 + BATCH_SIZE)
        const pageResps = await Promise.all(
            pages.map(page => axios.get(`/api/goodreads/lists/${props.bookId}/pages/${page}`))
        )
        const newBookLists = bookLists.concat(pageResps.flatMap(pageResp => pageResp.data.lists))
        const newPagesScraped = pagesScraped + BATCH_SIZE

        setBookLists(newBookLists)
        setPagesScraped(newPagesScraped)

        if (newPagesScraped >= totalPages) {
            cacheLists(newBookLists)
        }
    }

    const cacheLists = async lists => {
        await axios.post(`/api/cache/lists/${props.bookId}`, { bookLists: lists })
        console.log('cached!')
        props.onFinish(Status.Loaded)
    }

    const handlePagesScrapedChange = async () => {
        if (!bookListsAreCached && pagesScraped > 0 && pagesScraped < totalPages) {
            await scrapeAnotherPageFromGoodreads()
        }
    }

    useEffect(() => {
        checkDatabaseAndScrapeFirstPage().catch(error => {
            console.log(error)
            props.onFinish(Status.Error)
        })
    }, [])

    useEffect(() => {
        handlePagesScrapedChange().catch(error => {
            console.log(error)
            props.onFinish(Status.Error)
        })
    }, [pagesScraped])

    return (
        <div>
            <span>Retrieving lists for {props.title}</span>
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
