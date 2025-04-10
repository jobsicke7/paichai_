'use client'
import { useEffect, useState, useRef } from 'react'
import styles from './TableOfContents.module.css'

type Heading = {
  id: string
  text: string
  level: number
}

function generateUniqueIds(headings: Heading[]): Heading[] {
  const counter: Record<string, number> = {}

  return headings.map((heading) => {
    const { text, level } = heading
    const normalized = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    counter[normalized] = (counter[normalized] || 0) + 1
    const id = `${normalized}-${counter[normalized]}`
    return { ...heading, id }
  })
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const scrollLockRef = useRef(false)

  useEffect(() => {
    if (!content) return
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headingElements = doc.querySelectorAll('h1, h2, h3')

    const extracted: Heading[] = []
    headingElements.forEach((el) => {
      const text = el.textContent?.trim() || ''
      const level = parseInt(el.tagName[1])
      extracted.push({ id: '', text, level })
    })

    const withIds = generateUniqueIds(extracted)
    setHeadings(withIds)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const container =
      document.querySelector('.editorContent') ||
      document.querySelector('article') ||
      document.querySelector('.body') ||
      document.body

    if (!container) return

    const headingElements = Array.from(container.querySelectorAll('h1, h2, h3'))
    const textCounter: Record<string, number> = {}

    headings.forEach(({ id, text }) => {
      const normalized = text.trim()
      textCounter[normalized] = (textCounter[normalized] || 0) + 1
      let count = 0

      for (const el of headingElements) {
        if ((el.textContent?.trim() || '') === normalized) {
          count += 1
          if (count === textCounter[normalized]) {
            el.id = id
            break
          }
        }
      }
    })

    setActiveId(headings[0].id)

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        const textCounter: Record<string, number> = {}

        headings.forEach(({ id, text }) => {
          const normalized = text.trim()
          textCounter[normalized] = (textCounter[normalized] || 0) + 1
          let count = 0

          for (const el of headingElements) {
            if ((el.textContent?.trim() || '') === normalized) {
              count += 1
              if (count === textCounter[normalized]) {
                el.id = id
                break
              }
            }
          }
        })
      }, 200)
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      if (scrollLockRef.current) return

      const container =
        document.querySelector('.editorContent') ||
        document.querySelector('article') ||
        document.querySelector('.body') ||
        document.body

      if (!container) return

      const headingElements = Array.from(
        container.querySelectorAll('h1, h2, h3')
      ).filter((el) => headings.some((h) => h.id === el.id)) as HTMLElement[]

      if (headingElements.length === 0) return

      const topOffset = 100
      let currentHeading: HTMLElement | null = null

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const heading = headingElements[i]
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

      setActiveId(currentHeading?.id || '')
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

    scrollLockRef.current = true

    const y = element.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
    history.pushState(null, '', `#${id}`)
    setActiveId(id)

    setTimeout(() => {
      scrollLockRef.current = false
    }, 1000)
  }

  if (headings.length === 0) return null

  return (
    <nav className={styles.toc}>
      <h2 className={styles.title}>목차</h2>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li
            key={heading.id}
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
