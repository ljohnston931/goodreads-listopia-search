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
    const BATCH_SIZE = 1

    const checkDatabaseAndScrapeFirstPage = async () => {
        const resp = await axios.get(`/api/cache/lists/${props.bookId}`)
        const inDatabase = resp.data
        if (inDatabase) {
            console.log('in database')
            setPagesScraped(-1)
            props.onFinish(Status.Loaded)
        } else {
            console.log('not it database')
            scrapeFirstPageFromGoodreads()
        }
    }

    const scrapeFirstPageFromGoodreads = async () => {
        const firstPageResp = await axios.get(`/api/goodreads/lists/${props.bookId}/pages/${1}`)
        setPagesScraped(1)
        if (firstPageResp.data.lists.length === 0) {
            setTotalPages(1)
        } else {
            setBookLists(firstPageResp.data.lists)
            setTotalPages(firstPageResp.data.totalPages)
        }
    }

    const scrapeAnotherPageFromGoodreads = async () => {
        const pages = _.range(pagesScraped + 1, pagesScraped + 1 + BATCH_SIZE)
        const pageResps = await Promise.all(
            pages.map(page => axios.get(`/api/goodreads/lists/${props.bookId}/pages/${page}`))
        )
        setBookLists(bookLists.concat(pageResps.flatMap(pageResp => pageResp.data.lists)))
        setPagesScraped(pagesScraped + BATCH_SIZE)
    }

    const cacheLists = async () => {
        await axios.post(`/api/cache/lists/${props.bookId}`, { bookLists })
        console.log('cached!')
        props.onFinish(Status.Loaded)
    }

    const handlePagesScrapedChange = async () => {
        if (pagesScraped && pagesScraped < totalPages) {
            await scrapeAnotherPageFromGoodreads()
        } else if (pagesScraped && pagesScraped !== -1) {
            await cacheLists()
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
