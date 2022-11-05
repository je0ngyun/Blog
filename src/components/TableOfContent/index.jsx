import React from 'react'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import * as Dom from '../../utils/dom'
import { useState } from 'react'

import './index.scss'

const TableOfContent = ({ toc }) => {
  const [intersectingElement, setIntersectingElement] = useState()

  const onIntersect = async ([entry]) => {
    const {
      target: { id },
    } = entry
    if (entry.isIntersecting) {
      const intersectingElement = Dom.getElement(`a[href*="${encodeURI(id)}"]`)
      setIntersectingElement((prevIntersectingElement) => {
        prevIntersectingElement?.classList.remove('toc-highlight')
        return intersectingElement
      })
    }
  }

  useEffect(() => {
    intersectingElement?.classList.add('toc-highlight')
  }, [intersectingElement])

  useEffect(() => {
    const observer = []
    const headings = Dom.getElement('#markdown').querySelectorAll('h1,h2,h3')
    headings.forEach((elem, idx) => {
      observer[idx] = new IntersectionObserver(onIntersect, {
        threshold: 1,
        rootMargin: '0px 0px -70% 0px',
      })
      observer[idx].observe(elem)
    })
    return () => {
      observer &&
        observer.forEach((obs) => {
          obs.disconnect()
        })
    }
  }, [])

  if (!toc) return <></>

  return (
    <div className="toc-containter">
      <div className="toc-highlight-bar"></div>
      <div className="toc">
        <h3>Table of content</h3>
        <div dangerouslySetInnerHTML={{ __html: toc }}></div>
      </div>
    </div>
  )
}

TableOfContent.defaultProps = {}
TableOfContent.propTypes = {
  toc: PropTypes.string.isRequired,
}

export { TableOfContent }
