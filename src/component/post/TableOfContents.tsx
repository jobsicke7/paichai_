'use client'

import { useEffect, useState, useRef } from 'react'
import styles from './TableOfContents.module.css'

type Heading = {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (!content) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headingElements = doc.querySelectorAll('h1, h2, h3')
    
    const extractedHeadings: Heading[] = []
    const idMap: Record<string, number> = {}
    
    headingElements.forEach((el) => {
      const text = el.textContent || ''
      const level = parseInt(el.tagName[1])
      let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      if (idMap[id]) {
        idMap[id]++
        id = `${id}-${idMap[id]}`
      } else {
        idMap[id] = 1
      }
      
      extractedHeadings.push({ id, text, level })
    })
    
    setHeadings(extractedHeadings)
    isInitialRender.current = true
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const applyIdsToHeadings = () => {
      const contentContainer = 
        document.querySelector('.editorContent') || 
        document.querySelector('article') || 
        document.querySelector('.body') ||
        document.body

      if (!contentContainer) return
      
      const headingElements = contentContainer.querySelectorAll('h1, h2, h3')
      if (headingElements.length === 0) return
      
      const idMap: Record<string, number> = {}

      headingElements.forEach((el, index) => {
        if (index >= headings.length) return

        const headingText = el.textContent || ''

        headings.forEach(heading => {
          if (heading.text === headingText) {
            el.id = heading.id
          }
        })

        if (!el.id) {
          let baseId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-')

          if (idMap[baseId]) {
            idMap[baseId]++
            el.id = `${baseId}-${idMap[baseId]}`
          } else {
            idMap[baseId] = 1
            el.id = baseId
          }
        }
      })

      if (isInitialRender.current && headingElements.length > 0) {
        const firstHeading = headingElements[0] as HTMLElement
        if (firstHeading.id) {
          setActiveId(firstHeading.id)
          isInitialRender.current = false
        }
      }
    }

    setTimeout(applyIdsToHeadings, 500)

    const observer = new MutationObserver(() => {
      setTimeout(applyIdsToHeadings, 200)
    })

    const contentContainer = 
      document.querySelector('.editorContent') || 
      document.querySelector('article') || 
      document.querySelector('.body') ||
      document.body

    if (contentContainer) {
      observer.observe(contentContainer, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }

    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const contentContainer = 
        document.querySelector('.editorContent') || 
        document.querySelector('article') || 
        document.querySelector('.body') ||
        document.body

      if (!contentContainer) return

      const headingElements = Array.from(contentContainer.querySelectorAll('h1, h2, h3')) as HTMLElement[]
      if (headingElements.length === 0) return

      const topOffset = 100
      let currentHeading = null

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const heading = headingElements[i]
        if (!heading.id) continue

        const rect = heading.getBoundingClientRect()
        if (rect.top <= topOffset) {
          currentHeading = heading
          break
        }
      }

      if (!currentHeading && headingElements.length > 0) {
        const firstHeading = headingElements[0]
        const rect = firstHeading.getBoundingClientRect()

        if (rect.top > window.innerHeight) {
          setActiveId('')
          return
        }

        currentHeading = firstHeading
      }

      if (currentHeading && currentHeading.id) {
        setActiveId(currentHeading.id)
      } else {
        setActiveId('')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    setTimeout(handleScroll, 700)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  const handleClickHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (!element) return

    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: 'smooth'
    })

    history.pushState(null, '', `#${id}`)
    setActiveId(id)
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className={styles.toc} ref={contentRef}>
      <h2 className={styles.title}>목차</h2>
      <ul className={styles.list}>
        {headings.map((heading, index) => (
          <li 
            key={`${heading.id}-${index}`}
            className={`
              ${styles.item} 
              ${styles[`level${heading.level}`]} 
              ${activeId === heading.id ? styles.active : ''}
            `}
          >
            <a 
              href={`#${heading.id}`} 
              onClick={(e) => handleClickHeading(e, heading.id)}
              className={activeId === heading.id ? styles.activeLink : ''}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
