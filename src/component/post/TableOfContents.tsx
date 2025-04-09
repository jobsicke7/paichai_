'use client'

import { useEffect, useState } from 'react'
import styles from './TableOfContents.module.css'

type Heading = {
  id: string
  text: string
  level: number
  index: number
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const container = document.createElement('div')
    container.innerHTML = content

    const elements = container.querySelectorAll('h1, h2, h3')
    const headingList: Heading[] = []
    
    const idCounts: Record<string, number> = {}

    elements.forEach((el, index) => {
      const level = parseInt(el.tagName[1])
      const text = el.textContent || ''
      let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      if (id in idCounts) {
        idCounts[id]++
        id = `${id}-${idCounts[id]}`
      } else {
        idCounts[id] = 0
      }
      
      headingList.push({ id, text, level, index })
    })

    setHeadings(headingList)

    setTimeout(() => {
      const articleContent = document.querySelector('article .body')
      if (articleContent) {
        const headingElements = articleContent.querySelectorAll('h1, h2, h3')
        
        const domIdCounts: Record<string, number> = {}
        
        headingElements.forEach((heading, index) => {
          const text = heading.textContent || ''
          let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          
          if (id in domIdCounts) {
            domIdCounts[id]++
            id = `${id}-${domIdCounts[id]}`
          } else {
            domIdCounts[id] = 0
          }
          
          heading.id = id
        })
      }
    }, 100)
  }, [content])
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const headerOffset = 100 
      const articleContent = document.querySelector('article .body')
      if (!articleContent) return
      const headingElements = Array.from(articleContent.querySelectorAll('h1, h2, h3'))
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const heading = headingElements[i]
        const rect = heading.getBoundingClientRect()
        
        if (rect.top <= headerOffset) {
          setActiveId(heading.id)
          break
        }
      }

      if (window.scrollY < 100 && headingElements.length > 0) {
        setActiveId(headingElements[0]?.id || '')
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      })
      
      history.pushState(null, '', `#${id}`)
      
      setActiveId(id)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className={styles.toc}>
      <h2 className={styles.title}>목차</h2>
      <ul className={styles.list}>
        {headings.map((h) => (
          <li 
            key={`${h.id}-${h.index}`}
            className={`
              ${styles.item} 
              ${styles[`level${h.level}`]} 
              ${activeId === h.id ? styles.active : ''}
            `}
          >
            <a 
              href={`#${h.id}`} 
              onClick={(e) => handleClick(e, h.id)}
              className={activeId === h.id ? styles.activeLink : ''}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}